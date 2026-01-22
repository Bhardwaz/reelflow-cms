const axios = require('axios');

const SHARED_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const SHARED_LIBRARY_API_KEY = process.env.BUNNY_STREAM_API_KEY;

const getSiteAnalytics = async (collectionId, startDate, endDate) => {
  try {
    const videosRes = await axios.get(
      `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/videos`,
      {
        params: { collection: collectionId },
        headers: {
          AccessKey: SHARED_LIBRARY_API_KEY,
          "Content-Type": "application/json",
        }
      }
    );

    const videos = videosRes.items || videosRes.data.items || [];

    let totalVideos = videos.length;
    let totalDurationSecs = 0;
    let totalViewsPeriod = 0;
    let totalWatchTimeSecs = 0;
    let siteAggregatedChart = {}; 

    const analyticsPromises = videos.map(async (video) => {
        totalDurationSecs += video.length;

        try {
            const statsRes = await axios.get(
                `https://video.bunnycdn.com/library/${SHARED_LIBRARY_ID}/statistics`,
                {
                    params: {
                        dateFrom: startDate,
                        dateTo: endDate,
                        videoGuid: video.guid
                    },
                    headers: {
                        AccessKey: SHARED_LIBRARY_API_KEY,
                        "Content-Type": "application/json",
                    }
                }
            );
            return statsRes.data;
        } catch (error) {
            console.error(`Stats error for ${video.guid}:`, error.message);
            return null;
        }
    });

    const statsResults = await Promise.all(analyticsPromises);

    const enrichedVideos = videos.map((video, index) => {
        const stat = statsResults[index];
        let viewsInPeriod = 0;
        let watchTimeInPeriod = 0;

        if (stat) {
            viewsInPeriod = Object.values(stat.viewsChart).reduce((a, b) => a + b, 0);
            watchTimeInPeriod = Object.values(stat.watchTimeChart).reduce((a, b) => a + b, 0);

            totalViewsPeriod += viewsInPeriod;
            totalWatchTimeSecs += watchTimeInPeriod;

            Object.entries(stat.viewsChart).forEach(([dateString, viewCount]) => {
                const dateKey = dateString.split('T')[0];
                if (!siteAggregatedChart[dateKey]) siteAggregatedChart[dateKey] = 0;
                siteAggregatedChart[dateKey] += viewCount;
            });
        }

        return {
            ...video,
            stats: {
                views: viewsInPeriod,
                watchTime: watchTimeInPeriod
            }
        };
    });

    const chartDataArray = Object.entries(siteAggregatedChart)
      .map(([date, totalViews]) => ({
        date: date,
        views: totalViews
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        summary: {
            totalVideos,
            totalViews: totalViewsPeriod,
            totalDurationMins: Math.floor(totalDurationSecs / 60),
            totalWatchTimeMins: Math.floor(totalWatchTimeSecs / 60),
        },
        videos: enrichedVideos,
        chartData: chartDataArray
    };

  } catch (error) {
    console.error("Helper Error:", error.message);
    throw error;
  }
};

module.exports = { getSiteAnalytics };