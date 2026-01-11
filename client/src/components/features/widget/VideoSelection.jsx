import React, { useState } from 'react';
import { ArrowLeft, Filter, Check, Play, Image as ImageIcon, Package } from 'lucide-react';
import './VideoSelection.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import { useFetchLibrary } from "../library/hooks/useFetchLibrary";
import ReelsTableShimmer from "../../shimmir/ReelsTableShimmer";

const VideoSelection = ({ onBack }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Store Data (Updated for Client-Side Draft Mode)
  // We now use 'selectedMediaItems' which contains the FULL video objects, not just IDs
  const selectedMediaItems = useWidgetStore((state) => state.selectedMediaItems) || [];
  const toggleMediaSelection = useWidgetStore((state) => state.toggleMediaSelection);
  const selectedWidget = useWidgetStore((state) => state.selectedWidget);

  // 2. Fetch Real Data
  const { data: library, isLoading: isLibraryLoading, isError } = useFetchLibrary();
  const reelsList = Array.isArray(library) ? library : (library?.data || []);

  // 3. Filter Data
  const visibleReels = reelsList.filter((item) => 
    item?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. PIP Logic Helper
  const isPIP = selectedWidget?.toLowerCase().includes('pip'); 
  
  // Helper to check if a specific ID is currently selected
  const isSelected = (id) => selectedMediaItems.some((item) => item._id === id);

  const isSelectionDisabled = (currentId) => {
      // If it's PIP, and we already have 1 selected, and THIS one isn't it -> Disable
      if (isPIP && selectedMediaItems.length >= 1 && !isSelected(currentId)) {
          return true;
      }
      return false;
  };

  const handleCardClick = (video) => {
      if (isSelectionDisabled(video._id)) {
        toast.warn("Deselect current video First")
        return;
      };
      // Pass the FULL video object to the store
      toggleMediaSelection(video);
  };

  const handleNext = () => {
      // No API call here. Just move to the next step.
      navigate("/create/preview");
  }

  return (
    <div className="container-wrapper">
      <div className="main-content">
        
        {/* --- Header --- */}
        <div className="vs-header">
           <div className="vs-nav-title" onClick={onBack} style={{cursor: 'pointer'}}>
              <ArrowLeft size={20}  />
              <span style={{ fontSize: '1.6rem', marginLeft: '10px' }} >
                  Add videos to { selectedWidget || "Widget" }
              </span>
           </div>

           <div className="vs-nav-title">
              { selectedMediaItems?.length > 0 && 
                <Button 
                    onClick={handleNext} 
                    style={{ minWidth: '100px' }}
                > 
                    Next
                </Button> 
              }
           </div>
        </div>

        {/* --- Progress Bar --- */}
        <div className="vs-progress-container">
            <div className="vs-progress-track">
                <div className="vs-progress-fill"></div>
            </div>
            <div className="vs-steps-row">
                <span className="vs-back-link" onClick={() => navigate(-1)}>Back</span>
                <span>Step 2 of 3</span> {/* Updated to 3 steps since Preview is now separate */}
            </div>
        </div>

        {/* --- Search & Controls --- */}
        <div className="vs-controls">
            <div className="vs-label-group">
                Select Videos {isPIP && <span style={{fontSize: '0.8rem', color: '#ef4444', marginLeft: '8px'}}>(Max 1 for PIP)</span>}
            </div>
            
            <div className="vs-search-wrapper">
                <input 
                    type="text" 
                    placeholder="Search Products..." 
                    className="vs-search-input" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button className="vs-filter-btn">
                <Filter size={16} />
                <span>Filters</span>
            </button>
        </div>

        {/* --- Grid Content --- */}
        {isLibraryLoading ? (
             <ReelsTableShimmer />
        ) : isError ? (
             <div className="error-text">Failed to load library</div>
        ) : (
            <div className="vs-grid">
                {visibleReels.map((video) => {
                    const selected = isSelected(video._id);
                    const disabled = isSelectionDisabled(video._id);

                    return (
                        <div 
                            key={video._id} 
                            className={`vs-card ${selected ? 'selected' : ''} ${disabled ? 'disabled-card' : ''}`}
                            onClick={() => handleCardClick(video)}
                        >
                            <div className="vs-thumbnail">
                                {/* Thumbnail Image */}
                                {video.thumbnailUrl || video.url ? (
                                    <img 
                                        src={video.thumbnailUrl || video.url} 
                                        alt={video.title} 
                                        className="vs-thumb-img" 
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="vs-placeholder">No Preview</div>
                                )}
                                
                                {/* Gradient Overlay */}
                                <div className="vs-thumb-gradient"></div>

                                {/* Checkbox (Top Right) */}
                                <div className={`vs-checkbox ${selected ? 'checked' : ''}`}>
                                    {selected && <Check size={14} color="white" strokeWidth={3} />}
                                </div>

                                {/* Type Icon (Play/Image) */}
                                <div className="vs-play-icon">
                                    {video.mediaType === 'Video' ? (
                                        <Play size={12} fill="white" stroke="white" />
                                    ) : (
                                        <ImageIcon size={12} color="white" />
                                    )}
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="vs-card-footer">
                                 {/* Product Icon Indicator */}
                                 <div className={`vs-product-icon ${video.productId ? 'active' : ''}`}>
                                    <Package size={12} />
                                 </div>

                                 <div className="vs-product-title" title={video.title}>
                                    {video?.productName || video?.title || "Not a title"}
                                 </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

      </div>
    </div>
  );
};

export default VideoSelection;