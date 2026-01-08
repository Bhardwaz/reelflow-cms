import { useNavigate } from 'react-router-dom';
import Button from '../../sharable/Button';
import './Dashboard.css'; // Make sure to import the CSS file
import {
    Info,
    User,
    ShoppingCart,
    Package,
    DollarSign,
    Plus,
    Sparkles
} from 'lucide-react';
import { useAppBridge } from '../../../hooks/useAppBridge';
import { useSiteData } from '../library/hooks/useSiteData';

const Dashboard = () => {
    const { data: siteData, isLoading } = useSiteData();
    const app = useAppBridge(siteData?.site);
    const navigate = useNavigate()

    // useEffect(() => {
    //     if (app && app.actions?.TitleBar) {
    //         app.actions.TitleBar.create(app, {
    //             title: 'Shoppable Videos'
    //         });
    //     }
    // }, [app]);

    return (
        <div className="container-wrapper">

            <main className="main-content">
                <div style={{ padding: "10px" }}>
                    <h1>Dashboard</h1>
                </div>

                <header className="dashboard-header">
                    <div className="logo-icon">
                        <Sparkles size={16} fill="white" />
                    </div>
                    <h1>JoonWeb Shoppable Reel</h1>
                </header>

                <div className="content-stack">

                    {/* Section 1: Usage / Plan Limit */}
                    <div className="card usage-card">
                        <div className="usage-header">
                            <div className="usage-title">
                                <span className="bold-text">100 views</span>
                                <Info size={14} className="info-icon" />
                                <span className="date-range">(26 Jun - 26 Jul)</span>
                            </div>
                            <span className="usage-used">0 views used</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                        </div>

                        <p className="helper-text">
                            Views includes views from your current plan and additional purchased views.
                        </p>

                        <div className="button-group">
                            <Button variant='secondary'> View billing </Button>
                            <Button variant='secondary'> Contact support </Button>

                        </div>
                    </div>

                    {/* Section 2: Conversions */}
                    <div className="conversions-section">
                        <div className="section-header">
                            <h2>Conversions</h2>
                            <span className="time-period">Last 7 Days</span>
                        </div>

                        <div className="stats-grid">
                            <StatCard icon={<User size={20} />} label="Video viewers" value="0" />
                            <StatCard icon={<ShoppingCart size={20} />} label="Video ATC" value="0" />
                            <StatCard icon={<Package size={20} />} label="Video orders" value="0" />
                            <StatCard icon={<DollarSign size={20} />} label="Video revenue" value="0" />
                        </div>
                    </div>

                    {/* Section 3: Shoppable Videos */}
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

// Helper Component for Stats
const StatCard = ({ icon, label, value }) => (
    <div className="card stat-card">
        <div className="stat-icon-wrapper">
            {icon}
        </div>
        <div className="stat-content">
            <div className="stat-label-row">
                <span className="stat-label">{label}</span>
                <Info size={12} className="info-icon-small" />
            </div>
            <div className="stat-value">{value}</div>
        </div>
    </div>
);

export default Dashboard;