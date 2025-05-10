// src/components/product/ProductExamples.js
import React from 'react';

/**
 * Composant pour afficher des exemples de produits
 */
const ProductExamples = ({ examples, onSelectExample }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Exemples de codes-barres</h3>
      <p className="text-sm text-green-700 mb-3">
        Si vous rencontrez des difficultés, essayez un de ces codes-barres qui fonctionnent bien avec l'API:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {examples.map((example) => (
          <button
            key={example.code}
            className="p-3 bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-200 transition-colors"
            onClick={() => onSelectExample(example.code)}
          >
            <div className="font-medium">{example.name}</div>
            <div className="text-sm text-gray-500">{example.code}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductExamples;