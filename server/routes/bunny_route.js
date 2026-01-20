const express = require("express")
const router = express.Router()
const bunnyWebhook = require('../controllers/webhook_controller')
const { getSiteAnalytics } = require("../controllers/dashboard.controller")
const checkDbSession = require("../middleware/checkDbSession")
const auth = require("../middleware/auth")
const PlatformSession = require("../models/PlatformSession")

router.post('/video/updates', express.json(), bunnyWebhook);

router.get('/media/views', auth, checkDbSession, async (req, res) => {
  try {
    const site = req.session.site;
    if (!site) {
      return res.status(403).json({ error: "Session not available" });
    }

    const siteDoc = await PlatformSession.findOne({ site_domain: site });
    if (!siteDoc) {
      return res.status(404).json({ error: "Site not found" });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    console.log(startDate, endDate, "dates");

    let dashboardData = {
      totalViews: 0,
      videoCount: 0,
      totalWatchTime: 0,
      recentVideos: [],
      topVideos: []
    };
    
    console.log(dashboardData, "dashboard data obbjec initialized");

    if (siteDoc.bunnyCollectionId) {
      const analytics = await getSiteAnalytics(
        siteDoc.bunnyCollectionId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const topVideos = [...analytics.videos]
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 5)
        .map(video => ({
          id: video.videoId,
          title: video.title,
          views: video.totalViews,
          watchTime: Math.round(video.totalWatchTime / 60)
        }));

      const recentVideos = analytics.videos
        .filter(video => {
          return true; // Placeholder
        })
        .slice(0, 3);

      dashboardData = {
        totalViews: analytics.totalViews,
        videoCount: analytics.totalVideos,
        totalWatchTime: Math.round(analytics.totalWatchTime / 3600),
        averageWatchTime: Math.round(analytics.averageWatchTime / 60),
        topVideos,
        recentVideos,
        collectionId: siteDoc.bunnyCollectionId
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ 
      error: "Failed to fetch dashboard analytics",
      message: error.message 
    });
  }
});


module.exports = router