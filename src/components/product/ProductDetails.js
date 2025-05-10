// src/components/product/ProductDetails.js
import React, { forwardRef } from 'react';
import ProductDetail from '../ProductDetail';

/**
 * Composant pour afficher les détails d'un produit
 */
const ProductDetails = forwardRef(({ product, showDetailedInfo }, ref) => {
  if (!product) return null;
  
  // Convertir showDetailedInfo en booléen pour s'assurer qu'il n'est pas un objet
  const shouldShowDetailedInfo = !!showDetailedInfo;
  
  return (
    <div className="mb-6 relative bg-white rounded-lg shadow-md" ref={ref}>
      <ProductDetail 
        product={product} 
        showDetailedInfo={shouldShowDetailedInfo}
      />
    </div>
  );
});

// Ajouter un nom d'affichage pour faciliter le débogage
ProductDetails.displayName = 'ProductDetails';

export default ProductDetails;