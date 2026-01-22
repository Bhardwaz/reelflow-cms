import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Plus, Play, Loader2, Check } from 'lucide-react';
import '../widgets-manager/WidgetManager';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import List from './List';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import useCreateWidget from './hooks/useCreateWidget';
import { Package } from 'lucide-react';

const WidgetPreview = ({ onBack }) => {
    const navigate = useNavigate();
    const [selectedVideo, setSelectedVideo] = useState(null);

    const selectedWidget = useWidgetStore((state) => state.selectedWidget);
    const heading = useWidgetStore((state) => state.heading);
    const selectedMediaItems = useWidgetStore((state) => state.selectedMediaItems);
    const toggleMediaSelection = useWidgetStore((state) => state.toggleMediaSelection);
    const isLive = useWidgetStore((state) => state.isLive);

    const setIsLive = useWidgetStore((state) => state.setIsLive);

    // API HOOK ---
    const { mutate, isPending } = useCreateWidget();

    const handleIntegrate = () => {
        const payload = {
            selectedWidget,
            heading,
            selectedMediaIds: selectedMediaItems.map(item => item._id),

            isLive: isLive,
            integrate: true,

            // Default config options
            config: {
                autoPlay: false,
                position: 'bottom-right'
            }
        };

        mutate(payload);
    };

    const handleDelete = (e, video) => {
        e.stopPropagation();
        const confirmed = window.confirm("Remove this video from the widget?");
        if (confirmed) {
            // This instantly removes it from the store & UI
            toggleMediaSelection(video);
            if (selectedVideo?._id === video._id) setSelectedVideo(null);
        }
    };

    const toggleLiveStatus = () => {
        setIsLive(!isLive);
    };

    return (
        <div className="container-wrapper">
            <div className="main-content">

                {/* --- HEADER --- */}
                <div className="vm-header">
                    <div className="vm-title-group" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                        <h1>Back</h1>
                    </div>

                    {/* PROGRESS BAR (Step 3 of 3) */}
                    <div className="vs-progress-container" style={{ maxWidth: '300px', margin: '0 20px' }}>
                        <div className="vs-steps-row" style={{ marginBottom: '5px' }}>
                            <span style={{ fontSize: '1.3rem', color: '#666' }}>Final Review</span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Step 3 of 3</span>
                        </div>
                        <div className="vs-progress-track">
                            <div className="vs-progress-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <div className='buttons-grp' style={{ display: "flex", gap: "1rem", alignItems: 'center' }}>
                        {/* <Button variant="secondary">
                            Preview in theme
                            <ExternalLink size={16} />
                        </Button> */}

                        {/* INTEGRATE BUTTON (Triggers Mutate) */}
                        <Button
                            onClick={handleIntegrate}
                            disabled={isPending || selectedMediaItems.length === 0}
                            style={{ minWidth: '140px' }}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Integrate
                                    <Check size={18} style={{ marginLeft: '8px' }} />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="vm-grid">

                    {/* LEFT PANEL */}
                    <div className="vm-left-panel">
                        <div className="vm-controls-card">

                            {/* Tabs */}
                            <div className="vm-tabs">
                                <div className="vm-tab active">
                                    <span> {selectedWidget?.toUpperCase() || "WIDGET"} </span>
                                    <span className="vm-tab-count"> {selectedMediaItems.length}</span>
                                </div>
                            </div>

                            {/* ACTION BAR: Add Videos + Live Toggle */}
                            <div className="vm-action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                {/* Add More Button */}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/create/library')}
                                    style={{ fontSize: '1.3rem', padding: '8px 12px' }}
                                >
                                    <Plus size={16} style={{ marginRight: '6px' }} />
                                    Add more videos
                                </Button>

                                {/* LIVE TOGGLE SWITCH */}
                                <div
                                    className="live-toggle-wrapper"
                                    onClick={toggleLiveStatus}
                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}
                                >
                                    <span style={{ fontSize: '1.3rem', color: isLive ? '#10b981' : '#6b7280', fontWeight: 600 }}>
                                        {isLive ? 'Instant Live' : 'Draft Mode'}
                                    </span>

                                    <div style={{
                                        width: '44px',
                                        height: '24px',
                                        backgroundColor: isLive ? '#10b981' : '#e5e7eb',
                                        borderRadius: '99px',
                                        position: 'relative',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: isLive ? '22px' : '2px',
                                            transition: 'left 0.2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Draggable List */}
                        <div className="vm-list">
                            {selectedMediaItems.map((video) => (
                                <List
                                    key={video._id}
                                    video={video}
                                    selectedVideo={selectedVideo}
                                    setSelectedVideo={setSelectedVideo}
                                    handleDelete={(e) => handleDelete(e, video)}
                                />
                            ))}

                            {selectedMediaItems.length === 0 && (
                                <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">
                                    No videos selected.
                                    <br />
                                    <span
                                        onClick={() => navigate('/create/library')}
                                        style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Click here to add some.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: PREVIEW */}
                    <div className="vm-preview-card">
                        {selectedVideo ? (
                            <div className="vm-preview-content">
                                <div className="vm-preview-video">
                                    {/* Real Thumbnail Preview */}
                                    <img
                                        src={selectedVideo.thumbnailUrl || selectedVideo.url}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Play size={24} fill="white" stroke="none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="vm-preview-details">
                                    <h3>{selectedVideo.title}</h3>
                                    {selectedVideo.productTitle && (
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                                            <Package size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                            {selectedVideo.productTitle}
                                        </p>
                                    )}
                                    <div className="mt-4 p-2 bg-gray-50 text-xs text-gray-500 rounded border">
                                        This is how your video will appear in the {selectedWidget} widget.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="vm-empty-state">
                                <p>Click on a video from the list to preview it here.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WidgetPreview;