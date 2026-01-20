const mongoose = require("mongoose");
const Media = require("./base_model");

const Video = Media.discriminator('Video', 
  new mongoose.Schema({
    bunnyVideoId: { type: String, required: true, unique: true },
    libraryId: { type: String, required: true },
    collectionId: { type: String, required: true },
    
    duration: { type: Number },
    thumbnailUrl: { type: String, required: true },
    previewAnimationUrl: { type: String, require: true },
    hlsUrl: { type: String, required: true },

    fileSizeMb: { type: Number, default: 0 },
    dimensions: { type: Number, default: 0 },

    processingStatus: {
      type: String,
      enum: ["processing", "ready", "failed", "uploaded"],
      default: "processing",
    }
  })
);

module.exports = Video