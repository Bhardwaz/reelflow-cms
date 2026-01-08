const mongoose = require("mongoose");

const options = {
    discriminatorKey: 'mediaType',
    collection: 'media'
}

const BaseMedia = new mongoose.Schema({
    title: {
        type: String, required: true,
        uppercase: true, set: (v) => v ? v.trim().slice(0, 25) : v
    },

    mediaType: {
        type: String, requird: true,
        enum:['Video', 'Image']
    },

    site: {
      type: String,
      required: true, 
      index: true
    },

    url: { type: String, required: true},

    productId: { type: Number, required: true },
    productName: { type: String, required: true }

}, { timestamps: true, ...options })

BaseMedia.index({ widgetId: 1, sortOrder: 1 })

const Media = mongoose.model("Media", BaseMedia);

module.exports = Media