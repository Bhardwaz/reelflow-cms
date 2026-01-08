import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import Button from './Button'; // Adjust path to your generic Button
import './ProductSelectionModal.css'; // We will create this next
import useGetAllProducts from './hooks/useGetAllProducts';

const ProductSelectionModal = ({ 
  isOpen, 
  onClose,
  onSelect, 
  title = "Select product" 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { data: products, isLoading: isGettingProductsLoading, isError: isGettingProductsError, error: gettingProductsError } = useGetAllProducts();

  const productsList = products?.products || []

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter logic
  const filteredProducts = productsList.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    const prod = productsList.find(p => p.id === selectedId);
    if (prod) {
      onSelect(prod);
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        
        {/* HEADER & SEARCH */}
        <div className="modal-header">
          <div className="modal-title">
            <span>{title}</span>
            <X size={20} className="close-icon" onClick={onClose} />
          </div>
          <div className="search-wrapper">
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               className="modal-search-input" 
               placeholder="Search products..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               autoFocus
             />
          </div>
        </div>

        {/* BODY: LIST OR EMPTY STATE */}
        <div className="modal-body">
          { isGettingProductsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading products...</div>
          ) : productsList.length === 0 ? (
             // EMPTY STATE
             <div className="empty-state-container">
                <span className="empty-state-icon">📦</span>
                <p className="empty-title">No products found</p>
                <p className="empty-desc">
                  No products found for your website.<br/>
                  <span className="empty-link">Go to JoonWeb and upload</span>
                </p>
             </div>
          ) : filteredProducts.length === 0 ? (
             // NO SEARCH RESULTS
             <div className="empty-state-container">
                <p>No results found for "{searchTerm}"</p>
             </div>
          ) : (
             // PRODUCT LIST
             filteredProducts.map(prod => {
              const imageUrl = prod.image?.thumbnailUrl || prod.images?.[0]?.thumbnailUrl || ''; 
              const price = prod.variants?.[0]?.price || '0';

               return (
                  <div 
                    key={prod.id} 
                    className={`product-row ${selectedId === prod.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(prevId => prevId === prod.id ? null : prod.id)}
                  >
                    <div className="custom-checkbox">
                       {selectedId === prod.id && <Check size={14} />}
                    </div>
                    
                    <div className="product-info">
                       {/* Image */}
                       <div 
                         className="modal-product-img-wrapper"
                         style={{ backgroundImage: `url(${imageUrl})` }}
                       />
                       
                       <div style={{flex:1, minWidth: 0}}>
                          {/* Title */}
                          <div className="prod-name truncate" title={prod.title}>
                             {prod.title}
                          </div>
                          {/* Status */}
                          <div className="prod-status capitalize">
                             {prod.status || 'active'}
                          </div>
                       </div>
                       
                       {/* Price */}
                       <div className="product-price">
                          ₹{price}
                       </div>
                    </div>
                  </div>
                );
             })
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
           <div className="selection-count">
              {selectedId ? "1 product selected" : "0 products selected"}
           </div>
           <div className="modal-actions">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" disabled={!selectedId} onClick={handleConfirm}>
                Select
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductSelectionModal;