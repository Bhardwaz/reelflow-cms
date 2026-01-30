import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../sharable/Button';
import './UploadPage.css';
import { useSaveMedia } from './hooks/useSaveMedia';
import { ClipLoader } from 'react-spinners';
import useVideoUpload from './hooks/useVideoUpload';
import useImageUpload from './hooks/useImageUpload';
import { useAppBridge } from '../../../hooks/useAppBridge';
import { useSiteData } from './hooks/useSiteData';
import toast from 'react-hot-toast';
import useVideoUpload2 from './hooks/useVideoUpload2';
import { useChangeProduct } from './hooks/useChangeProduct';

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { mutate, isPending, isLoading, isError, error } = useSaveMedia();
  const { mutate: changeProduct, isPending: isUpdating } = useChangeProduct();

  // Extract state from navigation
  const { isEditMode = false, existingMedia = null, existingProduct = null } = location.state || {};
  
  const [media, setMedia] = useState(existingMedia);
  const [product, setProduct] = useState(existingProduct);
  const [progress, setProgress] = useState(null);

  const { data: siteData, isLoading: isSiteDataLoading } = useSiteData();
  const app = useAppBridge(siteData?.site);

  const handleProductModal = async () => {
    if (!app) return;
    const Component = app.actions.Components.create(app);
    const data = await Component.show('ProductPicker', [], { isSingle: true });
    
    if (data?.length > 1) {
      toast.error("You can only select single product with single video !");
    }

    if (data?.length === 1) {
      setProduct(data[0]);
      toast.success("Product Attached successfully");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMedia({
        file: file,
        url: URL.createObjectURL(file),
        type: file.type
      });
    }
  };

  const handleDelete = () => {
    // In edit mode, only clear product, not media
    if (isEditMode) {
      setProduct(null);
      toast.success("Product cleared");
    } else {
      setMedia(null);
      setProduct(null);
      setProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Selection cleared");
    }
  };

  const handleSubmit = async () => {
    if (!media) {
      toast.error("Please select a file first");
      return;
    }

    if (!product) {
      toast.error("Please choose a product as well with this");
      return;
    }

    let mediaType;
    const productName = product?.title;
    const productId = product?.id;
    const productImage = product?.cover;
    const title = media?.file?.name || media?.title;

    try {
      if (isEditMode) {
        const mediaId = media?.id

        const updateData = {
          productId: productId,
          productName: productName,
          productImage: productImage
        };
        
        await changeProduct({
          mediaId,
          updateData
        })
        toast.success("Product updated successfully");
        navigate(-1);
      } else {
        if (media.type.startsWith("video")) {
          mediaType = 'Video';
          console.log("use video upload 2 function starts");
          await useVideoUpload2(title, media, setProgress, mutate, productName, productId, productImage);
        }
        handleDelete();
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Something went wrong during upload");
    }
  };

  useEffect(() => {
    return () => {
      // Only revoke object URLs that we created, not existing media URLs
      if (media?.url && !isEditMode && media?.file) {
        URL.revokeObjectURL(media.url);
      }
    };
  }, [media, isEditMode]);

  console.log(product);

  return (
    <div className="upload-page-container">
      {/* Hidden Input - disabled in edit mode */}
      <input
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="video/*,image/*" 
        style={{ display: 'none' }}
        disabled={isEditMode}
      />

      <div className="page-header">
        <h1 className="header-title">
          {isEditMode ? 'Edit Media Product' : 'Add New Media'}
        </h1>

        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button 
            variant="secondary" 
            disabled={isEditMode ? !product : (!media && !product)} 
            onClick={() => handleDelete()}
          >
            {isEditMode ? 'Clear Product' : 'Delete'}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSubmit()} 
            disabled={!media || !product || isLoading}
          >
            {isLoading ? <ClipLoader color="#36d7b7" size={50} /> : (isEditMode ? "Update" : "Save")}
          </Button>
        </div>
      </div>

      <div className="content-body">
        <div className="left-panel">
          <div className="ui-card">
            <div className="card-header">
              <span className="card-title">Media Selector</span>
              {!isEditMode && (
                <Button variant="secondary" onClick={() => fileInputRef.current.click()}>
                  {media ? 'Change Media' : 'Select Media'}
                </Button>
              )}
            </div>

            <div className={`video-selector-box ${media ? 'filled' : ''}`}>
              {media ? (
                media.type?.startsWith('video') || media.mediaType === 'Video' ? (
                  <video
                    src={media.url}
                    className="selector-media"
                    autoPlay muted loop playsInline
                    controls={false}
                  />
                ) : (
                  <img src={media.url} className="selector-media" alt="select" />
                )
              ) : (
                <span className="empty-text">
                  {isEditMode ? 'Video locked in edit mode' : 'Pick only portrait video 9:16'}
                </span>
              )}
            </div>

            {isEditMode && (
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.75rem', 
                backgroundColor: '#fef3c7', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#92400e'
              }}>
                ℹ️ Edit mode: You can only change the product association
              </div>
            )}
          </div>

          {/* Card 2: Product */}
          <div className="ui-card">
            <div className="card-header">
              <span className="card-title">Product</span>
              {product && (
                <span
                  style={{ color: '#2563eb', cursor: 'pointer', fontSize: '0.9rem' }}
                  onClick={() => handleProductModal()}
                >
                  Change
                </span>
              )}
            </div>

            {product ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={product?.cover} style={{ width: '48px', borderRadius: '6px' }} alt="" />
                <div>
                  <div style={{ fontWeight: 600 }}>{product?.title}</div>
                </div>
              </div>
            ) : (
              <div className="product-btn" onClick={() => handleProductModal()}>
                Select product
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT PANEL: Preview --- */}
        <div className="right-panel">
          <div className="preview-container">
            {media ? (
              <>
                {media.type?.startsWith('video') || media.mediaType === 'Video' ? (
                  <video
                    src={media.url}
                    className="preview-media"
                    autoPlay muted loop playsInline
                    controls={true}
                  />
                ) : (
                  <img src={media.url} className="preview-media" alt="preview" />
                )}

                {product && (
                  <div className="preview-product-card">
                    <img src={product?.cover} style={{ width: '36px', borderRadius: '4px' }} alt="" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{product?.title}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoPage;