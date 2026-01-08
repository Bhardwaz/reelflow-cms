// this controller is responsible for talking to bunny CDN regarding videos status update 
const Media = require("../models/media/base_model");

const update_status = async (req, res) => {
    const site = req.session.site
    if(!site) return sendResponse.error(res, "SITE_NOT_FOUND", "Site is not found", 403)

    // Log the actual status code to understand what's happening
    console.log("Webhook received for Video:", req.body.VideoGuid, "Status Code:", req.body.Status);

    const { VideoGuid, Status } = req.body;

    if (!VideoGuid) return res.sendStatus(400);

    // Map Bunny CDN Status codes to your internal status
    // 0: Queued/Created, 1: Processing, 2: Encoding (sometimes), 3: Finished, 4: Failed
    let internalStatus = "processing";

    if (Status === 3) {
        internalStatus = "ready";
    } else if (Status === 4) {
        internalStatus = "failed";
    } else if (Status === 0) {
        internalStatus = "uploaded";
    }

    try {
        const updatedReel = await Media.findOneAndUpdate(
            { bunnyVideoId: VideoGuid, site: site },
            {
                processingStatus: internalStatus,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedReel) {
            console.log("No media found in DB for Guid:", VideoGuid);
            return sendResponse.error(res, "MEDIA_DOES_NOT_EXISTS", "media not found", 404)
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Update Error:", error);
        res.sendStatus(500);
    }
}

module.exports = update_status