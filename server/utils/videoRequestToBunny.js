const sendResponse = require("./sendResponse")
const axios = require('axios')
const crypto = require("crypto")

const videoRequestToBunny = async (req, res) => {
  try {
    const site = req.session.site
    if(!site){
     return sendResponse.error(res, "SITE_NOT_FOUND", "session is not available", 403)
    }

    const LibraryId = process.env.BUNNY_LIBRARY_ID
    const CollectionId = process.env.BUNNY_COLLECTION_ID
    const API_KEY= process.env.BUNNY_STREAM_API_KEY

    const { title } = req.body;

    if (!title || title.trim().length < 3) {
      return sendResponse.error(
        res,
        "INVALID_TITLE",
        "Title must be at least 3 characters",
        400
      );
    }

    const bunnyRes = await axios.post(
      `https://video.bunnycdn.com/library/${LibraryId}/videos`,
      {
        title,
        collectionId: CollectionId,
      },
      {
        headers: {
          AccessKey: API_KEY ,
          "Content-Type": "application/json",
        },
      }
    );

    const videoId = bunnyRes?.data?.guid;

    if (!videoId) {
      return sendResponse.error(
        res,
        "BUNNY_INVALID_RESPONSE",
        "Video ID not received",
        502
      );
    }

    // generating the signature 
    const expirationTime = Math.floor(Date.now() / 1000) + 3600
    const dataToSign = LibraryId + API_KEY + expirationTime + videoId
    const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

    sendResponse.success(
      res,
      {
        videoId,
        uploadUrl: `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,

        authorizationSignature: signature,
        authorizationExpire: expirationTime,
      },
      {},
      201
    );
  } catch (err) {
    console.log(err)
    return sendResponse.error(
      res,
      "BUNNY_ERROR",
      err?.response?.data?.message || "Failed to init upload",
      502
    );
  }
};

module.exports = videoRequestToBunny