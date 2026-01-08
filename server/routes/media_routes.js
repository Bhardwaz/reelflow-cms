const express = require("express")
const router = express.Router()

const { getLibrary, createVideo, removeMediaFromWidget, getProducts } = require("../controllers/media.controllers");
const auth = require("../middleware/auth");
const { createImage, uploadMiddleware } = require("../controllers/media.controllers");
const checkDbSession = require("../middleware/checkDbSession");
const videoRequestToBunny = require("../utils/videoRequestToBunny");

// request to bunny cdn 
router.post("/videoRequest", checkDbSession, videoRequestToBunny)

// actions
router.post("/", auth, checkDbSession, createVideo);
router.get("/", auth, checkDbSession, getLibrary)
router.post("/upload-image", auth, checkDbSession, uploadMiddleware, createImage);
router.delete('/:widgetId/media/:mediaId', auth, checkDbSession, removeMediaFromWidget);
router.get("/getAllProducts", auth, checkDbSession, getProducts)

module.exports = router

