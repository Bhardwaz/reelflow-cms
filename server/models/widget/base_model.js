const { Schema, mongoose } = require("mongoose");

const options = {
    discriminatorKey: 'widgetType',
    collection: 'widgets',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}

const BaseWidget = new Schema({
    name: { type: String, required: true },

    site: {
        type: String, 
        required: true,
        index: true
    },

    heading: {
      type: String, 
      required: true
    },

    atc: {
        type: Number,
        default: 0
    },

    integrate: {
        type: Boolean,
        default: false,
    },

    sortOrder: { type: Number, default: 0 },

    deviceVisibility: {
        type: String,
        enum: ["all", "mobile", "desktop-only"]
    }, 

    isLive: {
        type: Boolean,
        default: false
    },
    
}, { timestamps: true, ...options })

BaseWidget.virtual('items', {
    ref: "WidgetItem",
    localField: "_id",
    foreignField:'widgetId',
    options: { sort: { sortOrder: 1 } }
})

BaseWidget.post('findOneAndDelete', async function(document) {
    if(document){
        const Media = mongoose.model("Media")

        await Media.updateMany(
            { widgets: document._id },
            { $pull: { widgets: document._id }  }
        )
    }
})

const Widget = mongoose.model('Widget', BaseWidget)

module.exports = Widget