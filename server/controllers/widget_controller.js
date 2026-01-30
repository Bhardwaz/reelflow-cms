const mongoose = require('mongoose');
const { Media, Widget, WidgetItem, Carousel, Story, Pip } = require('../models');
const { asyncHandler } = require('../utils/constants');
const sendResponse = require('../utils/sendResponse');
const processInBatches = require('../services/processInBatches');
const fetchProductsByIds = require('../services/fetchProductsById');
const PlatformSession = require('../models/PlatformSession');
const { checkLimits } = require('../middleware/checkLimits');

exports.createWidget = asyncHandler(async (req, res) => {
    const site = req.session.site

    if (!site) {
        return sendResponse.error(res, "SITE_NOT_FOUND", "Session not found", 401)
    }

    const { selectedWidget } = req.body
    // let userPlan = 'free'

    // try {
    //     await checkLimits(site, userPlan, 'Widget')
    // } catch (error) {
    //     return sendResponse.error(res, "PLAN_LIMIT_REACHED", error.message, 403);
    // }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            selectedWidget,
            selectedMediaIds,
            heading,
            ...config
        } = req.body;

        if (!selectedWidget || !heading) {
            throw new Error("Missing required fields: selectedWidget or heading.");
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

        const formattedName = heading || `${selectedWidget} Widget`;

        const typeKey = selectedWidget.toLowerCase()
        let newWidget

        // case 1 - carousel

        if (typeKey.includes('carousel')) {
            const hasImage = selectedMedia.some(m => m.mediaType === 'Image')
            if (hasImage) throw new Error("Carousel widgets can only contain Videos.");

            newWidget = new Carousel({
                name: formattedName,
                heading,
                widgetType: 'Carousel',
                previewAnimation: true,
                site: site,
                ...config
            });
        }
        else if (typeKey.includes('story') || typeKey.includes('stories')) {
            newWidget = new Story({
                name: formattedName,
                heading,
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
                heading,
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

exports.toggleLive = asyncHandler(async (req, res) => {
    const { widgetId } = req.params;
    if (!widgetId) return sendResponse.error(res, "NO_WIDGET", "provide an widget to go live", 400);

    const widget = await Widget.findById(widgetId)
    if (!widget) return sendResponse.error(res, "WIDGET_NOT_FOUND", "can not find any widget for this id", 404);

    widget.isLive = !widget.isLive;
    widget.integrate = true;
    await widget.save();

    const message = widget.isLive ? "Widget is now Live" : "Widget is turned Off";
    return sendResponse.success(res, widget, message, 200);
})

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
                select: 'title thumbnailUrl url mediaType productName productImage isLive productImage isDeleted'
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
    const { site, widgetType } = req.query;

    if (!site) {
        return sendResponse.error(res, "BAD_REQUEST", "site is required", 400);
    }

    const isExist = await PlatformSession.findOne({ site_domain: site });
    const access_token = isExist?.access_token;

    let carouselDoc = await Carousel.findOne({
        site,
        isLive: true,
        integrate: true,
        widgetType: "Carousel",
    }).populate({
        path: 'items',
        populate: {
            path: 'mediaId',
            select: 'url thumbnailUrl previewAnimationUrl productId productName hlsUrl carouselSettings'
        }
    });

    let widgetPipDoc = await Widget.findOne({
        site,
        isLive: true,
        integrate: true,
        widgetType: "Pip",
    }).populate({
        path: 'items',
        populate: {
            path: 'mediaId',
            select: 'url thumbnailUrl previewAnimationUrl productId productName hlsUrl pipSettings'
        }
    });

    if (!carouselDoc && !widgetPipDoc) {
        return sendResponse.success(res, null, "No active widget found for this page", 200);
    }

    const carousel = carouselDoc ? carouselDoc.toObject({ virtuals: true }) : null;
    const widgetPip = widgetPipDoc ? widgetPipDoc.toObject({ virtuals: true }) : null;

    const carouselProductIds = carousel?.items
        ? [...new Set(carousel.items.map(item => String(item.mediaId?.productId)).filter(id => id))]
        : [];

    const pipProductIds = widgetPip?.items
        ? [...new Set(widgetPip.items.map(item => String(item.mediaId?.productId)).filter(id => id))]
        : [];

    const [carouselProducts, pipProducts] = await Promise.all([
        Promise.all(carouselProductIds.map(id => fetchProductsByIds(id, site, access_token))),
        Promise.all(pipProductIds.map(id => fetchProductsByIds(id, site, access_token)))
    ]);

    const carouselProductsWithKeys = {};
    carouselProducts.forEach(product => {
        if (product && product.id) {
            carouselProductsWithKeys[String(product.id)] = product;
        }
    });

    const pipProductsWithKeys = {};
    pipProducts.forEach(product => {
        if (product && product.id) {
            pipProductsWithKeys[String(product.id)] = product;
        }
    });

    if (carousel?.items) {
        carousel.items.forEach(item => {
            if (item.mediaId && item.mediaId.productId) {
                const pId = String(item.mediaId.productId);
                if (carouselProductsWithKeys[pId]) {
                    item.mediaId.productJSON = carouselProductsWithKeys[pId];
                }
            }
        });
    }

    if (widgetPip?.items) {
        widgetPip.items.forEach(item => {
            if (item.mediaId && item.mediaId.productId) {
                const pId = String(item.mediaId.productId);
                if (pipProductsWithKeys[pId]) {
                    item.mediaId.productJSON = pipProductsWithKeys[pId];
                }
            }
        });
    }

    return sendResponse.success(res, {
        Carousel: carousel,
        Pip: widgetPip
    }, "Widget loaded with products", 200);
});

exports.deleteWidget = asyncHandler(async (req, res) => {
    const site = req.session.site

    if (!site) {
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

exports.carouselCardsSettings = asyncHandler(async (req, res) => {
    const { widgetId } = req.params;
    const site = req.session.site;
    
    const incomingData = req.body;
    
    console.log(incomingData)

    if (!site || !widgetId) {
        return sendResponse.error(res, "BAD_REQUEST", "Missing ID or Session", 400);
    }

    const Carousel = mongoose.model('Carousel');
    const widget = await Carousel.findOne({ _id: widgetId, site });
    
    if (!widget) {
        return sendResponse.error(res, "NOT_FOUND", "Widget not found", 404);
    }

    widget.carouselSettings = incomingData
      
    widget.markModified('carouselSettings');
    
    await widget.save();

    return sendResponse.success(res, "Card settings updated successfully", {
        settings: widget.carouselSettings
    });
});

exports.pipSettings = asyncHandler(async (req, res) => {
    const { widgetId } = req.params;
    const site = req.session.site;
    
    const incomingData = req.body;

    console.log(widgetId, site, incomingData, "data coming from frontend ")
    
    if (!site || !widgetId) {
        return sendResponse.error(res, "BAD_REQUEST", "Missing ID or Session", 400);
    }

    const Pip = mongoose.model('Pip');
    const widget = await Pip.findOne({ _id: widgetId, site });
    
    if (!widget) {
        return sendResponse.error(res, "NOT_FOUND", "Widget not found", 404);
    }

    widget.pipSettings = incomingData
      
    widget.markModified('pipSettings');
    
    await widget.save();

    return sendResponse.success(res, "Card settings updated successfully", {
        settings: widget.pipSettings
    });
})