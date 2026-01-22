import React, { useEffect } from 'react'; // 1. Import useEffect
import { ArrowLeft, Search, ChevronDown } from 'lucide-react';
import './WidgetsDashboard.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import useFetchWidgets from './hooks/useFetchWidgets';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import DashboardShimmer from './DashboardShimmer';
import Empty from '../../sharable/Empty';

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

  const handleRowClick = (_id) => {
    setSelectedWidgetId(_id);
    navigate('/widget/manager');
  };

  return (
    <div className="container-wrapper">
      <div className="main-content">

        <header className="header-section">
          <div className="page-title-group" onClick={onBack}>
            <ArrowLeft size={20} />
            <h1> Widgets List  </h1>
          </div>
          <div className="action-buttons-group">
            <Button variant="primary" onClick={() => navigate("/create/widget")}> Create a new widget </Button>
            <Button variant="secondary" onClick={() => navigate("/upload/media")}> Upload videos </Button>
          </div>
        </header>

        <main className="content-card">

          <div className="filter-section">
            <div className="search-box-wrapper">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Search by page name" className="search-input" />
            </div>
            {/* <button className="filter-dropdown">
              <span>Widget type</span>
              <ChevronDown size={16} />
            </button> */}
          </div>

          <div className="dashboard-grid">

            <div className="grid-row header">
              <div className="grid-cell col-name">Page path</div>
              <div className="grid-cell col-type">Widgets present</div>
              <div className="grid-cell col-status">Widget status</div>
            </div>

            <div className="grid-body">
              {isLoading ? (
                <DashboardShimmer />
              ) : (
                widgets?.map((row) => {
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
                })
              )}

              {!isLoading && widgets?.length === 0 && (
                <Empty title='No Widget Found' />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WidgetsDashboard;