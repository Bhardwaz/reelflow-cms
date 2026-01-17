const axios = require("axios");
const Media = require("../models/media/base_model");

function formatDateUTC(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

exports.getDashboardStats = async (req, res) => {
  try {
    const site = req.session.site;
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    // last 30 days (UTC)
    const dateTo = formatDateUTC(new Date());
    const dateFromDate = new Date();
    dateFromDate.setDate(dateFromDate.getDate() - 30);
    const dateFrom = formatDateUTC(dateFromDate);

    // 1. Fetch user's videos
    const videos = await Media.find({
      site,
      mediaType: "Video",
      bunnyVideoId: { $exists: true }
    });

    const needsRefresh = videos.some(
      v => !v.lastSyncedAt || Date.now() - v.lastSyncedAt > CACHE_DURATION
    );

    if (needsRefresh) {
      console.log("⏳ Cache expired. Syncing Bunny stats...");

      await Promise.all(
        videos.map(async (video) => {
          try {
            const response = await axios.get(
              `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/statistics`,
              {
                headers: {
                  AccessKey: process.env.BUNNY_STREAM_API_KEY,
                  Accept: "application/json"
                },
                params: {
                  dateFrom,
                  dateTo,
                  videoGuid: video.bunnyVideoId
                }
              }
            );

            // Sum last 30 days views
            const views = response.data?.viewsChart?.reduce(
              (sum, item) => sum + item.count,
              0
            ) || 0;

            await Media.findByIdAndUpdate(video._id, {
              views,
              lastSyncedAt: new Date()
            });

          } catch (err) {
            console.error("❌ Bunny sync failed for video:", video._id);
          }
        })
      );
    }

    // 2. Aggregate dashboard stats
    const stats = await Media.aggregate([
      { $match: { site, mediaType: "Video" } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          videoCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalViews: stats[0]?.totalViews || 0,
      videoCount: stats[0]?.videoCount || 0,
      range: "last_30_days",
      cached: !needsRefresh
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading dashboard stats" });
  }
};
