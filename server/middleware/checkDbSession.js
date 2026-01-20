const PlatformSession = require("../models/PlatformSession")
const sendResponse = require("../utils/sendResponse")

// this is middleware which is checking site session with our mongo db database

const checkDbSession = async (req, res, next) => {
   try {
      // identifying the site if it exists in our Session
      const site = req.session?.site

      console.log(site, "abbas site")

      if (!site) {
         return sendResponse.error(res, "NOT_PERMITTED", "missing credentials]]", 401)
      }

      const isSessionExists = await PlatformSession.findById(site)

      if (!isSessionExists) {
         return sendResponse.error(res, "NO_SESSION_EXIST", "Session invalid or expired", 401)
      }

      req.access_token = isSessionExists?.access_token;
      const bunnyCollectionId = isSessionExists?.bunnyCollectionId

      if(bunnyCollectionId) {
          req.bunnyCollectionId = bunnyCollectionId;
      }

      console.log(isSessionExists, "session from db")

      next()

   } catch (error) {
      return sendResponse.error(res, "service might be down", "Internal Server Error during Auth Check", 500)
   }
}

module.exports = checkDbSession