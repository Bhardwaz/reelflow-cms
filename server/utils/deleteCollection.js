// utils/deleteSiteCollection.js
const axios = require('axios');
const PlatformSession = require("../models/PlatformSession");

const SHARED_LIBRARY_ID = process.env.SHARED_LIBRARY_ID;
const SHARED_LIBRARY_API_KEY = process.env.SHARED_LIBRARY_API_KEY;

const deleteSiteCollection = async (siteDomain) => {
  try {
    const siteDoc = await PlatformSession.findOne({ site_domain: siteDomain });
    
    if (!siteDoc || !siteDoc.bunnyCollectionId) {
      console.log(`No Bunny collection found for site ${siteDomain}`);
      return;
    }

    const collectionId = siteDoc.bunnyCollectionId;

    // 1. First, delete all videos in the collection
    // List videos in collection
    const videosRes = await axios.get(
      `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/videos?collection=${collectionId}&itemsPerPage=1000`,
      {
        headers: {
          AccessKey: SHARED_LIBRARY_API_KEY,
          "Content-Type": "application/json",
        }
      }
    );

    // Delete each video
    for (const video of videosRes.data.items || []) {
      await axios.delete(
        `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/videos/${video.guid}`,
        {
          headers: {
            AccessKey: SHARED_LIBRARY_API_KEY,
          }
        }
      );
      console.log(`Deleted video ${video.guid} from collection ${collectionId}`);
    }

    // 2. Delete the collection itself
    await axios.delete(
      `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/collections/${collectionId}`,
      {
        headers: {
          AccessKey: SHARED_LIBRARY_API_KEY,
        }
      }
    );

    // 3. Clear collection ID from database
    siteDoc.bunnyCollectionId = null;
    await siteDoc.save();

    console.log(`Successfully deleted Bunny collection ${collectionId} for site ${siteDomain}`);
    return { success: true, collectionId };

  } catch (error) {
    console.error("Failed to delete collection:", error.response?.data || error.message);
    
    // Even if deletion fails, clear from database to prevent orphaned references
    if (siteDoc) {
      siteDoc.bunnyCollectionId = null;
      await siteDoc.save();
    }
    
    throw new Error(`Failed to delete collection: ${error.message}`);
  }
};

module.exports = deleteSiteCollection;