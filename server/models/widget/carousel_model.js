const { mongoose } = require("mongoose");
const Widget = require("./base_model");

const Carousel = Widget.discriminator('Carousel', new mongoose.Schema({
    previewAnimation: { type: Boolean, default: true }
}))

module.exports = Carousel