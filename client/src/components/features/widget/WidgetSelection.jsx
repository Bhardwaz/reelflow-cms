import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../sharable/Button';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import './WidgetSelection.css';
import { AlertCircle, Type } from 'lucide-react';

const WidgetSelection = () => {
  const navigate = useNavigate();

  const selectedWidget = useWidgetStore((state) => state.selectedWidget);
  const heading = useWidgetStore((state) => state.heading);
  const setSelectedWidget = useWidgetStore((state) => state.setSelectedWidget);
  const setHeading = useWidgetStore((state) => state.setHeading);

  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (!selectedWidget || !heading || heading.trim() === '') {
      setShowError(true);
      return;
    }
    navigate("/create/library");
  };

  return (
    <div className='container-wrapper'>
      <div className="main-content">
        <div className="ws-header">
          <div className="ws-logo-box"><span>*</span></div>
          <h1 className="ws-title">JoonWeb Shoppable Reel</h1>
        </div>

        <div className="ws-card">
          <div className="ws-section">
            <h2 className="ws-section-title">Select widget</h2>
            <p className="ws-section-desc">Choose a widget variant to add to your store.</p>

            <div className="ws-grid">

              <WidgetOption
                id="carousel"
                label="Carousel"
                isSelected={selectedWidget === 'carousel'}
                onClick={setSelectedWidget}
              >
                <CarouselPreview />
              </WidgetOption>

              <WidgetOption
                id="stories"
                label="Stories"
                isSelected={selectedWidget === 'stories'}
                onClick={setSelectedWidget}
                disabled={true} // <--- Disables click & shows badge
              >
                <StoriesPreview />
              </WidgetOption>

              <WidgetOption
                id="pip"
                label="Floating"
                isSelected={selectedWidget === 'pip'}
                onClick={setSelectedWidget}
                disabled={true} // <--- Disables click & shows badge
              >
                <PipPreview />
              </WidgetOption>
            </div>
          </div>

          <hr className="ws-divider" />

          <div className="ws-select-wrapper">
            <h2 className="ws-section-title">Widget Title</h2>
            <p className="ws-section-desc">Give your widget a title (e.g. New Arrivals).</p>

            <div className="ws-select-container">

              <div className="w-full md:w-[50%] p-2">
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className={`h-5 w-5 ${showError && !heading ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. Summer Collection"
                    style={{ paddingLeft:"10px", paddingRight: "4px", paddingTop:'4px', paddingBottom: "4px" }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 bg-white rounded-lg border shadow-sm placeholder:text-gray-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${showError && !heading
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-50'
                        : 'border-gray-200 hover:border-gray-300 focus:border-black focus:ring-gray-100'
                      }`}
                    value={heading || ''}
                    onChange={(e) => {
                      setHeading(e.target.value);
                      if (showError) setShowError(false);
                    }}
                  />
                </div>

                {showError && !heading ? (
                  <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500 animate-pulse">
                    <AlertCircle size={14} />
                    This field is required
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    This title will be displayed above your videos.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="ws-footer">
            <Button
              className="ws-next-btn"
              onClick={handleNext}
              disabled={!selectedWidget || !heading}
            >
              Next
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- UPDATED SUB-COMPONENTS ---

// ✅ Updated WidgetOption with Disabled Logic
const WidgetOption = ({ id, label, isSelected, onClick, children, disabled }) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`ws-option relative ${isSelected ? 'selected' : ''} ${disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
    >
      {/* Coming Soon Badge Overlay */}
      {disabled && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-lg">
          <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Coming Soon
          </span>
        </div>
      )}

      <div className="ws-option-frame">
        <div className="phone-mockup">
          <div className="phone-notch"></div>
          <div className="phone-screen">{children}</div>
        </div>
      </div>
      <span className="ws-option-label">{label}</span>
    </div>
  );
};

const CarouselPreview = () => (
  <div className="carousel-layout">
    <div className="mockup-header">Watch & Shop</div>
    <div className="carousel-row">
      <div className="carousel-card"><div className="c-img"><div className="c-gradient"></div></div><div className="c-line"></div><div className="c-line short"></div></div>
      <div className="carousel-card"><div className="c-img"><div className="c-gradient"></div></div><div className="c-line"></div><div className="c-line short"></div></div>
    </div>
  </div>
);

const StoriesPreview = () => (
  <div className="stories-layout">
    <div className="mockup-header">Watch & Shop</div>
    <div className="stories-row"><div className="story-circle"></div><div className="story-circle"></div><div className="story-circle"></div></div>
    <div className="story-block"></div><div className="story-block"></div><div className="story-block"></div>
  </div>
);

const PipPreview = () => (
  <div className="pip-layout">
    <div className="pip-block h-sm"></div><div className="pip-block h-lg"></div><div className="pip-block h-lg"></div><div className="pip-block h-lg"></div>
    <div className="pip-float"><div className="pip-inner"><div className="pip-text">Watch & Buy</div></div></div>
  </div>
);

export default WidgetSelection;