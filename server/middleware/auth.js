const {Context}= require("@joonweb/joonweb-sdk");

function auth(req, res, next) {
    req.sessionManager = Context.getSessionStorage();
    next()
}

module.exports = auth