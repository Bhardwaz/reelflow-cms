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

    page: {
        type: String,
        required: true,
        enum: ['home', 'product-details', 'profile', 'cart', "all_collections", "collection_detail", "cart", "checkout", "blog", "about", "contact", "all_products"],
        index: true
    },

    integrate: {
        type: Boolean,
        default: false,
    },

    sortOrder: { type: Number, default: 0 },

    containerStyle: {
        backgroundColor: { type: String, default: '#ffffff' },
        paddingTop: { type: Number, default: 20 },
        paddingBottom: { type: Number, default: 20 }
    },

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