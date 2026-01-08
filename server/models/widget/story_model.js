const mongoose = require("mongoose");
const Widget = require("./base_model");

// Use discriminator to make it a "kind" of Widget
const Story = Widget.discriminator('Story', new mongoose.Schema({
    label: { type: String, required: true },
    coverImage: { type: String, required: true },
    expiresAt: Date,
}));

module.exports = Story;