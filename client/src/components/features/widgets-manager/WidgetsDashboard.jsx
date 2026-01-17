import React, { useEffect } from 'react'; // 1. Import useEffect
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';
import './WidgetsDashboard.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import useFetchWidgets from './hooks/useFetchWidgets';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import DashboardShimmer from './DashboardShimmer';

const WidgetsDashboard = ({ onBack, onUpload }) => {
  const navigate = useNavigate();
  
  const { data: widgets, isLoading } = useFetchWidgets();
  const setWidgetsData = useWidgetStore((state) => state.setWidgetsData);
  const setSelectedWidgetId = useWidgetStore((state) => state.setSelectedWidgetId);

  useEffect(() => {
    if (widgets) {
        setWidgetsData(widgets);
    }
  }, [widgets, setWidgetsData]);

  if (isLoading) return <DashboardShimmer/> ;  // this is widget dashboard shimmer not dashboard on home

  const handleRowClick = (_id) => {
      setSelectedWidgetId(_id);
      navigate('/widget/manager');
  };

  return (
    <div className="container-wrapper">
      <div className="main-content">

        {/* Header Section */}
        <header className="header-section">
          <div className="page-title-group" onClick={onBack}>
            <ArrowLeft size={20} />
            <h1>Video Pages</h1>
          </div>
          <div className="action-buttons-group">
            <Button variant="secondary" onClick={() => navigate("/upload/media")}> Upload videos </Button>
            <Button variant="primary" onClick={() => navigate("/create/widget")}> Add videos to a new page </Button>
          </div>
        </header>

        {/* Content Card */}
        <main className="content-card">
          
          {/* Filters */}
          <div className="filter-section">
            <div className="search-box-wrapper">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Search by page name" className="search-input" />
            </div>
            <button className="filter-dropdown">
              <span>Page type</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Grid Table */}
          <div className="dashboard-grid">
            
            <div className="grid-row header">
              <div className="grid-cell col-name">Page path</div>
              <div className="grid-cell col-type">Widgets present</div>
              <div className="grid-cell col-status">Widget status</div>
            </div>

            <div className="grid-body">
              {widgets?.map((row) => {
                const isLive = row.integrate && row.isLive;
                return (
                  <div 
                    key={row._id} 
                    className="grid-row item" 
                    onClick={() => handleRowClick(row._id)}
                  >
                    <div className="grid-cell col-name main-text">
                      {row.name}
                    </div>
                    
                    <div className="grid-cell col-type">
                      <span className="widget-tag">{row.widgetType}</span>
                    </div>
                    
                    <div className="grid-cell col-status">
                      <span className={`video-dashboard-status-badge ${isLive ? 'live' : 'draft'}`}>
                          {isLive ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WidgetsDashboard;