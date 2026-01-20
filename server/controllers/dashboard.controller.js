// utils/siteAnalytics.js
const axios = require('axios');

const SHARED_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const SHARED_LIBRARY_API_KEY = process.env.BUNNY_STREAM_API_KEY;

const getSiteAnalytics = async (collectionId, startDate, endDate) => {
  try {
    const videosRes = await axios.get(
      `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/videos?collection=${collectionId}`,
      {
        headers: {
          AccessKey: SHARED_LIBRARY_API_KEY,
          "Content-Type": "application/json",
        }
      }
    );
    
    const videos = videosRes.items || videosRes.data.items || [];
     
    console.log(startDate, endDate, "last datess");

    let siteAggregatedChart = {};

    // video guid === d8c65d0f-75bd-4f05-afef-8bb35a98d048

    const analyticsPromises = videos.map(async (video) => {
      try {
        const statsRes = await axios.get(
          `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/statistics`,
          {
            params: {
                      dateFrom: dateFrom,
                      dateTo: dateTo,
                      videoGuid: video.guid
                    }
          },
          {
            headers: {
              AccessKey: SHARED_LIBRARY_API_KEY,
              "Content-Type": "application/json",
            }
          }
        );
        
       return statsRes.data.viewsChart;
      } catch (error) {
        console.error(`Error fetching stats for video ${video.guid}:`, error.message);
        return {};
      }
    });

    const allVideoStats = (await Promise.all(analyticsPromises)).filter(Boolean);

    allVideoStats.forEach(videoStat => {
      for(const [date, views] of Object.entries(videoStat)){
           if(!siteAggregatedChart[date]){
            siteAggregatedChart[date] = 0
           }
           siteAggregatedChart[date] += views;
      }
    })

    const finalDashboardData = Object.entries(siteAggregatedChart).map(([date, totalViews]) => (
      {
       date: date.split('T')[0],
       views: totalViews
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return finalDashboardData

  } catch (error) {
    console.error("Error fetching site analytics:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getSiteAnalytics };