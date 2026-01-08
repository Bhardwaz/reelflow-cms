import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, ChevronDown, Check } from 'lucide-react'; 
import './WidgetSelection.css'; 
import { useNavigate } from 'react-router-dom';
import Button from '../../sharable/Button';
import { useWidgetStore } from '../../../stores/useWidgetStore';

// Standard E-commerce Page Options
const PAGE_OPTIONS = [
  { value: 'home', label: 'Home Page' },
  { value: 'all_products', label: 'All Products' },
  { value: 'product_detail', label: 'Product Detail Page' },
  { value: 'all_collections', label: 'All Collections' },
  { value: 'collection_detail', label: 'Collection Detail Page' },
  { value: 'cart', label: 'Cart Page' },
  { value: 'checkout', label: 'Checkout Page' },
  { value: 'blog', label: 'Blog / News' },
  { value: 'about', label: 'About Us' },
  { value: 'contact', label: 'Contact Us' },
];

const WidgetSelection = () => {
  const navigate = useNavigate();
  
  const selectedWidget = useWidgetStore((state) => state.selectedWidget);
  const selectedPage = useWidgetStore((state) => state.selectedPage)
  const setSelectedWidget = useWidgetStore((state) => state.setSelectedWidget);
  const setSelectedPage = useWidgetStore((state) => state.setSelectedPage);

  const [selectedPageValue, setSelectedPageValue] = useState(selectedPage || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Helper to find label
  const currentLabel = PAGE_OPTIONS.find(p => p.value === selectedPageValue)?.label;

  const handleNext = () => {
    if (!selectedWidget || !selectedPageValue) {
      setShowError(true);
      return;
    }
    // Sync local state to Global Store before navigating
    if (setSelectedPage) setSelectedPage(selectedPageValue);
    
    navigate("/create/library");
  };

  const handlePageSelect = (option) => {
    setSelectedPageValue(option.value);
    setSelectedPage(option.value)
    setIsDropdownOpen(false);
    setShowError(false);
  };

  return (
    <div className='container-wrapper'>
      <div className="main-content">

        <div className="ws-header">
          <div className="ws-logo-box">
            <span>*</span>
          </div>
          <h1 className="ws-title">JoonWeb Shoppable Reel</h1>
        </div>

        <div className="ws-card">

          {/* Section 1: Select Widget */}
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
              >
                <StoriesPreview />
              </WidgetOption>

              <WidgetOption
                id="pip"
                label="Floating"
                isSelected={selectedWidget === 'pip'}
                onClick={setSelectedWidget}
              >
                <PipPreview />
              </WidgetOption>
            </div>
          </div>

          <hr className="ws-divider" />

          {/* Section 2: Select Page */}
          <div className="ws-select-wrapper">
            <h2 className="ws-section-title">Select Page</h2>
            <p className="ws-section-desc">Choose a page for your widget.</p>

            {/* Added ref={dropdownRef} here to track clicks */}
            <div className="ws-select-container" style={{ position: 'relative' }} ref={dropdownRef}>
              
              {/* Trigger Box */}
              <div 
                className="ws-select-box" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span className={`ws-select-placeholder ${selectedPageValue ? 'active-text' : ''}`}>
                  {currentLabel || "Select a page, product or collection"}
                </span>
                <ChevronDown 
                    size={16} 
                    color="#9ca3af" 
                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} 
                />
              </div>

              {/* Dropdown List (Opens Upwards) */}
              {isDropdownOpen && (
                <div className="ws-dropdown-list" style={{
                    position: 'absolute',
                    bottom: '100%',     
                    left: 0,
                    right: 0,
                    marginBottom: '8px', 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}>
                  {PAGE_OPTIONS.map((option) => (
                    <div 
                      key={option.value}
                      className="ws-dropdown-item"
                      onClick={() => handlePageSelect(option)}
                      style={{
                        padding: '10px 12px',
                        fontSize: '1.4rem',
                        cursor: 'pointer',
                        color: '#374151',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: selectedPageValue === option.value ? '#f3f4f6' : 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedPageValue === option.value ? '#f3f4f6' : 'white'}
                    >
                      {option.label}
                      {selectedPageValue === option.value && <Check size={14} color="#10b981" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {showError && !selectedPageValue && (
                <div className="ws-error-msg">
                  <AlertCircle size={16} />
                  <span style={{ fontSize: "1rem" }}> Please select a page</span>
                </div>
              )}
            </div>
          </div>

          <div className="ws-footer">
            <Button
              className="ws-next-btn"
              onClick={handleNext}
              disabled={!selectedWidget || !selectedPage} 
            >
              Next
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
};

// --- Sub-components (Unchanged) ---
const WidgetOption = ({ id, label, isSelected, onClick, children }) => (
  <div onClick={() => onClick(id)} className={`ws-option ${isSelected ? 'selected' : ''}`}>
    <div className="ws-option-frame">
      <div className="phone-mockup">
        <div className="phone-notch"></div>
        <div className="phone-screen">{children}</div>
      </div>
    </div>
    <span className="ws-option-label">{label}</span>
  </div>
);

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