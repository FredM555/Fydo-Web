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
  console.log('NameSearchForm - Render avec props:', {
    productName,
    searchFilters,
    filtersApplied,
    isMobile,
    isAuthorized: typeof isAuthorized,
    loading
  });

  // Fonction sécurisée pour vérifier l'autorisation
  const checkAuthorization = (action) => {
    console.log('NameSearchForm - checkAuthorization appelé avec:', action);
    console.log('NameSearchForm - isAuthorized est de type:', typeof isAuthorized);
    
    if (typeof isAuthorized !== 'function') {
      console.warn('NameSearchForm - isAuthorized n\'est pas une fonction!');
      return true; // Par défaut, autoriser si ce n'est pas une fonction
    }
    
    try {
      const result = isAuthorized(action);
      console.log('NameSearchForm - résultat de isAuthorized:', result);
      return result;
    } catch (error) {
      console.error('NameSearchForm - Erreur lors de l\'appel à isAuthorized:', error);
      return true; // En cas d'erreur, autoriser par défaut
    }
  };

  // Wrapper sécurisé pour onSearch
  const handleSearch = () => {
    console.log('NameSearchForm - handleSearch appelé');
    console.log('NameSearchForm - onSearch est de type:', typeof onSearch);
    
    if (typeof onSearch !== 'function') {
      console.error('NameSearchForm - onSearch n\'est pas une fonction!');
      return;
    }
    
    try {
      console.log('NameSearchForm - Appel de onSearch');
      onSearch();
      console.log('NameSearchForm - onSearch exécuté avec succès');
    } catch (error) {
      console.error('NameSearchForm - Erreur lors de l\'appel à onSearch:', error);
    }
  };

  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e) => {
    console.log('NameSearchForm - handleKeyDown avec touche:', e.key);
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Déstructurer searchFilters en toute sécurité
  const safeSearchFilters = searchFilters || { withIngredients: [], withoutIngredients: [] };
  const withIngredients = Array.isArray(safeSearchFilters.withIngredients) 
    ? safeSearchFilters.withIngredients 
    : [];
  const withoutIngredients = Array.isArray(safeSearchFilters.withoutIngredients) 
    ? safeSearchFilters.withoutIngredients 
    : [];
  
  console.log('NameSearchForm - safeSearchFilters:', safeSearchFilters);
  
  // Vérifier si le bouton doit être désactivé
  const isButtonDisabled = loading || (typeof isAuthorized === 'function' && !isAuthorized('searchName'));
  console.log('NameSearchForm - isButtonDisabled:', isButtonDisabled);
  
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
            onChange={(e) => {
              console.log('NameSearchForm - onChange:', e.target.value);
              setProductName(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]"
            onClick={() => {
              console.log('NameSearchForm - onClick button');
              handleSearch();
            }}
            disabled={isButtonDisabled}
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
            onClick={() => {
              console.log('NameSearchForm (mobile) - onClick button');
              handleSearch();
            }}
            disabled={isButtonDisabled}
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
      <AdvancedSearchFilters onApplyFilters={(filters) => {
        console.log('NameSearchForm - onApplyFilters appelé avec:', filters);
        if (typeof onApplyFilters === 'function') {
          try {
            onApplyFilters(filters);
            console.log('NameSearchForm - onApplyFilters exécuté avec succès');
          } catch (error) {
            console.error('NameSearchForm - Erreur lors de l\'appel à onApplyFilters:', error);
          }
        } else {
          console.error('NameSearchForm - onApplyFilters n\'est pas une fonction!');
        }
      }} />
      
      {/* Affichage des filtres actifs */}
      {filtersApplied && (
        <div className="bg-blue-50 rounded-md p-3 mt-2 flex items-start">
          <Info size={18} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Filtres actifs :</p>
            <ul className="mt-1 ml-4 list-disc">
              {withIngredients.length > 0 && (
                <li>AVEC : {withIngredients.join(', ')}</li>
              )}
              {withoutIngredients.length > 0 && (
                <li>SANS : {withoutIngredients.join(', ')}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

console.log('Module NameSearchForm chargé');

export default NameSearchForm;