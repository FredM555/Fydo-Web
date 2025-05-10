// src/components/product/SearchResults.js
import React from 'react';
import SearchResultItem from '../SearchResultItem';

/**
 * Composant pour afficher les résultats de recherche
 */
const SearchResults = ({ 
  results, 
  totalResults, 
  searchTerm, 
  onSelectProduct, 
  onLoadMore, 
  loading,
  searchFilters
}) => {
  if (!results || results.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">
        Résultats de recherche pour "{searchTerm}" 
        <span className="text-green-600 ml-2">({totalResults} produits trouvés)</span>
      </h3>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 divide-y">
          {results.map((result) => (
            <SearchResultItem 
              key={result.code}
              result={result}
              onSelect={onSelectProduct}
              searchFilters={searchFilters}
            />
          ))}
        </div>
      </div>
      
      {/* Bouton "Charger plus" */}
      {results.length < totalResults && (
        <div className="mt-4 text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none flex items-center justify-center mx-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </>
            ) : `Afficher plus (${results.length} sur ${totalResults})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;