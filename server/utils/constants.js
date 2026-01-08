const axios = require('axios');
const Video = require('../models/media/video_model');
const Image = require('../models/media/image_model');
const sendResponse = require("../utils/sendResponse")

const deriveBunnyUrls = (videoId) => ({
      previewAnimationUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/preview.webp`,
      thumbnailUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/thumbnail.jpg`,
      url: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}`
});

const asyncHandler = (fn) => {
      return function (req, res, next) {
            Promise.resolve(fn(req, res, next))
                  .catch((err) => next(err))
      }
}

// validator 
const handleVideoCreation = (data, site) => {
      if (!data.videoId) {
            throw { status: 400, message: "Missing videoId for video media" };
      }

      if(!site) {
            return sendResponse.error(res, "MISSING_SITE", "site not found is session", 404)
      }

      const { previewAnimationUrl, thumbnailUrl, url } = deriveBunnyUrls(data.videoId);

      return new Video({
            title: data.title,
            bunnyVideoId: data.videoId,
            libraryId: process.env.BUNNY_LIBRARY_ID,
            previewAnimationUrl,
            thumbnailUrl,
            url,
            site,

            // product
            productId: data.productId,
            productName: data.productName,
      });
}

const handleImageCreation = (data, site) => {
      if (!data.bunnyImageId) {
            throw { status: 400, message: "Missing bunnyImageId for image media" };
      }

      if(!site) {
            return sendResponse.error(res, "MISSING_SITE", "site not found is session", 404)
      }

      return new Image({
            mediaType: 'Image',
            url: data.url, // Base Schema Field
            title: data.title,

            // Image Specifics
            altText: data.altText || data.title,
            width: data.width,
            height: data.height,
            site,

            // Product Data
            productId: data.productId,
            productName: data.productName,
            productImageUrl: data.productImageUrl
      });
}

module.exports = { asyncHandler, handleVideoCreation, handleImageCreation }