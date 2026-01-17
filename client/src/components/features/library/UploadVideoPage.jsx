import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { mutate, isPending, isLoading, isError, error } = useSaveMedia();

  const [media, setMedia] = useState(null);
  const [product, setProduct] = useState(null);
  const [progress, setProgress] = useState(null)

  const { data: siteData, isLoading: isSiteDataLoading } = useSiteData();
  const app = useAppBridge(siteData?.site);

  const handleProductModal = async () => {
    if (!app) return;
    const Component = app.actions.Components.create(app)
    const data = await Component.show('ProductPicker');
    if (data?.length > 1) {
      toast.error("You can only select single product with single video !")
    }

    if (data?.length === 1) {
      setProduct(data[0]);
      toast.success("Product Attached successfully");
    }
  }

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
    setMedia(null);
    setProduct(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Selection cleared");
  };

  const handleSubmit = async () => {
    if (!media) {
      toast.error("Please select a file first");
      return;
    }

    if (!product) {
      toast.error("Please choose a product as well with this");
      return;
    };

    let mediaType
    const productName = product?.title
    const productId = product?.id
    const productImage = product?.cover
    const title = media?.file?.name

    try {
      if (media.type.startsWith("video")) {
        mediaType = 'Video'
        await useVideoUpload2(title, media, setProgress, mutate, productName, productId, productImage)
      }

      // if (media.type.startsWith("image")) {
      //   mediaType = 'Image'
      //   await useImageUpload(title, media, setProgress, mutate, productName, productId, mediaType)
      // }

      handleDelete() // reset the state
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Something went wrong during upload");
    }
  };

  useEffect(() => {
    return () => {
      if (media?.url) URL.revokeObjectURL(media.url);
    };
  }, [media]);

  console.log(product)

  return (
    <div className="upload-page-container">

      {/* Hidden Input */}
      <input
        type="file" ref={fileInputRef} onChange={handleFileChange}
        accept="video/*,image/*" style={{ display: 'none' }}
      />

      <div className="page-header">
        <h1 className="header-title">Add New Video</h1>

        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="secondary" disabled={!media && !product} onClick={() => handleDelete()}>Delete</Button>
          <Button variant="primary" onClick={() => handleSubmit()} disabled={!media || !product || isLoading}>
            {isLoading ? <ClipLoader color="#36d7b7" size={50} /> : "Save"}
          </Button>
        </div>
      </div>

      <div className="content-body">

        <div className="left-panel">

          <div className="ui-card">
            <div className="card-header">
              <span className="card-title">Media Selector</span>
              <Button variant="secondary" onClick={() => fileInputRef.current.click()}>
                {media ? 'Change Media' : 'Select Media'}
              </Button>
            </div>

            <div className={`video-selector-box ${media ? 'filled' : ''}`}>
              {media ? (
                media.type.startsWith('video') ? (
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
                <span className="empty-text">Pick only portrait video 9:16</span>
              )}
            </div>
          </div>

          {/* Card 2: Product */}
          <div className="ui-card">
            <div className="card-header">
              <span className="card-title">Product</span>
              {product && (
                // TRIGGER MODAL ON CHANGE
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
                  {/* <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{product?.price}</div> */}
                </div>
              </div>
            ) : (
              // TRIGGER MODAL ON SELECT
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
                {media.type.startsWith('video') ? (
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
                      {/* <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{product?.price}</div> */}
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