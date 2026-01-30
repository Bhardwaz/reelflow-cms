const sendResponse = require("./sendResponse")
const axios = require('axios')
const crypto = require("crypto");
const { checkLimits } = require("../middleware/checkLimits");
const PlatformSession = require("../models/PlatformSession");

const videoRequestToBunny = async (req, res) => {
  const site = req.session.site

  console.log(site, "site inside video request to bunny");

  if (!site) {
    return sendResponse.error(res, "SITE_NOT_FOUND", "session is not available", 403)
  }

  // let userPlan = "free"

  // try {
  //   await checkLimits(site, userPlan, 'Media');
  // } catch (limitError) {
  //   return sendResponse.error(res, "PLAN_LIMIT_REACHED", limitError.message, 403);
  // }

  console.log("coming here")

try {
    const { title, fileSizeMB, } = req.body;

    if (!title || title.trim().length < 3) {
      return sendResponse.error(
        res,
        "INVALID_TITLE",
        "Title must be at least 3 characters",
        400
      );
    }

    // if (!fileSizeMB) return sendResponse.error(res, "INVALID_DATA", "File size required", 400);
    // const sizeLimit = config.limits.maxVideoSizeMB;

    // if (fileSizeMB > sizeLimit) {
    //   return sendResponse.error(
    //     res,
    //     "FILE_TOO_LARGE",
    //     `File is ${fileSizeMB.toFixed(1)}MB. Your plan limit is ${sizeLimit}MB.`,
    //     403
    //   );
    // }

    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    console.log(libraryId, apiKey);

    const siteDoc = await PlatformSession.findOne({ site_domain: site });
    let collectionId = siteDoc?.bunnyCollectionId;

    if (!collectionId) {
      try {
        let folderName = site.replace(".myjoonweb.com", "");
        const collectionRes = await axios.post(`https://video.bunnycdn.com/library/${libraryId}/collections`, {
          name: `${folderName.replace(/[^a-z0-9]/gi, '-')}`,
        },
          {
            headers: {
              AccessKey: apiKey,
              "Content-Type": "application/json",
            }
          }
        )
        collectionId = collectionRes.data?.guid
        siteDoc.bunnyCollectionId = collectionId;
        await siteDoc.save();

        console.log(`Created Bunny collection ${collectionId} for site ${site}`);
      }
      catch (collectionError) {
        console.error("Failed to create collection:", collectionError.response?.data || collectionError.message);
        return sendResponse.error(
          res,
          "COLLECTION_CREATION_FAILED",
          "Failed to create video collection",
          500
        );

      }
    }

    const bunnyRes = await axios.post(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        title,
        collectionId,
        folderPath: `/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/`,
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
    const dataToSign = libraryId + apiKey + expirationTime + videoId
    const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

    sendResponse.success(
      res,
      {
        libraryId,
        collectionId,
        videoId,
        uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,

        authorizationSignature: signature,
        authorizationExpire: expirationTime,
        site,
      },
      {
        message: "Video upload initialized successfully"
      },
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