const EventEmitter = require('events');
const axios = require('axios');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Media = require('../../models/media/base_model');
const WidgetItem = require('../../models/widget/base_model'); 

class MediaEventEmitter extends EventEmitter {}
const mediaEvents = new MediaEventEmitter();

const performCleanup = async (media) => {
    const mediaId = media._id;

    try {
        let readyForHardDelete = false;

        try {
            if (media.mediaType === 'Video' && media.bunnyVideoId) {
                await axios.delete(
                    `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${media.bunnyVideoId}`,
                    { headers: { AccessKey: process.env.BUNNY_STREAM_API_KEY } }
                );
                readyForHardDelete = true;

            } else if (media.mediaType === 'Image' && media.bunnyImageId) {
                const storageZone = process.env.BUNNY_STORAGE_ZONE;
                const accessKey = process.env.BUNNY_STORAGE_API_KEY; 
            
                await axios.delete(
                    `https://storage.bunnycdn.com/${storageZone}/${media.bunnyImageId}`, 
                    { headers: { AccessKey: accessKey } }
                );
                readyForHardDelete = true;

            } else {
                readyForHardDelete = true;
            }

        } catch (bunnyError) {
            if (bunnyError.response?.status === 404) {
                readyForHardDelete = true;
            } else {
                console.error(`[Cleanup] Bunny Failed for ${mediaId}: ${bunnyError.message}`);
        
                await Media.findByIdAndUpdate(mediaId, { 
                    deletionError: `Failed: ${bunnyError.message}`,
                    lastRetryAt: new Date()
                });
                return false; // STOP
            }
        }

        if (readyForHardDelete) {
            await mongoose.model("WidgetItem").deleteMany({ mediaId: mediaId });

            await Media.findByIdAndDelete(mediaId);
            
            console.log(`[Cleanup] ✅ Hard Delete Complete: ${mediaId}`);
            return true;
        }

    } catch (err) {
        console.error(`[Cleanup] 🚨 System Error for ${mediaId}:`, err);
        return false;
    }
};

mediaEvents.on('START_MEDIA_DELETION', async (eventPayload) => {

    const media = await Media.findById(eventPayload.mediaId);
    
    if (media) {
        console.log(`[Event] ⚡ Starting immediate cleanup for: ${media._id}`);
        await performCleanup(media);
    }
});

cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Checking for expired soft-deleted media...');
    
    const retentionLimit = new Date();
    retentionLimit.setDate(retentionLimit.getDate() - 3);

    try {
        const expiredMedia = await Media.find({
            isDeleted: true,
            deletedAt: { $lt: retentionLimit }
        });

        if (expiredMedia.length === 0) {
            console.log('✅ [Cron] No expired media found.');
            return;
        }

        console.log(`🗑️ [Cron] Found ${expiredMedia.length} items. Purging...`);

        for (const media of expiredMedia) {
            await performCleanup(media);
        }

        console.log('🏁 [Cron] Purge Complete.');

    } catch (error) {
        console.error("💥 [Cron] Job Failed:", error);
    }
});

module.exports = mediaEvents;