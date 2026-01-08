import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ExternalLink, GripVertical, Eye, Trash2, Plus, Play
} from 'lucide-react';
import './WidgetsManager.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import List from './List';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import useRemoveMedia from './hooks/useRemoveMedia';
import useDeleteWidget from './hooks/useDeleteWidget';

const WidgetsManager = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('carousel');
  const [isLive, setIsLive] = useState(true);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate()

  const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
  const widgetsData = useWidgetStore(state => state.widgetsData)

  // current widget
  const currentWidget = widgetsData?.find(widget => widget._id === selectedWidgetId);
   
  // mutate for removing media 
  const { mutate: removeMedia, isPending: isRemoveMediaPending } = useRemoveMedia()
  const { mutate: deleteWidget, isPending: isDeletingWidget } = useDeleteWidget();

  useEffect(() => {
    if (currentWidget) {
      setIsLive((currentWidget?.isLive && currentWidget?.integrate) || false)
      setActiveTab(currentWidget?.widgetType?.toLowerCase() || 'carousel');

      const mappedVideos = currentWidget.items?.map(item => {
        const media = item.mediaId || {}

        return {
          _id: media._id || item._id,
          title: media.title || 'Untitled Video',
          product: media.productName || "No Product Linked",
          thumb: media.thumbnailUrl || '#e5e7eb',
          originalItemId: item._id,
          url: media.url,
          mediaType: media.mediaType
        }
      }) || []
      setVideos(mappedVideos)
    }
  }, [currentWidget])

  const handlePreviewClick = (e, video) => {
    e.stopPropagation();
    setSelectedVideo(video);
  };

  const handleDelete = (e, videoId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this video?");
    if (confirmed) {
      setVideos((prev) => prev.filter(v => v._id !== videoId));
      if (selectedVideo?._id === videoId) setSelectedVideo(null);
      
      removeMedia({
         widgetId: selectedWidgetId, 
         mediaId: videoId
      })
    }
  };

  const handleDeleteWidget = () => {
     if(!selectedWidgetId) return
     const widgetId = selectedWidgetId
    
    const confirmed = window.confirm(
       "Are you sure you want to delete this ENTIRE widget? This action cannot be undone."
    );

    if(confirmed) {
      deleteWidget(widgetId, {
        onSuccess: () => {
          navigate("/dashboard")
        }
      })
    }
  } 

  if (!currentWidget) {
    return (
      <div className="container-wrapper">
        <div className="main-content flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="mb-4 text-xl">No widget selected.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wrapper">
      <div className="main-content">

        <div className="vm-header">
          <div className="vm-title-group" onClick={onBack}>
            <ArrowLeft size={20} />
            <h1>{currentWidget.name.toUpperCase() || 'Widget Manager'}</h1>
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', alignItems:'center' }}>
            <Button onClick={() => handleDeleteWidget()}>
               <Trash2 size={16} />
               Delete this widget
            </Button>

            <Button>
              Preview in theme
              <ExternalLink size={16} />
            </Button>
          </div>
        </div>

        <div className="vm-grid">

          <div className="vm-left-panel">
            <div className="vm-controls-card">

              <div className="vm-tabs">
                <div
                  className={`vm-tab ${activeTab === 'carousel' ? 'active' : ''}`}
                // Optional: Disable clicking if we want tabs to represent ONLY the current widget type
                // onClick={() => setActiveTab('carousel')}
                >
                  Carousel <span className="vm-tab-count">{activeTab === 'carousel' ? videos.length : 0}</span>
                </div>
                <div
                  className={`vm-tab ${activeTab === 'story' ? 'active' : ''}`}
                // onClick={() => setActiveTab('story')}
                >
                  Story <span className="vm-tab-count">{activeTab === 'story' ? videos.length : 0}</span>
                </div>
                <div
                  className={`vm-tab ${activeTab === 'floating' ? 'active' : ''}`}
                // onClick={() => setActiveTab('floating')}
                >
                  Floating <span className="vm-tab-count">{activeTab === 'floating' ? videos.length : 0}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="vm-action-bar">
                <div className="vm-toggle-wrapper">
                  <span className={`vm-toggle-label ${isLive ? 'live' : 'off'}`}>
                    {isLive ? 'Live' : 'Inactive'}
                  </span>
                  <label className="vm-switch">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={() => setIsLive(!isLive)}
                    />
                    <span className="vm-slider"></span>
                  </label>
                </div>

                <Button onClick={() => navigate('/create/library')}>
                  <div className='icon-box'> <Plus size={16} /> </div>
                  Add more videos
                </Button>
              </div>

            </div>

            {/* Draggable List */}
            <div className="vm-list">
              {videos.map((video) => (
                <List
                  handlePreviewClick={(e) => handlePreviewClick(e, video)}
                  selectedVideo={selectedVideo}
                  video={video}
                  handleDelete={handleDelete}
                  key={video._id}
                />
              ))}

              {videos.length === 0 && (
                <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">
                  No videos in this widget. Click "Add more videos".
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: PREVIEW */}
          <div className="vm-preview-card">
            {selectedVideo ? (
              <div className="vm-preview-content">

                <div className="vm-preview-video">

                  {/* LOGIC: Detect Bunny Embed (Iframe) vs Direct Video vs Image */}
                  {(selectedVideo.url?.includes('iframe') || selectedVideo.url?.includes('mediadelivery')) ? (
                    // 1. IFRAME (For Bunny Embed URLs)
                    <iframe
                      src={selectedVideo.url}
                      className="vm-media-element"
                      loading="lazy"
                      style={{ border: 'none', width: '100%', height: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen={true}
                    ></iframe>
                  ) : selectedVideo.mediaType === 'Video' ? (
                    // 2. VIDEO TAG (For .mp4 / Direct URLs)
                    <video
                      src={selectedVideo.url}
                      poster={selectedVideo.thumb}
                      className="vm-media-element"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    // 3. IMAGE TAG Fallback
                    <img
                      src={selectedVideo.url || selectedVideo.thumb}
                      alt={selectedVideo.title}
                      className="vm-media-element"
                    />
                  )}

                  {/* Play Icon Overlay (Only for Direct Videos, NOT Iframes) */}
                  {selectedVideo.mediaType === 'VIDEO' &&
                    !selectedVideo.url?.includes('iframe') &&
                    !selectedVideo.url?.includes('mediadelivery') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play size={20} fill="white" stroke="none" opacity={0.8} />
                        </div>
                      </div>
                    )}

                </div>

                <div className="vm-preview-details">
                  <h3>{selectedVideo.title}</h3>
                  <p>Linked Product: {selectedVideo.product}</p>
                  <div className="mt-4 p-2 bg-gray-50 text-xs text-gray-500 rounded border">
                    This is a preview of how the media appears in the sidebar widget.
                  </div>
                </div>
              </div>
            ) : (
              <div className="vm-empty-state">
                <p>Click on a video to preview it</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default WidgetsManager;