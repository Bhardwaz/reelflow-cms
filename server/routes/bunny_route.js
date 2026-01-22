const express = require("express")
const router = express.Router()
const bunnyWebhook = require('../controllers/webhook_controller')
const { getSiteAnalytics } = require("../controllers/dashboard.controller")
const checkDbSession = require("../middleware/checkDbSession")
const auth = require("../middleware/auth")
const PlatformSession = require("../models/PlatformSession")
const sendResposne = require("../utils/sendResponse");

router.post('/video/updates', express.json(), bunnyWebhook);

router.get('/media/views', auth, checkDbSession, async (req, res) => {
  try {
    const site = req.session.site;
    if (!site) return 

    const siteDoc = await PlatformSession.findOne({ site_domain: site });
    if (!siteDoc) return sendResposne.error(res, "SITE_NOT_FOUND", "site does not exist in db", 404);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    console.log(endDate, startDate, "end date and start date");

    let dashboardData = {
      totalViews: 0,
      videoCount: 0,
      totalWatchTime: 0,
      averageWatchTime: 0,
      recentVideos: [],
      topVideos: [],
      chartData: [],
    };

    if (siteDoc.bunnyCollectionId) {
      const analytics = await getSiteAnalytics(
        siteDoc.bunnyCollectionId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const topVideos = [...analytics.videos]
        .sort((a, b) => b.stats.views - a.stats.views)
        .slice(0, 5)
        .map(video => ({
          id: video.guid,
          title: video.title,
          views: video.stats.views, 
          watchTime: Math.round(video.stats.watchTime / 60),
          thumbnail: `https://${process.env.BUNNY_PULL_ZONE}/${video.guid}/${video.thumbnailFileName}`
        }));

      const recentVideos = [...analytics.videos]
        .sort((a, b) => new Date(b.dateUploaded) - new Date(a.dateUploaded))
        .slice(0, 5)
        .map(video => ({
          id: video.guid,
          title: video.title,
          date: video.dateUploaded,
          views: video.stats.views,
          thumbnail: `https://${process.env.BUNNY_PULL_ZONE}/${video.guid}/${video.thumbnailFileName}`
        }));

      dashboardData = {
        totalViews: analytics.summary.totalViews,
        videoCount: analytics.summary.totalVideos,
        totalWatchTime: analytics.summary.totalWatchTimeMins,
        averageWatchTime: analytics.summary.totalVideos > 0 
            ? Math.round(analytics.summary.totalWatchTimeMins / analytics.summary.totalVideos) 
            : 0,
        topVideos,
        recentVideos,
        chartData: analytics.chartData,
        collectionId: siteDoc.bunnyCollectionId
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch dashboard analytics",
      message: error.message 
    });
  }
});


module.exports = router