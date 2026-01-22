import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Filter, Check, Play, Image as ImageIcon, Package,
    AlertCircle, Video, SearchX
} from 'lucide-react';
import toast from 'react-hot-toast'; // Added toast import
import './AttachVideosToWidget.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import { useFetchLibrary } from "../library/hooks/useFetchLibrary";
import ReelsTableShimmer from "../../shimmir/ReelsTableShimmer";
import useAttachMedia from './hooks/useAttachMedia';

import Empty from '../../sharable/Empty';

const AttachVideosToWidget = ({ onBack }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const { mutate, isLoading } = useAttachMedia();

    // 1. Store Data
    const attachMediaItemsToWidget = useWidgetStore((state) => state.attachMediaItemsToWidget) || [];
    const toggleAttachMediaItems = useWidgetStore((state) => state.toggleAttachMediaItems);
    const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
    const attachMediaItemsWidgetType = useWidgetStore((state) => state.attachMediaItemsWidgetType);

    const { data: library, isLoading: isLibraryLoading, isError, refetch } = useFetchLibrary();
    const reelsList = Array.isArray(library) ? library : (library?.data || []);

    const nonDeletedReels = reelsList.filter(reel => !reel?.isDeleted);

    const visibleReels = nonDeletedReels.filter((item) =>
        item?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isPIP = attachMediaItemsWidgetType?.toLowerCase().includes('pip');

    const isSelected = (id) => attachMediaItemsToWidget.some((item) => item._id === id);

    const isSelectionDisabled = (currentId) => {
        if (isPIP && attachMediaItemsToWidget.length >= 1 && !isSelected(currentId)) {
            return true;
        }
        return false;
    };

    const handleCardClick = (video) => {
        if (isSelectionDisabled(video._id)) {
            toast.error("PIP widgets only support 1 video. Deselect the current one first.");
            return;
        };
        toggleAttachMediaItems(video);
    };

    const handleNext = () => {
        mutate({
            mediaIds: attachMediaItemsToWidget,
            widgetId: selectedWidgetId
        });
    }

    useEffect(() => {
        if (!selectedWidgetId) {
            navigate('/video/pages', { replace: true });
        }
    }, [selectedWidgetId, navigate]);

    const isGlobalEmpty = !isLibraryLoading && !isError && nonDeletedReels.length === 0;

    return (
        <div className="container-wrapper">
            <div className="main-content">

                {/* --- Header --- */}
                <div className="vs-header">
                    <div className="vs-nav-title" onClick={onBack} style={{ cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontSize: '1.6rem', marginLeft: '10px' }} >
                            Add videos to {attachMediaItemsWidgetType || "Widget"}
                        </span>
                    </div>

                    <div className="vs-nav-title">
                        {attachMediaItemsToWidget?.length > 0 &&
                            <Button
                                onClick={handleNext}
                                style={{ minWidth: '100px' }}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Attach Videos"}
                            </Button>
                        }
                    </div>
                </div>

                <div className="vs-progress-container">
                    <div className="vs-progress-track">
                        <div className="vs-progress-fill"></div>
                    </div>
                    <div className="vs-steps-row">
                        <span className="vs-back-link" onClick={() => navigate(-1)}>Back</span>
                        <span>Step 2 of 3</span>
                    </div>
                </div>

                {/* --- Controls (Search & Filter) --- */}
                {/* Only show controls if we actually have data in the library (not empty, not error) */}
                {!isGlobalEmpty && !isError && !isLibraryLoading && (
                    <div className="vs-controls">
                        <div className="vs-label-group">
                            Select Videos {isPIP && <span style={{ fontSize: '0.8rem', color: '#ef4444', marginLeft: '8px' }}>(Max 1 for PIP)</span>}
                        </div>

                        <div className="vs-search-wrapper">
                            <input
                                type="text"
                                placeholder="Search Products or Titles..."
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
                )}

                {/* --- Main Content Area (State Handling) --- */}

                {isLibraryLoading ? (
                    /* 1. LOADING STATE */
                    <ReelsTableShimmer />

                ) : isError ? (
                    /* 2. ERROR STATE */
                    <div className="mt-12">
                        <Empty
                            icon={AlertCircle}
                            title="Unable to load library"
                            description="Something went wrong while fetching your videos."
                            actionLabel="Try Again"
                            onAction={() => refetch()}
                        />
                    </div>

                ) : isGlobalEmpty ? (
                    /* 3. GLOBAL EMPTY (No videos at all) */
                    <div className="mt-12">
                        <Empty
                            icon={Video}
                            title="Your library is empty"
                            description="You need to upload videos before you can attach them to a widget."
                            actionLabel="Upload Videos"
                            onAction={() => navigate('/upload/media')}
                        />
                    </div>

                ) : visibleReels.length === 0 ? (
                    /* 4. SEARCH EMPTY (Videos exist, but search found nothing) */
                    <div className="mt-12">
                        <Empty
                            icon={SearchX}
                            title="No videos found"
                            description={`We couldn't find any videos matching "${searchTerm}"`}
                            actionLabel="Clear Search"
                            onAction={() => setSearchTerm('')}
                        />
                    </div>

                ) : (
                    /* 5. SUCCESS GRID */
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

                                        <div className="vs-thumb-gradient"></div>

                                        <div className={`vs-checkbox ${selected ? 'checked' : ''}`}>
                                            {selected && <Check size={14} color="white" strokeWidth={3} />}
                                        </div>

                                        <div className="vs-play-icon">
                                            {video.mediaType === 'Video' ? (
                                                <Play size={12} fill="white" stroke="white" />
                                            ) : (
                                                <ImageIcon size={12} color="white" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="vs-card-footer">
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

export default AttachVideosToWidget;