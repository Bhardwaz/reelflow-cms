const BUNNY_ACCOUNT_KEY = process.env.BUNNY_STREAM_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID
 
const isLibraryForUpload = async (site) => {
     return {
          libraryId: LIBRARY_ID,
          apiKey: BUNNY_ACCOUNT_KEY
     }
};

module.exports = isLibraryForUpload