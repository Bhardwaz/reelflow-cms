const sendResponse = require("./sendResponse")
const axios = require('axios')
const crypto = require("crypto");
const { checkLimits } = require("../middleware/checkLimits");

const videoRequestToBunny = async (req, res) => {
  const site = req.session.site
  if (!site) {
    return sendResponse.error(res, "SITE_NOT_FOUND", "session is not available", 403)
  }

  let userPlan = "free"
   
  try {
    await checkLimits(site, userPlan, 'Media');
  } catch (limitError) {
    return sendResponse.error(res, "PLAN_LIMIT_REACHED", limitError.message, 403);
  }

  try {
    const { title } = req.body;

    // TODO ---
    // const { fileSize } = req.body
    // if (!fileSize) return sendResponse.error(res, "INVALID_DATA", "File size required", 400);
    // const fileSizeMB = fileSize / (1024 * 1024);
    // const sizeLimit = config.limits.maxVideoSizeMB;

    //     if (fileSizeMB > sizeLimit) {
    //         return sendResponse.error(
    //             res, 
    //             "FILE_TOO_LARGE", 
    //             `File is ${fileSizeMB.toFixed(1)}MB. Your plan limit is ${sizeLimit}MB.`, 
    //             403
    //         );
    //     }

    // const LibraryId = process.env.BUNNY_LIBRARY_ID
    // const CollectionId = process.env.BUNNY_COLLECTION_ID
    // const API_KEY = process.env.BUNNY_STREAM_API_KEY

    const { libraryId, apiKey } = isLibraryForUpload(site)

    if (!title || title.trim().length < 3) {
      return sendResponse.error(
        res,
        "INVALID_TITLE",
        "Title must be at least 3 characters",
        400
      );
    }

    const bunnyRes = await axios.post(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        title,
        collectionId: CollectionId,
      },
      {
        headers: {
          AccessKey: apiKey,
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

    console.log(signature, "signature of cerdentials ")

    sendResponse.success(
      res,
      {
        LibraryId,
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