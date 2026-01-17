const axios = require('axios');
const PlatformSession = require("../models/PlatformSession")

const BUNNY_ACCOUNT_KEY = process.env.BUNNY_STREAM_API_KEY;

const isLibraryForUpload = async (site) => {
  const doc = await PlatformSession.findOne({ site_domain: site });
  
  if (doc.bunnyLibraryId && doc.bunnyApiKey) {
    return { libraryId: doc.bunnyLibraryId, apiKey: doc.bunnyApiKey };
  }

  try {
    const response = await axios.post(
      'https://api.bunny.net/videolibrary',
      { Name: `Shoppable Videos Plugin - ${site}` },
      { 
        headers: { 
          AccessKey: BUNNY_ACCOUNT_KEY, 
          'Content-Type': 'application/json' 
        } 
      }
    );

    const { Id, ApiKey } = response.data;

    site.bunnyLibraryId = Id;
    site.bunnyApiKey = ApiKey;
    await site.save();

    return { libraryId: Id, apiKey: ApiKey };

  } catch (error) {
    console.error("Failed to create Bunny Library:", error.response?.data || error.message);
    throw new Error("Could not initialize video library");
  }
};

module.exports = isLibraryForUpload