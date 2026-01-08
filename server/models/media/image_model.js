const mongoose = require("mongoose");
const Media = require("./base_model");

const Image = Media.discriminator('Image', 
  new mongoose.Schema({
    altText: { type: String, default: "" },
    bunnyImageId: { type: String, requried: true, unique: true }, 
    
    // Optional: Dimensions for preventing layout shift
    width: Number,
    height: Number
  })
);

module.exports = Image