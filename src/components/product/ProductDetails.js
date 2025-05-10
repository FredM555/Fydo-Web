// src/components/product/ProductDetails.js
import React, { forwardRef } from 'react';
import ProductDetail from '../ProductDetail';

/**
 * Composant pour afficher les détails d'un produit
 */
const ProductDetails = forwardRef(({ product, showDetailedInfo }, ref) => {
  if (!product) return null;
  
  return (
    <div className="mb-6 relative bg-white rounded-lg shadow-md" ref={ref}>
      <ProductDetail 
        product={product} 
        showDetailedInfo={showDetailedInfo}
      />
    </div>
  );
});

export default ProductDetails;