const axios = require('axios')
const Reel = require("../models/reel_model");
require('dotenv').config()
const { asyncHandler } = require('../utils/constants')
const sendResponse = require('../utils/sendResponse');

const fetchProductsByIds = require('../services/fetchProductsById');
const processInBatches = require('../services/processInBatches');

const productsCache = new Map();

const deriveBunnyUrls = (videoId) => ({
  previewAnimationUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/preview.webp`,
  thumbnailUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/thumbnail.jpg`,
  videoUrl: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}`
});


const createReel = asyncHandler(async (req, res) => {
  const { videoId, title, groupIds, status } = req.body;

  if (!videoId || !title || !groupIds || !status) {
    return sendResponse.error(res, "MISSING_FIELDS", "videoId, title, groupIds and status are required", 400)
  }

  if (title.length < 3) {
    return sendResponse.error(
      res,
      "INVALID_TITLE",
      "Title must be at least 3 characters",
      400
    );
  }

  const { previewAnimationUrl, thumbnailUrl, videoUrl } = deriveBunnyUrls(videoId);

  const reel = await Reel.create({
    title,
    bunnyVideoId: videoId,
    libraryId: process.env.BUNNY_LIBRARY_ID,
    videoUrl,
    videoStatus: status,
    group: groupIds,
    previewAnimationUrl,
    thumbnailUrl
  });

  sendResponse.success(res, reel, {}, 201);
}
)

const getReels = asyncHandler(async (req, res) => {
  const reels = await Reel.find()

  const productsIds = [
    ...new Set(
      reels?.map(r => r.productId).filter(Boolean)
    )
  ]
  const results = await processInBatches(productsIds, 5, fetchProductsByIds);
  
  const productsWithKeys = {}

  results?.forEach(r => {
    if(r && r.id) {
      productsWithKeys[r.id] = r
    }
  })

  sendResponse.success(res, { reels, products: productsWithKeys }, {}, 200)
}
)

const deleteReel = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  if (!_id || _id === 'undefined') {
    return sendResponse.error(res, "MISSING_ID", "Reel _id is required", 400);
  }

  const reel = await Reel.findById(_id);

  if (!reel) {
    return sendResponse.error(res, "NOT_FOUND", "Reel not found in database", 404);
  }

  const bunnyVideoId = reel?.bunnyVideoId;

  console.log(bunnyVideoId, "bunny video id")

  if (!bunnyVideoId) {
    return sendResponse.error(res, "MISSING_BUNNY_ID", "This reel has no associated Bunny Video ID", 400);
  }

  try {
    // 3. Attempt to delete from Bunny CDN first
    const bunnyDelete = await axios.delete(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}`,
      {
        headers: {
          AccessKey: process.env.BUNNY_STREAM_API_KEY
        }
      }
    );

    // 4. If we reach here, Bunny deletion was successful. Now delete from MongoDB.
    const deletedReel = await Reel.findByIdAndDelete(_id);

    return sendResponse.success(res, deletedReel, { message: "Deleted from Bunny and Database" }, 200);

  } catch (error) {
    // Check if the video was already gone from Bunny (404)
    // If it's already gone, we should probably allow the DB deletion to finish
    if (error.response?.status === 404) {
      const deletedReel = await Reel.findByIdAndDelete(_id);
      return sendResponse.success(res, deletedReel, { message: "Video already missing from Bunny; record removed from DB" }, 200);
    }

    // Otherwise, something went wrong (Auth error, Network error, etc.)
    console.error("Bunny Deletion Error:", error.response?.data || error.message);

    return sendResponse.error(
      res,
      "EXTERNAL_ERROR",
      `Could not delete from Bunny: ${error.response?.data?.Message || "Bunny API error"}`,
      error.response?.status || 500
    );
  }
});


const editReel = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { title, groups, videoStatus, productId, hasProduct } = req.body;

  console.log(_id, title, groups, videoStatus, productId)

  if (!_id) {
    return sendResponse?.error(res, "MISSING_REEL_ID", "reel id is not valid", 400)
  }

  const update = {};

  if (typeof title === "string") {
    update.title = title;
  }

  if (hasProduct) {
    update.hasProduct = true
  }

  if (productId) {
    update.productId = productId
  }

  // groups overwrite (source of truth)
  if (Array.isArray(groups)) {
    update.group = [...new Set(groups)];
  }

  if (["published", "private"].includes(videoStatus)) {
    update.videoStatus = videoStatus;
  }

  const edited = await Reel.findByIdAndUpdate(
    _id,
    { $set: update },
    { new: true }
  );

  if (!edited) {
    return res.status(404).json({
      success: false,
      message: "Reel not found"
    });
  }

  sendResponse.success(res, { reel: edited }, {}, 200)
})


module.exports = { createReel, getReels, deleteReel, editReel };