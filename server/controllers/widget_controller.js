const mongoose = require('mongoose');
const { Media, Widget, WidgetItem, Carousel, Story, Pip } = require('../models');
const { asyncHandler } = require('../utils/constants');
const sendResponse = require('../utils/sendResponse');
const processInBatches = require('../services/processInBatches');
const fetchProductsByIds = require('../services/fetchProductsById');

exports.createWidget = asyncHandler(async (req, res) => {
    const site = req.session.site

    if (!site) {
        return sendResponse.error(res, "SITE_NOT_FOUND", "Session not found", 401)
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            selectedWidget,
            selectedMediaIds,
            selectedPage,
            ...config
        } = req.body;

        if (!selectedWidget || !selectedPage) {
            throw new Error("Missing required fields: selectedWidget or selectedPage.");
        }

        if (!selectedMediaIds || !Array.isArray(selectedMediaIds) || selectedMediaIds.length === 0) {
            throw new Error("You must select at least one video/image.");
        }

        const selectedMedia = await Media.find({
            _id: { $in: selectedMediaIds },
            site: site
        }).select('mediaType').session(session);

        if (selectedMedia.length !== selectedMediaIds.length) {
            throw new Error("One or more videos are invalid or do not belong to you.");
        }

        const formattedName = `${selectedWidget} - ${selectedPage.replace(/_/g, ' ').toUpperCase()}`;

        const typeKey = selectedWidget.toLowerCase()
        let newWidget

        // case 1 - carousel

        if (typeKey.includes('carousel')) {
            const hasImage = selectedMedia.some(m => m.mediaType === 'Image')
            if (hasImage) throw new Error("Carousel widgets can only contain Videos.");

            newWidget = new Carousel({
                name: formattedName,
                page: selectedPage,
                widgetType: 'Carousel',
                previewAnimation: true,
                site: site,
                ...config
            });
        }
        else if (typeKey.includes('story') || typeKey.includes('stories')) {
            newWidget = new Story({
                name: formattedName,
                page: selectedPage,
                site: site,
                widgetType: 'Story',
                label: "Watch",
                coverImage: "default.jpg",
                ...config
            });
        }

        else if (typeKey.includes('pip') || typeKey.includes('floating')) {
            // Rule 1: Must be exactly ONE item
            if (selectedMediaIds.length > 1) {
                throw new Error("Floating widgets can only have ONE video.");
            }

            if (selectedMedia[0].mediaType === 'Image') {
                throw new Error("Floating widgets must be a Video.");
            }

            newWidget = new Pip({
                name: formattedName,
                page: selectedPage,
                site: site,
                widgetType: 'Pip',
                position: 'bottom-right',
                ...config
            });
        } else {
            throw new Error(`Unknown widget type: ${selectedWidget}`);
        }

        await newWidget.save({ session });

        const pivotItems = selectedMediaIds.map((mediaId, index) => ({
            widgetId: newWidget._id,
            mediaId: mediaId,
            sortOrder: index,
            site: site
        }));

        await WidgetItem.insertMany(pivotItems, { session })

        await session.commitTransaction()

        return sendResponse.success(res, newWidget, "Widget Created Successfully", 201)

    } catch (error) {
        await session.abortTransaction();
        console.error("Create Widget Error:", error);
        return sendResponse.error(res, "CREATE_FAILED", error.message, 400);
    } finally {
        session.endSession();
    }
});

exports.attachMediaToWidget = asyncHandler(async (req, res) => {
    const site = req.session.site

    if (!site) {
        return sendResponse.error(res, "SITE_NOT_FOUND", "Session not found", 401)
    }

    const { widgetId, mediaIds } = req.body;

    // 1. Validation
    if (!widgetId || !Array.isArray(mediaIds) || mediaIds.length === 0) {
        throw new Error("Please provide a widgetId and an array of mediaIds.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // if widget exists for this site or not 
        const widgetExists = await Widget.exists({ _id: widgetId, site: site }).session(session);
        if (!widgetExists) {
            throw new Error("Widget not found or access denied.");
        }

        const validMediaCount = await Media.countDocuments({
            _id: { $in: mediaIds },
            site: site
        }).session(session)

        if (validMediaCount !== mediaIds.length) {
            throw new Error("One or more videos are invalid or do not belong to you.");
        }

        const lastItem = await WidgetItem.findOne({ widgetId, site })
            .sort({ sortOrder: -1 }) // Get the highest number
            .session(session);

        let currentOrder = lastItem ? lastItem.sortOrder + 1 : 0;

        // 3. Prepare the Data for Bulk Insertion
        const linksToCreate = mediaIds.map((mediaId) => {
            const link = {
                widgetId: widgetId,
                mediaId: mediaId,
                sortOrder: currentOrder,
                site: site
            };
            currentOrder++; // Increment for the next video in the loop
            return link;
        });

        // 4. Bulk Insert (More efficient than looping create)
        // 'ordered: false' ensures that if one fails (e.g., duplicate), the others still succeed.
        const newItems = await WidgetItem.insertMany(linksToCreate, { session, ordered: false });

        await session.commitTransaction();

        return sendResponse.success(res, newItems, "Media attached successfully", 200);

    } catch (error) {
        await session.abortTransaction();

        // Handle Duplicate Error specifically
        // Error code 11000 means "This video is already in this widget"
        if (error.code === 11000) {
            // You might want to return success even if duplicate, 
            // or return a specific warning. 
            return sendResponse.error(res, "DUPLICATE_MEDIA", "Some videos were already in this widget.", 409);
        }

        throw error;
    } finally {
        session.endSession();
    }
});

exports.getAllWidgets = asyncHandler(async (req, res) => {
    const site = req.session.site
    if (!site) return sendResponse.error(res, "UNAUTHORIZED", "Session not found", 401);

    const widgets = await Widget.find({ site: site })
        .sort({ createdAt: -1 }) // newest first 
        .populate({
            path: 'items',
            match: { site: site },
            options: { sort: { sortOrder: 1 } },
            populate: {
                path: 'mediaId',
                model: 'Media',
                select: 'title thumbnailUrl url mediaType productName productImage isLive'
            }
        })

    const sanitizedWidgets = widgets.map(widget => {
        const cleanItems = widget.items.filter(item => item.mediaId !== null)
        return {
            ...widget.toObject(),
            items: cleanItems
        }
    })

    return sendResponse.success(res, sanitizedWidgets, "Widgets fetched successfully", 200);
})

exports.getWidgetWithProducts = asyncHandler(async (req, res) => {
    const { page } = req.query

    if (!page) {
        return sendResponse.error(res, "BAD_REQUEST", "Page Type is required", 400);
    }

    const widget = await Widget.findOne({
        page: page,
        isLive: true,
        integrate: true,
    }).populate({
        path: 'items',
        populate: {
            path: 'mediaId',
            select: 'url thumbnailUrl previewAnimationUrl productId productName'
        }   
    }).lean()

    if (!widget) {
        return sendResponse.success(res, null, "No active widget found for this page", 200);
    }

    const productsIds = [...new Set(widget.items.map(item => item.mediaId.productId).filter(id => id))]

    const results = await processInBatches(productsIds, 5, fetchProductsByIds);

    const productsWithKeys = {}

    console.log(results, "results of joonweb apis")

    results?.forEach(r => {
        if (r && r.id) {
            productsWithKeys[r.id] = r
        }
    })

    const populatedItems = widget.items.map((item) => {
        // handle if mediaId is null (deleted video)
        if (!item.mediaId) return null;
        const media = item.mediaId
        const pid = media.productId

        const finalProduct = productsWithKeys[pid] || (pid ? {
            id: pid,
            title: media.productName || "Product",
            price: "Check Website", // Fallback if API fails
            image: null // You might want a default placeholder here
        } : null);

        return {
            _id: item._id,
            sortOrder: item.sortOrder,
            widgetId: item.widgetId,

            videoUrl: media.url,
            thumbnailUrl: media.thumbnailUrl,
            previewAnimationUrl: media.previewAnimationUrl,

            productId: pid,
            productName: media.productName,

            product: finalProduct
        };
    }).filter(item => item !== null);

    const finalResponse = {
        widget,
        items: populatedItems
    };

    return sendResponse.success(res, finalResponse, "Widget loaded with products", 200);

})

exports.deleteWidget = asyncHandler(async (req, res) => {
    const site = req.session.site

    if(!site) {
        return sendResponse.error(res, "INVALID_SESSION", "session not found", 401)
    }

    const { widgetId } = req.params

    if (!mongoose.Types.ObjectId.isValid(widgetId)) {
        return sendResponse.error(res, "INVALID_ID", "Invalid Widget ID format", 400);
    }

    await WidgetItem.deleteMany({ widgetId: widgetId, site: site })

    const deletedWidget = await Widget.findOneAndDelete({ _id: widgetId, site: site })

    if (!deletedWidget) {
        return sendResponse.error(res, "NOT_FOUND", "Widget not found or access denied", 404);
    }

    return sendResponse.success(res, null, "Widget and all its contents deleted successfully", 200);
})