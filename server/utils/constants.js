const axios = require('axios');
const Video = require('../models/media/video_model');
const Image = require('../models/media/image_model');
const sendResponse = require("../utils/sendResponse");
const PlatformSession = require('../models/PlatformSession');

const deriveBunnyUrls = (videoId) => ({
      previewAnimationUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/preview.webp`,
      thumbnailUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/thumbnail.jpg`,
      url: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_LIBRARY_ID}/${videoId}`,
      hlsUrl: `https://${process.env.BUNNY_STREAM_ZONE}/${videoId}/playlist.m3u8`
});

const asyncHandler = (fn) => {
      return function (req, res, next) {
            Promise.resolve(fn(req, res, next))
                  .catch((err) => next(err))
      }
}

// validator 
const handleVideoCreation = (data, site, res) => {
      const safeTitle = data.title ? data.title : "Untitled Video";

      if (!data.videoId || !data.libraryId || !data.collectionId || !data.duration || !site) {
            throw new Error("information is missing for creating the video document!");
      }

      const { previewAnimationUrl, thumbnailUrl, url, hlsUrl } = deriveBunnyUrls(data.videoId);
      const cleanTitle = safeTitle.trim().replace(/[^a-zA-Z0-9]/g, "-");

      return new Video({
            title: cleanTitle,
            bunnyVideoId: data.videoId,
            libraryId: data.libraryId,
            collectionId: data.collectionId,
            previewAnimationUrl,
            thumbnailUrl,
            url,
            site,
            hlsUrl,
            duration: data.duration,

            // product
            productId: data.productId,
            productName: data.productName,
            productImage: data.productImage
      });
}

const handleImageCreation = (data, site) => {
      if (!data.bunnyImageId) {
            throw { status: 400, message: "Missing bunnyImageId for image media" };
      }

      if (!site) {
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