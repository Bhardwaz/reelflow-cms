import { useNavigate } from 'react-router-dom';
import Button from '../../sharable/Button';
import './Dashboard.css';
import {
    Info,
    User,
    ShoppingCart,
    Video,
    Sparkles,
    Plus,
    AlertTriangle,
    TrendingUp,
    Clock,
    Eye,
    Calendar,
    Zap
} from 'lucide-react';
import { useSiteData } from '../library/hooks/useSiteData';
import useViews from './useViews';
import { useState, useEffect } from 'react';

const Dashboard = () => {
    const { data: siteData } = useSiteData();
    const { data: dashboardView, isLoading } = useViews();
    const navigate = useNavigate(); 

    useEffect(() => {
        console.log(dashboardView, "dashboard data now");
    }, [dashboardView])

    const monthlyViews = dashboardView?.data?.totalViews || 0;
    const totalViews = dashboardView?.data?.totalViews || 0;
    const totalVideos = dashboardView?.data?.videoCount || 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const viewsUsedToday = dashboardView?.data?.chartData?.find(item => item.date === todayStr)?.views || 0;

    const planLimit = siteData?.plan?.monthlyLimit || 250;
    const usagePercentage = isLoading ? 0 : Math.min((monthlyViews / planLimit) * 100, 100);

    const isWarning = usagePercentage >= 80 && usagePercentage < 95;
    const isCritical = usagePercentage >= 95;

    const [currentMonth, setCurrentMonth] = useState('');
    const [dateRange, setDateRange] = useState('');

    useEffect(() => {
        const now = new Date();
        const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        setCurrentMonth(month);

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setDateRange(`(${formatDate(firstDay)} - ${formatDate(lastDay)})`);
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getProgressColor = () => {
        if (isLoading) return '#e5e7eb';
        if (isCritical) return '#ef4444';
        if (isWarning) return '#f59e0b';
        return '#10b981';
    };

    const remainingViews = Math.max(0, planLimit - monthlyViews);

    return (
        <div className="container-wrapper">
            <main className="main-content">
                <header className="dashboard-header">
                    <div className='logo-container'>
                        <div className="logo-icon">
                            <Sparkles size={18} fill="white" />
                        </div>
                        <div>
                            <h3 style={{ marginTop: "0.5rem", fontSize: "1.4rem", fontWeight: 700, color: "#444", lineHeight: 1.4 }}>
                                👋 Hi, <span style={{ fontWeight: 600, color: "#000" }}> {siteData?.site?.replace(".myjoonweb.com", "")} </span>
                            </h3>
                            <p className="header-subtitle">Video Analytics Dashboard</p>
                        </div>
                    </div>

                    <div className="current-month">
                        <Calendar size={14} />
                        <span>{currentMonth}</span>
                    </div>
                </header>

                <div className="content-stack">
                    <div className="card usage-card">
                        <div className="usage-header">
                            <div className="usage-title">
                                <span className="bold-text">Monthly View Limit</span>
                                <Info size={14} className="info-icon" />
                            </div>
                            <div className="usage-stats">
                                <span className="usage-used">{formatNumber(monthlyViews)} views used</span>
                                <span className="usage-remaining">{formatNumber(remainingViews)} remaining</span>
                            </div>
                        </div>

                        <div className="usage-details">
                            <div className="usage-limit">{formatNumber(planLimit)} total views</div>
                            <div className="date-range-display">
                                {dateRange}
                                {viewsUsedToday >= 0 && (
                                    <span className="today-views">
                                        <Zap size={12} />
                                        {formatNumber(viewsUsedToday)} today
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="progress-container">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${usagePercentage}%`,
                                        backgroundColor: getProgressColor(),
                                        transition: 'width 0.8s ease-out, background-color 0.3s ease'
                                    }}
                                >
                                    {(isWarning || isCritical) && !isLoading && (
                                        <div className="progress-bar-pulse"></div>
                                    )}
                                </div>

                                <div className="progress-markers">
                                    <div className="marker" style={{ left: '80%' }}>80%</div>
                                    <div className="marker" style={{ left: '95%' }}>95%</div>
                                </div>
                            </div>

                            <div className="progress-labels">
                                <span>0</span>
                                <span className="current-usage">{formatNumber(monthlyViews)}</span>
                                <span>{formatNumber(planLimit)}</span>
                            </div>
                        </div>

                        {isWarning && !isLoading && (
                            <div className="warning-message warning">
                                <AlertTriangle size={14} />
                                <span>You've used {usagePercentage.toFixed(0)}% of your monthly views. Consider upgrading your plan.</span>
                            </div>
                        )}

                        {isCritical && !isLoading && (
                            <div className="warning-message critical">
                                <AlertTriangle size={14} />
                                <span>You've used {usagePercentage.toFixed(0)}% of your monthly views. Videos may stop displaying soon.</span>
                            </div>
                        )}

                        <div className="usage-metrics-grid">
                            <div className="metric">
                                <div className="metric-label">Daily Average</div>
                                <div className="metric-value">
                                    {isLoading ? '...' : formatNumber(Math.round(monthlyViews / (new Date().getDate() || 1)))}
                                </div>
                                <div className="metric-sub">views/day</div>
                            </div>
                            <div className="metric">
                                <div className="metric-label">Projected Month End</div>
                                <div className="metric-value">
                                    {isLoading ? '...' : formatNumber(Math.round(monthlyViews * 30 / (new Date().getDate() || 1)))}
                                </div>
                                <div className="metric-sub">estimated</div>
                            </div>
                        </div>

                        <div className="button-group">
                            <Button variant='secondary' icon={<TrendingUp size={14} />}>
                                Upgrade Plan
                            </Button>
                            <Button variant='outline'>
                                View Usage History
                            </Button>
                        </div>
                    </div>

                    {/* Overview Section */}
                    <div className="conversions-section">
                        <div className="section-header">
                            <div>
                                <h2>Performance Overview</h2>
                                <p className="section-subtitle">Real-time analytics from your video library</p>
                            </div>
                            <span className="time-period">Last 30 Days</span>
                        </div>

                        <div className="stats-grid">
                            <StatCard
                                icon={<Eye size={20} />}
                                label="Total Views"
                                value={formatNumber(totalViews)}
                                isLoading={isLoading}
                                trend={0} // Can add trend logic later if API provides 'previousPeriodViews'
                                description="All-time total"
                                color="blue"
                            />

                            <StatCard
                                icon={<User size={20} />}
                                label="This Month"
                                value={formatNumber(monthlyViews)}
                                isLoading={isLoading}
                                description="Current billing cycle"
                                color="green"
                            />

                            <StatCard
                                icon={<Clock size={20} />}
                                label="Avg. Watch Time"
                                // Updated to map to dashboardView.data.averageWatchTime
                                value={isLoading ? "..." : `${dashboardView?.data?.averageWatchTime || 0}m`}
                                isLoading={isLoading}
                                description="Per video view"
                                color="purple"
                            />

                            <StatCard
                                icon={<Video size={20} />}
                                label="Published Videos"
                                value={totalVideos.toLocaleString()}
                                isLoading={isLoading}
                                description="In your library"
                                color="orange"
                            />
                        </div>
                    </div>

                    {/* Add Videos Section */}
                    <div className="card videos-card">
                        <div className="videos-header">
                            <div>
                                <h3>Shoppable Videos</h3>
                                <p className="description-text">
                                    Create engaging shoppable videos to boost conversions. Add products, tags, and CTAs to your videos.
                                </p>
                            </div>
                            <div className="videos-count">
                                <Video size={20} />
                                <span>{totalVideos} videos</span>
                            </div>
                        </div>

                        <div className="videos-actions">
                            <Button
                                variant="primary"
                                onClick={() => navigate('upload/media')}
                                className="primary-action"
                            >
                                <div className="icon-box">
                                    <Plus size={16} />
                                </div>
                                Upload New Video
                            </Button>
                            <div className="secondary-actions">
                                <Button variant="secondary" onClick={() => navigate('/library')}>
                                    Manage Videos
                                </Button>
                                {/* <Button variant="outline">
                                    View Analytics
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, isLoading, trend, description, color = 'blue' }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50',
    };

    return (
        <div className="card stat-card">
            <div className="stat-header">
                <div className={`stat-icon-wrapper ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend !== undefined && !isLoading && trend !== 0 && (
                    <div className={`trend-badge ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        <TrendingUp size={12} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="stat-content">
                <div className="stat-label-row">
                    <span className="stat-label">{label}</span>
                    <Info size={12} className="info-icon-small" />
                </div>

                <div className="stat-value">
                    {isLoading ? (
                        <div className="skeleton-loading">
                            <div className="skeleton-bar"></div>
                        </div>
                    ) : (
                        <>
                            <div className="value-display">{value}</div>
                            {description && (
                                <div className="stat-description">{description}</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;