import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Play,
  Sparkles,
  Package,
  UploadCloud,
  Youtube,
  ChevronDown,
  Instagram,
  Image as ImageIcon,
  Trash2,
  Video,
  SearchX
} from 'lucide-react';

import "./Reels.css";
import ReelsTableShimmer from "../../shimmir/ReelsTableShimmer";
import Button from "../../sharable/Button"
import Dropdown from "../../sharable/Dropdown";
import { useFetchLibrary } from "./hooks/useFetchLibrary";
import { useSiteData } from "./hooks/useSiteData";
import { useDeleteMedia } from "./hooks/useDeleteMedia";

import Empty from "../../sharable/Empty";

export default function Reels() {
  const navigate = useNavigate();
  const { data: userInfo } = useSiteData()

  const {
    data: library,
    isLoading: isLibraryLoading,
    isError: isLibraryError,
    error: libraryError,
    refetch
  } = useFetchLibrary();

  const { mutateAsync, isLoading: isDeleting } = useDeleteMedia()

  const [searchTerm, setSearchTerm] = useState("");

  const rawData = Array.isArray(library) ? library : (library?.data) || []
  const reelsList = rawData.filter(item => !item.isDeleted);

  const visibleReels = reelsList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = item.title?.toLowerCase().includes(term);
    const matchesProduct = item.productName?.toLowerCase().includes(term);
    return matchesTitle || matchesProduct;
  });

  const isGlobalEmpty = !isLibraryLoading && !isLibraryError && reelsList.length === 0;

  const handleDelete = async (e, mediaId) => {
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this media?")) {
      try {
        console.log("Deleting media:", mediaId);
        await mutateAsync(mediaId)
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  console.log(userInfo)

  return (
    <div className="reels-container">
      <main className="reels-main">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <header className="reels-global-header">
              <div className="reels-logo-icon">
                <Sparkles size={16} fill="white" />
              </div>
              <h1>JoonWeb Shoppable Reels</h1>
            </header>

            <h3 style={{ marginTop: "0.5rem", fontSize: "1.4rem", fontWeight: 700, color: "#444", lineHeight: 1.4 }}>
              👋 Hi, <span style={{ fontWeight: 600, color: "#000" }}> {userInfo?.site} </span>
            </h3>
          </div>

          <Dropdown trigger={<Button variant="primary">Upload Media <ChevronDown size={16} style={{ marginLeft: '4px' }} /></Button>}>
            <button className="dropdown-item" onClick={() => navigate('/upload/media')}>
              <UploadCloud size={16} /> <span>Upload from Computer</span>
            </button>
            {/* <button className="dropdown-item"> <Instagram size={16} /> <span>Import from Instagram</span> </button>
            <button className="dropdown-item"> <Youtube size={16} /> <span>Import from YouTube</span> </button> */}
          </Dropdown>
        </div>

        {!isGlobalEmpty && !isLibraryError && (
          <div className="reels-card">
            <div className="reels-toolbar">
              <label className="reels-toolbar-label">Select Media</label>
              <div className="reels-search-wrapper">
                <Search size={18} className="reels-search-icon" />
                <input
                  type="text"
                  placeholder="Search Products..."
                  className="reels-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <button className="reels-btn reels-btn-secondary"> <Filter size={16} /> Filters </button> */}
            </div>

            <p className="reels-helper-text">
              Manage your shoppable videos and images. Click on a media item to edit details or tag products.
            </p>

            <div className="mt-6">
              {isLibraryLoading ? (
                <ReelsTableShimmer />

              ) : isLibraryError ? (
                <div className="mt-12">
                  <Empty
                    icon={Video}
                    title="Unable to load library"
                    description={libraryError?.message || "Something went wrong."}
                    actionLabel="Retry"
                    onAction={() => window.location.reload()}
                  />
                </div>

              ) : isGlobalEmpty ? (
                /* CASE 1: Library is completely empty */
                <div className="mt-12">
                  <Empty
                    icon={Video}
                    title="Your Library is Empty"
                    description="Upload your first video to get started with shoppable reels."
                    actionLabel="Upload Video"
                    onAction={() => navigate('/upload/media')}
                  />
                </div>

              ) : visibleReels.length === 0 ? (
                /* CASE 2: Search yielded no results */
                <div className="mt-12">
                  <Empty
                    icon={SearchX}
                    title="No media found"
                    description={`We couldn't find any videos or products matching "${searchTerm}"`}
                    actionLabel="Clear Search"
                    onAction={() => setSearchTerm('')}
                  />
                </div>

              ) : (

                /* CASE 3: Show Grid */
                <div className="reels-grid">
                  {visibleReels.map((reel) => (
                    <div
                      key={reel._id}
                      className="reel-item-card group"
                    // onClick={() => navigate(`/reels/edit/${reel._id}`)}
                    >
                      <div className="reel-thumb-container">

                        {/* Thumbnail Logic */}
                        {reel.thumbnailUrl || reel.url ? (
                          <img
                            src={reel.thumbnailUrl || reel.url}
                            alt={reel.title}
                            className="reel-thumb-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="reel-placeholder">No Preview</div>
                        )}

                        {/* Type Overlay */}
                        <div className="play-overlay">
                          {reel.mediaType === 'Video' ? (
                            <Play size={14} fill="black" stroke="black" />
                          ) : (
                            <ImageIcon size={14} color="black" />
                          )}
                        </div>

                        <button
                          className="delete-icon-btn"
                          onClick={(e) => handleDelete(e, reel._id)}
                          title="Delete Media"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>

                      </div>

                      <div className="reel-card-footer">
                        <div className={`product-icon-box ${reel.productId ? 'active' : ''}`}>
                          <Package size={14} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <span className="reel-title" title={reel.title}>
                            {reel.title || "Untitled Media"}
                          </span>
                          {reel.productName && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                              Linked: {reel.productName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}