// src/components/product/NameSearchForm.js
import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import AdvancedSearchFilters from '../AdvancedSearchFilters';
import { Link } from 'react-router-dom';

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
  // État pour gérer l'affichage des alertes d'autorisation
  const [alertMessage, setAlertMessage] = useState(null);

  // Fonction sécurisée pour vérifier l'autorisation
  const checkAuthorization = (action) => {
    if (typeof isAuthorized !== 'function') {
      return true; // Par défaut, autoriser si ce n'est pas une fonction
    }
    
    try {
      return isAuthorized(action);
    } catch (error) {
      console.error('Erreur lors de l\'appel à isAuthorized:', error);
      return true; // En cas d'erreur, autoriser par défaut
    }
  };

  // Wrapper sécurisé pour onSearch
  const handleSearch = () => {
    if (!checkAuthorization('searchName')) {
      showAuthorizationAlert();
      return;
    }
    
    if (typeof onSearch === 'function') {
      try {
        onSearch();
      } catch (error) {
        console.error('Erreur lors de l\'appel à onSearch:', error);
      }
    }
  };

  // Afficher un message d'alerte pour les fonctions non autorisées
  const showAuthorizationAlert = () => {
    setAlertMessage(
      "Vous avez atteint votre limite quotidienne de recherches par nom. Passez à un abonnement supérieur pour continuer."
    );
    
    // Masquer l'alerte après 5 secondes
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };
  
  // Réinitialiser l'alerte
  const dismissAlert = () => {
    setAlertMessage(null);
  };

  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e) => {
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
  
  // Vérifier si le bouton doit être désactivé
  const isButtonDisabled = loading || !checkAuthorization('searchName');
  
  // Message d'alerte
  const alertComponent = alertMessage && (
    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle size={16} className="text-amber-500 mr-2 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-amber-800">{alertMessage}</p>
          <div className="mt-2 flex space-x-2">
            <Link
              to="/abonnements"
              className="px-3 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors"
            >
              S'abonner
            </Link>
            <button 
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
              onClick={dismissAlert}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="mb-6">
      {alertComponent}
      
      {/* Version desktop */}
      {!isMobile && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            className={`flex-1 px-4 py-2 border ${alertMessage ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Saisissez le nom du produit (ex: macaroni, yaourt...)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`px-4 py-2 ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]`}
            onClick={handleSearch}
            disabled={loading}
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
            className={`w-full px-4 py-2 border ${alertMessage ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Saisissez le nom du produit (ex: macaroni, yaourt...)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`w-full px-4 py-2 ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center`}
            onClick={handleSearch}
            disabled={loading}
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
        if (typeof onApplyFilters === 'function') {
          try {
            onApplyFilters(filters);
          } catch (error) {
            console.error('Erreur lors de l\'appel à onApplyFilters:', error);
          }
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

export default NameSearchForm;