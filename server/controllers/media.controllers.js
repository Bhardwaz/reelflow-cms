const Media = require('../models/media/base_model');

// discriminator 
const Video = require('../models/media/video_model');
const Image = require('../models/media/image_model');
const WidgetItem = require("../models/widgetItem")
const JoonWebApi = require('../services/joonwebApi');

// asyncHandler 
const { asyncHandler } = require("../utils/constants")
const { handleImageCreation } = require("../utils/constants")
const { handleVideoCreation } = require("../utils/constants")

// importing response structure
const sendResponse = require("../utils/sendResponse")
const multer = require('multer');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

// 1. Import the client we created in Step 1
const { s3Client } = require("../utils/aws_sdk");
const { default: mongoose } = require('mongoose');

const deriveBunnyUrls = (videoId) => ({
    previewAnimationUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/preview.webp`,
    thumbnailUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/thumbnail.jpg`,
    url: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}`
});

// 2. Configure Multer
const upload = multer({ dest: 'uploads/' });

exports.createImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return sendResponse.error(res, "NO_FILE", "Please upload a file", 400);
    }

    const fileStream = fs.createReadStream(req.file.path);
    const fileName = `images/${Date.now()}-${req.file.originalname}`;

    console.log("Proxying upload to BunnyCDN...");

    // Upload to Bunny
    const command = new PutObjectCommand({
        Bucket: process.env.BUNNY_STORAGE_NAME, 
        Key: fileName,
        Body: fileStream,
        ContentType: req.file.mimetype,
    });

    try {
        await s3Client.send(command); // This will work now!
    } catch (err) {
        console.error("Bunny S3 Error:", err);
        throw err; // Pass to global error handler
    }

    fs.unlinkSync(req.file.path);

    const publicUrl = `https://${process.env.BUNNY_PULL_ZONE}.b-cdn.net/${fileName}`;
    
    let newMedia = handleImageCreation(req.body)
    await newMedia.save()

    return sendResponse.success(res, { 
        url: publicUrl,
        bunnyImageId: fileName 
    }, "Image uploaded successfully", 200);
});

// 4. Export the middleware
exports.uploadMiddleware = upload.single('file');

exports.getLibrary = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, search } = req.query;

    const site = req.session.site;

    if (!site) {
        return sendResponse.error(res, "UNAUTHORIZED", "Session not found", 401);
    }

    // 1. Build the Filter
    const filter = { site: site };

    // Handle Type Filter (Image vs Video)
    if (type) {
        // Mongoose stores discriminators as "Image" or "Video" (Capitalized).
        // We ensure we match that format even if frontend sends "image".
        const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        filter.mediaType = formattedType;
    }

    // Handle Search (Optional but recommended for Libraries)
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { productName: { $regex: search, $options: 'i' } }
        ];
    }

    // 2. Run Query and Count in Parallel (Faster)
    const [media, totalDocs] = await Promise.all([
        Media.find(filter)
            .sort({ createdAt: -1 }) // Newest first
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(), // Performance optimization: returns plain JSON objects, not Mongoose Docs

        Media.countDocuments(filter) // Get the REAL total count for pagination
    ]);

    // 3. Send Response
    return sendResponse.success(res, media, {
        totalDocs,
        limit: limit * 1,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page * 1
    }, 200);
});

exports.createVideo = asyncHandler(async (req, res) => {
    const { mediaType } = req.body;
    const site = req.session.site

    let newMedia;

    if (mediaType === 'Video') {
        newMedia = handleVideoCreation(req.body, site);
    } else {
        return res.status(400).json({ message: "Invalid media type" });
    }

    await newMedia.save();

    return sendResponse.success(res, newMedia, "Media added to Library successfully", 201);
});

exports.removeMediaFromWidget = asyncHandler(async (req, res) => {
    const { widgetId, mediaId } = req.params
    const site = req.session.site

    if(!site){
        return sendResponse.error(res, "SITE_NOT_FOUND", "Could not get site", 404);
    }

    console.log(widgetId, mediaId, "widget id and media id")

    if (!mongoose.Types.ObjectId.isValid(widgetId) || !mongoose.Types.ObjectId.isValid(mediaId)) {
        return sendResponse.error(res, "INVALID_REQUEST", "Invalid Widget ID or Media ID", 401);
    }

    const deletedItem = await WidgetItem.findOneAndDelete({ widgetId, mediaId, site })

    if (!deletedItem) {
        return sendResponse.error(res, "NOT_FOUND", "Media not found in this widget", 404);
    }

    // await WidgetItem.updateMany(
    //     {
    //         widgetId, site, sortOrder: { $gt: deletedItem.sortOrder },
    //     }, 
    //     { $inc: { sortOrder: -1 }}
    // )

    return sendResponse.success(res, null, "Video removed from widget successfully", 200);
})

exports.getProducts = async (req, res) => {
  try {
    const access_token = req.accessToken || req.session.access_token
    const site = req.session.site

    if(!access_token || !site){
      return sendResponse.error(res, "SESSION_ERROR", "session not found for fetching site data", 401)
    }

    const api_version = process.env.API_VERSION || '26.0'

    const api = new JoonWebApi(
      access_token,
      site,
      api_version
    )

    const response = await api.request("products.json")

    return sendResponse.success(res, { products: response.products }, { message: "Products fetched successfully" }, 200)
  } catch (err) {
    return sendResponse.error(res, "JOONWEB_API_ERROR", err.message, err.response?.status || 500)
  }
}