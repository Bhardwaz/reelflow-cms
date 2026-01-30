const mongoose = require("mongoose");
const Widget = require("./base_model");

const MobileSettingsSchema = new mongoose.Schema({
    position: { 
        type: String, 
        enum: ['bottom-left', 'bottom-right', 'top-left', 'top-right'], 
        default: 'bottom-right'
    },
    size: { 
        type: Number, 
        default: 8,
        min: 4, 
        max: 20 
    },
    margin: { 
        type: Number, 
        default: 10, 
        min: 0, 
        max: 100 
    },
     borderRadius: {
        type: Number,
        default: 5,
        min:0,
        max: 15
    },
    circle: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const Pip = Widget.discriminator('Pip', new mongoose.Schema({
    pipSettings: {
        position: { 
        type: String, 
        enum: ['bottom-left', 'bottom-right', 'top-left', 'top-right'], 
        default: 'bottom-right' 
    },

    size: { 
        type: Number, 
        default: 20, 
        min: 4, 
        max: 20, 
    },

    margin: { 
        type: Number, 
        default: 20, 
        min: 0, 
        max: 100 
    },

    borderRadius: {
        type: Number,
        default: 5,
        min:0,
        max: 15
    },

    circle: {
        type: Boolean,
        default: false
    },

    mobile: {
        type: MobileSettingsSchema,
        default: () => ({}) 
    },

    autoClose: { type: Boolean, default: false }
    }

}));

module.exports = Pip;