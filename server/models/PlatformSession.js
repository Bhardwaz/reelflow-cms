const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    _id: {
        type: String,
        requird: true
    },

    site_domain: {
        type: String,
        required: true
    },

    access_token: {
        type: String,
        required: true
    },

    authenticated_at: {
        type: Number
    },

    expires_at: {
        type: Date
    }
}, {
    colllection: 'sessions',
    strict: false
});

const sessionDB = mongoose.connection.useDb('reel_plugin_app2629');

const PlatformSession = sessionDB.model('Session', sessionSchema);

module.exports = PlatformSession;