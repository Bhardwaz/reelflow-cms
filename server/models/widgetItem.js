const mongoose = require("mongoose");

const widgetItemSchema = new mongoose.Schema({
    // Widget
    widgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Widget', required: true, index: true },
    
    // Media
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    
    // order for this specific
    sortOrder: { type: Number, required: true, default: 0 },

    site: { type: String, required: true, index: true }


}, { timestamps: true });

module.exports = mongoose.model("WidgetItem", widgetItemSchema);