const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    _id: {
        type: String,
    },

    site_domain: {
        type: String,
        requird: true,
    },

    access_token: {
        type: String,
    },

    authenticated_at: {
        type: Number
    },

    bunnyCollectionId: {
        type: String, default: null
    },
    expires_at: {
        type: Date
    },
    videosUploaded: { type: Number, default: 0 },
}, {
    colllection: 'sessions',
    strict: false
});

const sessionDB = mongoose.connection.useDb('reel_plugin_app2629');

const PlatformSession = sessionDB.model('Session', sessionSchema);

module.exports = PlatformSession;