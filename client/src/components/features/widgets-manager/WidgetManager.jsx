import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ExternalLink, GripVertical, Eye, Trash2, Plus, Play,
  Power, Video 
} from 'lucide-react';
import './WidgetManager.css';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';
import List from '../widget/List';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import useRemoveMedia from '../widget/hooks/useRemoveMedia';
import useDeleteWidget from '../widget/hooks/useDeleteWidget';
import useToggleLive from './hooks/useToggleLive';

import Empty from '../../sharable/Empty'; 

const WidgetManager = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('carousel');
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate()

  const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
  const widgetsData = useWidgetStore(state => state.widgetsData);
  const currentWidget = widgetsData?.find(widget => widget._id === selectedWidgetId);
  const filteredItems = currentWidget?.items.filter(item => !item.mediaId.isDeleted)

  // mutate for removing media 
  const { mutate: removeMedia, isPending: isRemoveMediaPending } = useRemoveMedia()
  const { mutate: deleteWidget, isPending: isDeletingWidget } = useDeleteWidget();
  const { mutate: toggleLive, isLoading: isGoingLive, error } = useToggleLive()

  useEffect(() => {
    if (!selectedWidgetId) { navigate('/video/pages', { replace: true }) }
  }, [selectedWidgetId, navigate]);

  const handlePreviewClick = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
  };

  const handleDelete = (e, videoId, zustandId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this video?");
    if (confirmed) {
      if (selectedItem?._id === videoId) setSelectedItem(null);

      removeMedia({
        widgetId: selectedWidgetId,
        mediaId: videoId,
        zustandId
      })
    }
  };

  const handleDeleteWidget = () => {
    if (!selectedWidgetId) return
    const widgetId = selectedWidgetId

    const confirmed = window.confirm(
      "Are you sure you want to delete this ENTIRE widget? This action cannot be undone."
    );

    if (confirmed) {
      console.log("deleting the widget");

      deleteWidget(widgetId, {
        onSuccess: () => {
          navigate("/video/pages")
        }
      })
    }
  }

  const handleLive = () => {
    if (!selectedWidgetId) return
    toggleLive(
      {
        widgetId: selectedWidgetId,
      });
  }
  
  if (!selectedWidgetId) return null;
  
  if (!currentWidget) {
    return (
      <div className="container-wrapper">
        <div className="main-content flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="mb-4 text-xl">No widget selected.</p>
            <Button onClick={() => navigate(-1)}>Go to Widgets</Button>
          </div>
        </div>
      </div>
    );
  }

  console.log(widgetsData, "widgets data")

  console.log(filteredItems, "filtered items")
   
  return (
    <div className="container-wrapper">
      <div className="main-content">

        <div className="vm-header">
          <div className="vm-title-group" onClick={onBack}>
            <ArrowLeft size={20} />
            <h1>{currentWidget.name.toUpperCase() || 'Widget Manager'}</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Button onClick={() => handleDeleteWidget()}>
              <Trash2 size={16} />
              Delete this widget
            </Button>

            <Button
              onClick={() => handleLive()}
              disabled={isGoingLive} //
              className={isGoingLive ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Power
                size={16}
                color={isGoingLive ? "#9ca3af" : (currentWidget?.isLive ? "#9ca3af" : "#22c55e")}
              />
              {isGoingLive ? "Updating..." : (currentWidget?.isLive ? "Turn Off" : "Turn On")}
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
                  Carousel <span className="vm-tab-count">{activeTab === 'carousel' ? filteredItems.length : 0}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="vm-action-bar">

                <Button onClick={() => navigate('/attach/media')}>
                  <div className='icon-box'> <Plus size={16} /> </div>
                  Attach more videos
                </Button>
              </div>

            </div>

            {/* Draggable List */}
            <div className="vm-list">
              {filteredItems?.map((item) => (
                <List
                  handlePreviewClick={(e) => handlePreviewClick(e, item)}
                  selectedItem={selectedItem}
                  item={item}
                  handleDelete={handleDelete}
                  key={item._id}
                />
              ))}

              {filteredItems?.length === 0 && (
                 <div className="mt-8">
                    <Empty 
                        variant="small"
                        icon={Video}
                        title="No videos attached"
                        description="This widget is empty. Attach videos from your library."
                        actionLabel="Attach Videos"
                        onAction={() => navigate('/attach/media')}
                    />
                 </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: PREVIEW */}
          <div className="vm-preview-card">
            {selectedItem ? (
              <div className="vm-preview-content">

                <div className="vm-preview-video">

                  {(selectedItem?.mediaId?.url?.includes('iframe') || selectedItem?.mediaId?.url?.includes('mediadelivery')) ? (
                    <iframe
                      src={selectedItem?.mediaId?.url}
                      className="vm-media-element"
                      loading="lazy"
                      style={{ border: 'none', width: '100%', height: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen={true}
                    ></iframe>
                  ) : selectedItem?.mediaId?.mediaType === 'Video' ? (
                    // 2. VIDEO TAG (For .mp4 / Direct URLs)
                    <video
                      src={selectedItem?.mediaId?.url}
                      poster={selectedItem?.mediaId?.thumb}
                      className="vm-media-element"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    // 3. IMAGE TAG Fallback
                    <img
                      src={selectedItem?.mediaId?.url}
                      alt={selectedItem?.mediaId?.title}
                      className="vm-media-element"
                    />
                  )}

                  {/* Play Icon Overlay (Only for Direct Videos, NOT Iframes) */}
                  {selectedItem?.mediaId?.mediaType === 'Video' &&
                    !selectedItem?.mediaId?.url?.includes('iframe') &&
                    !selectedItem?.mediaId?.url?.includes('mediadelivery') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play size={20} fill="white" stroke="none" opacity={0.8} />
                        </div>
                      </div>
                    )}

                </div>

                <div className="vm-preview-details">
                  <h3>{selectedItem?.mediaId?.title}</h3>
                  <p>Linked Product: {selectedItem?.mediaId?.product}</p>
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

export default WidgetManager;