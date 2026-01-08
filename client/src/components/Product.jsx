import { useState } from 'react';
import './Product.css';

function Product({ idx, p, onSelect, isSelected }) {
   // 1. Initial State: Default to the global product image
   const [currentImage, setCurrentImage] = useState(p.image?.url || "");
   const [activeVariantId, setActiveVariantId] = useState(null);

   // 2. Safe Data Extraction
   const variants = p.variants || [];
   const firstVariant = variants.length > 0 ? variants[0] : {};
   
   // Logic for dynamic pricing based on selection (optional but recommended)
   const selectedVariant = variants.find(v => v.variant_id === activeVariantId) || firstVariant;
   const price = selectedVariant.sale_price || selectedVariant.price;
   const originalPrice = selectedVariant.compare_at_price;

   // 3. Variant Switch Logic
   const handleVariantClick = (e, variant) => {
      e.stopPropagation(); // Prevent the row click event from firing
      setActiveVariantId(variant.variant_id);
      
      // Map variant_id to the specific image in the images array
      const matchingImg = p.images.find(img => img.variant_id === variant.variant_id);
      if (matchingImg) {
         setCurrentImage(matchingImg.url);
      }
   };

   // 4. Format Currency
   const formatPrice = (amount) => {
      return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         maximumFractionDigits: 0,
      }).format(amount);
   };

   return (
      <tr 
         className={`product-row ${isSelected ? "selected-row" : ""}`} 
         onClick={onSelect}
         style={{ border: isSelected ? "3px solid #16a34a" : "1px solid #e5e7eb" }}
      >
         <td>{idx + 1}</td>

         {/* --- Dynamic Image Section --- */}
         <td className="product-image-cell">
            <img src={currentImage} alt={p.title} className="thumbnail-img" />
         </td>

         {/* --- Title & Variants Section --- */}
         <td className="product-info-cell">
            <div className="product-title" title={p.title}>{p.title}</div>
            
            {/* Color Swatches logic integrated here */}
            <div className="variant-swatches">
               {variants.map((v) => (
                  <button
                     key={v.id}
                     className={`swatch-btn ${activeVariantId === v.variant_id ? 'active' : ''}`}
                     style={{ backgroundColor: v.title.toLowerCase() }}
                     onClick={(e) => handleVariantClick(e, v)}
                     title={v.title}
                  />
               ))}
            </div>
         </td>

         {/* Pricing Block */}
         <td className="price-container">
            <div className="sale-price">{formatPrice(price)}</div>
            <div className="original-price">
               {originalPrice > price && formatPrice(originalPrice)}
            </div>
         </td>

         {/* Stock Status */}
         <td className={`stock-status ${p.available ? 'in-stock' : 'out-stock'}`}>
            {p.available ? "In Stock" : "Unavailable"}
         </td>

         {/* Action Button */}
         <td>
            <span className="add-to-cart-btn" style={{ background: isSelected ? "#dcfce7" : "", color: isSelected ? "#16a34a" : ""}}>
               {isSelected ? "✓ Attached" : "Attach to reel"}
            </span>
         </td>
      </tr>
   );
}

export default Product;