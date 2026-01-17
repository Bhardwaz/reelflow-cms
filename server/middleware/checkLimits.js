const { getPlanLimit } = require("../config/planLimits");
const Media = require("../models/media/base_model");
const Widget = require("../models/widget/base_model");

exports.checkLimits = async (site, plan = "free", resourceType) => {
    const config = getPlanLimit(plan);
    const limits = config.limits;

    if (resourceType === 'Media') {
        const currentCount = await Media.countDocuments({ site_domain: site });
        
        if (currentCount >= limits.maxMedia) {
            throw new Error(`Limit reached. You can only upload ${limits.maxMedia} media items on the ${config.label} plan.`);
        }
    }
  
    if (resourceType === 'Widget') {
        const currentCount = await Widget.countDocuments({ site_domain: site });
        
        if (currentCount >= limits.maxWidgets) {
            throw new Error(`Limit reached. You can only create ${limits.maxWidgets} widgets on the ${config.label} plan.`);
        }
    }

    return true;
};