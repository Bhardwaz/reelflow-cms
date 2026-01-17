import { useNavigate } from 'react-router-dom';
import Button from '../../sharable/Button';
import './Dashboard.css'; 
import {
    Info,
    User,
    ShoppingCart,
    Video, 
    Sparkles,
    Plus
} from 'lucide-react';
import { useSiteData } from '../library/hooks/useSiteData';
import useViews from './useViews';

const Dashboard = () => {
    const { data: siteData } = useSiteData();
    const { data: dashboardView, isLoading } = useViews(); 
    const navigate = useNavigate();
    
    const totalViews = dashboardView?.totalViews || 0;
    const totalVideos = dashboardView?.videoCount || 0;
    
    const planLimit = 100; 
    const usagePercentage = isLoading ? 0 : Math.min((totalViews / planLimit) * 100, 100);

    return (
        <div className="container-wrapper">

            <main className="main-content">
    
                <header className="dashboard-header">
                    <div className="logo-icon">
                        <Sparkles size={16} fill="white" />
                    </div>
                    <h1>JoonWeb Shoppable Reel</h1>
                </header>

                <div className="content-stack">

                    <div className="card usage-card">
                        <div className="usage-header">
                            <div className="usage-title">
                                <span className="bold-text">{planLimit} views</span>
                                <Info size={14} className="info-icon" />
                                <span className="date-range">(26 Jun - 26 Jul)</span>
                            </div>
                            
                            {isLoading ? (
                                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            ) : (
                                <span className="usage-used">{totalViews} views used</span>
                            )}
                        </div>

                        <div className="progress-bar-container">
                            <div 
                                className={`progress-bar-fill ${isLoading ? 'animate-pulse bg-gray-200' : ''}`} 
                                style={{ 
                                    width: isLoading ? '100%' : `${usagePercentage}%`, // Full gray bar while loading
                                    backgroundColor: isLoading ? '#e5e7eb' : (usagePercentage >= 100 ? '#ef4444' : undefined)
                                }}
                            ></div>
                        </div>

                        <p className="helper-text">
                            Views includes views from your current plan and additional purchased views.
                        </p>

                        <div className="button-group">
                            <Button variant='secondary'> View billing </Button>
                            <Button variant='secondary'> Contact support </Button>
                        </div>
                    </div>

                    <div className="conversions-section">
                        <div className="section-header">
                            <h2>Overview</h2>
                            <span className="time-period">All Time</span>
                        </div>

                        <div className="stats-grid">
                            <StatCard 
                                icon={<User size={20} />} 
                                label="Video viewers" 
                                value={totalViews.toLocaleString()} 
                                isLoading={isLoading} 
                            />
                            
                            <StatCard 
                                icon={<ShoppingCart size={20} />} 
                                label="Video ATC" 
                                value="0" 
                                isLoading={isLoading} 
                            />

                            <StatCard 
                                icon={<Video size={20} />} 
                                label="Total video uploads" 
                                value={totalVideos.toLocaleString()} 
                                isLoading={isLoading} 
                            />
                        </div>
                    </div>

                    {/* Section 3: Add Videos */}
                    <div className="card videos-card">
                        <h3>Shoppable videos</h3>
                        <p className="description-text">
                            Select a page and layout to start adding videos. Choose where you want your videos displayed, such as the homepage or customize the layout to fit your store.
                        </p>

                        <Button variant="primary" onClick={() => navigate('/create/widget')}>
                            <div className="icon-box">
                                <Plus size={14} />
                            </div>
                            Add videos to page
                        </Button>
                    </div>

                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, isLoading }) => (
    <div className="card stat-card">
        <div className="stat-icon-wrapper">
            {icon}
        </div>
        <div className="stat-content">
            <div className="stat-label-row">
                <span className="stat-label">{label}</span>
                <Info size={12} className="info-icon-small" />
            </div>
            
            {/* Logic: If loading, show pulsing box. Else, show number. */}
            <div className="stat-value">
                {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse mt-1" />
                ) : (
                    value
                )}
            </div>
        </div>
    </div>
);

export default Dashboard;