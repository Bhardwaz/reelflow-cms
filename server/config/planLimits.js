const PLAN_LIMITS = {
    free: {
        label: 'free',
        limits: {
            maxMedia: 5,
            maxWidgets: 3,
            maxViews: 100,
            canReports: false,
            canWatermark: true,
            maxVideoSizeMB: 100,
            views: 100,
        }
    },
    basic: {
        label: "basic",
        limits: {
            maxMedia: 5,
            maxWidgets: 3,
            maxViews: 100,
            canReports: true,
            canWatermark: true,
            maxVideoSizeMB: 150,
            views: 150,
        }
    },
    pro: {
        label: "pro",
        limits: {
            maxMedia: 5,
            maxWidgets: 3,
            maxViews : 100, 
            canReports: true,
            canWatermark: true,
            maxVideoSizeMB: 200,
            views: 200,
        }
    }
}

const getPlanLimit = (plan) => {
    const safePlan = plan ? plan.toLowerCase() : 'free';
    return PLAN_LIMITS[safePlan] || PLAN_LIMITS['free'];
}

module.exports = getPlanLimit