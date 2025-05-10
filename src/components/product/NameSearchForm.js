// src/components/product/NameSearchForm.js
import React from 'react';
import { Info } from 'lucide-react';
import AdvancedSearchFilters from '../AdvancedSearchFilters';

/**
 * Formulaire de recherche par nom avec filtres
 */
const NameSearchForm = ({
  productName,
  setProductName,
  onSearch,
  onApplyFilters,
  searchFilters,
  filtersApplied,
  isMobile,
  isAuthorized,
  loading
}) => {
  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };
  
  return (
    <div className="mb-6">
      {/* Version desktop */}
      {!isMobile && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Saisissez le nom du produit (ex: macaroni, yaourt...)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]"
            onClick={() => onSearch()}
            disabled={loading || !isAuthorized('searchName')}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche...
              </>
            ) : 'Rechercher'}
          </button>
        </div>
      )}
      
      {/* Version mobile */}
      {isMobile && (
        <div className="space-y-2 mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Saisissez le nom du produit (ex: macaroni, yaourt...)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            onClick={() => onSearch()}
            disabled={loading || !isAuthorized('searchName')}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche...
              </>
            ) : 'Rechercher'}
          </button>
        </div>
      )}
      
      {/* Filtres avancés */}
      <AdvancedSearchFilters onApplyFilters={onApplyFilters} />
      
      {/* Affichage des filtres actifs */}
      {filtersApplied && (
        <div className="bg-blue-50 rounded-md p-3 mt-2 flex items-start">
          <Info size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Filtres actifs :</p>
            <ul className="mt-1 ml-4 list-disc">
              {searchFilters.withIngredients.length > 0 && (
                <li>AVEC : {searchFilters.withIngredients.join(', ')}</li>
              )}
              {searchFilters.withoutIngredients.length > 0 && (
                <li>SANS : {searchFilters.withoutIngredients.join(', ')}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameSearchForm;