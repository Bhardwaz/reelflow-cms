const express = require("express")
const auth = require("../middleware/auth")
const { OAuth, Helper, Context } = require('@joonweb/joonweb-sdk');
const router = express.Router()

const oauth = new OAuth({
    clientId: process.env.JOONWEB_CLIENT_ID,
    clientSecret: process.env.JOONWEB_CLIENT_SECRET,
    redirectUri: `${process.env.APP_URL}/auth/callback`,
    scopes: ['read_products']
});

router.get('/callback', auth, async (req, res) => {
    try {
        const sessionManager = req.sessionManager
        const { site } = req.query

        if (!site) {
            throw new Error("Site Not Found")
        }

        const tokenData = await oauth.exchangeCodeForToken(
            req.query.code,
            site
        );

        const session = await sessionManager.startSession(site, {
            access_token: tokenData.access_token,
            scope: tokenData.scope,
            expires_in: tokenData.expires_in,
            associated_user: tokenData.associated_user || null
        });

        req.session.joonweb_site = site;
        req.session.joonweb_access_token = tokenData.access_token;
        req.session.joonweb_user = tokenData.associated_user;

        const embedUrl = oauth.getEmbedUrl(site, req.query.site_hash, req.query.app_slug);
        // Redirect to embedded app
        res.redirect(embedUrl);

    } catch (error) {
        console.error('OAuth callback error:', error);

        // Clean up on error
        if (req.session.site && req.sessionManager) {
            await req.sessionManager.destroySession(req.session.site);
        }

        res.status(400).render('error', {
            message: 'Installation failed',
            error: error.message
        });
    }
})

module.exports = router
