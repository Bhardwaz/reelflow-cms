const mongoose = require("mongoose");
const Widget = require("./base_model"); // Ensure this path points to your BaseWidget file

const Pip = Widget.discriminator('Pip', new mongoose.Schema({
    // Where the floating video sits on Desktop
    position: { 
        type: String, 
        enum: ['bottom-left', 'bottom-right', 'top-left', 'top-right'], 
        default: 'bottom-right' 
    },
    
    // Where it sits on Mobile (usually limited to bottom for UX)
    mobilePosition: {
        type: String,
        enum: ['bottom-left', 'bottom-right'],
        default: 'bottom-right'
    },

    // Example: Should it close automatically after the video ends?
    autoClose: { type: Boolean, default: false }
}));

module.exports = Pip;