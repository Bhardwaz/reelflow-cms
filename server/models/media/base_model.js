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

    atc: {
      type: Number,
      default: 0
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

    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },

    views: {
      type: Number,
      default: 0
    },

    lastSyncedAt: Date,

    deletedAt: { type: Date },

    url: { type: String, required: true},

    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    productImage: { type: String,  required: true},

}, { timestamps: true, ...options })

BaseMedia.index({ widgetId: 1, sortOrder: 1 })

const Media = mongoose.model("Media", BaseMedia);

module.exports = Media