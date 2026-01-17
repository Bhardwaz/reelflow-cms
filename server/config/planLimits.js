const PLAN_LIMITS = {
    free: {
        label: 'free',
        limits: {
            maxMedia: 5,
            maxWidgets: 3,
            maxViews: 100,
            canReports: false,
            canWatermark: true,
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
        }
    }
}

const getPlanLimit = (plan) => {
    const safePlan = plan ? plan.toLowerCase() : 'free';
    return PLAN_LIMITS[safePlan] || PLAN_LIMITS['free'];
}

module.exports = getPlanLimit