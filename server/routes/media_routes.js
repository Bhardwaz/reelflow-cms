const express = require("express")
const router = express.Router()
const sendResponse = require("../utils/sendResponse")

const { getLibrary, createVideo, removeMediaFromWidget, getProducts, deleteMedia } = require("../controllers/media.controllers");
const auth = require("../middleware/auth");
const { createImage, uploadMiddleware } = require("../controllers/media.controllers");
const checkDbSession = require("../middleware/checkDbSession");
const videoRequestToBunny = require("../utils/videoRequestToBunny");
const Media = require("../models/media/base_model");

// request to bunny cdn 
router.post("/videoRequest", checkDbSession, videoRequestToBunny)

// actions
router.post("/", auth, checkDbSession, createVideo);
router.get("/", auth, checkDbSession, getLibrary)
router.post("/upload-image", auth, checkDbSession, uploadMiddleware, createImage);
router.delete('/:widgetId/media/:mediaId', auth, checkDbSession, removeMediaFromWidget);
router.get("/getAllProducts", auth, checkDbSession, getProducts)
router.delete("/:mediaId", deleteMedia)

router.post("/atc/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const updatedMedia = await Media.findOneAndUpdate(
            { productId: id },
            { $inc: { atc: 1 } },
            { new: true }
        );

        if (!updatedMedia) {
            return sendResponse.error(res, "MEDIA_NOT_FOUND", "Media not found", 404);
        }

        return sendResponse.success(res, { atc: updatedMedia.atc }, "Count updated");
    } catch (error) {
        console.error("ATC Update Error:", error);
        return sendResponse.error(res, "SERVER_ERROR", "Failed to update count", 500);
    }
});

module.exports = router

