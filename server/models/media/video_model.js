const mongoose = require("mongoose");
const Media = require("./base_model");

const Video = Media.discriminator('Video', 
  new mongoose.Schema({
    bunnyVideoId: { type: String, required: true, unique: true },
    libraryId: { type: String, required: true },
    
    duration: { type: Number },
    thumbnailUrl: { type: String },
    previewAnimationUrl: { type: String },

    processingStatus: {
      type: String,
      enum: ["processing", "ready", "failed", "uploaded"],
      default: "processing",
    }
  })
);

module.exports = Video