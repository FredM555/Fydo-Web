// src/components/ProductSearchEnhanced.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthRequiredScreen from './common/AuthRequiredScreen';
import UsageQuotaDisplay from './product/UsageQuotaDisplay';
import SearchTabs from './product/SearchTabs';
import BarcodeSearchForm from './product/BarcodeSearchForm';
import NameSearchForm from './product/NameSearchForm';
import ProductDetails from './product/ProductDetails';
import SearchResults from './product/SearchResults';
import ProductExamples from './product/ProductExamples';
import LoadingOverlay from './common/LoadingOverlay';
import ErrorMessage from './common/ErrorMessage';
import InfoBox from './common/InfoBox';
import useProductSearch from '../hooks/useProductSearch';
import useSubscriptionPermissions from '../hooks/useSubscriptionPermissions';

/**
 * Composant principal de recherche de produits
 * Gère l'interface utilisateur et coordonne les sous-composants
 */
const ProductSearchEnhanced = () => {
  // Récupérer l'état de navigation et d'authentification
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // État pour suivre l'erreur liée à l'abonnement
  const [subscriptionError, setSubscriptionError] = useState(null);
  
  // Utiliser les hooks personnalisés pour la recherche et les autorisations
  const {
    activeTab, setActiveTab,
    barcode, setBarcode,
    productName, setProductName,
    product, searchResults,
    totalResults, loading, error,
    searchFilters, filtersApplied,
    handleBarcodeSearch,
    handleNameSearch,
    handleScanComplete,
    loadMoreResults,
    selectProduct,
    handleApplyFilters,
    showScanner, setShowScanner,
    barcodeSource, setBarcodeSource,
    productDetailRef,
    exampleBarcodes,
    isSubscriptionLimited, setIsSubscriptionLimited
  } = useProductSearch();
  
  const {
    userQuotas,
    userLimits,
    isAuthorized
  } = useSubscriptionPermissions();
  
  // Vérifier si l'appareil est mobile
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Détection de l'appareil mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Effet au chargement pour s'assurer que l'onglet scan est prioritaire
  useEffect(() => {
    // S'assurer que l'onglet "barcode" (scan) est sélectionné par défaut
    if (!activeTab || activeTab !== 'barcode') {
      setActiveTab('barcode');
    }
  }, []);
  
  // Redirection vers la page d'abonnements
  const handleUpgradeSubscription = () => {
    navigate('/abonnements');
  };

  // Fonction modifiée pour vérifier les limites d'abonnement avant la recherche par saisie de code-barres
  const handleBarcodeSearchWithCheck = (code) => {
    if (!isAuthorized('manual_search')) {
      setSubscriptionError("Vous avez atteint votre limite de recherches manuelles par code-barres pour aujourd'hui. Veuillez mettre à niveau votre abonnement pour continuer.");
      return;
    }
    
    setSubscriptionError(null);
    handleBarcodeSearch(code);
  };

  // Fonction modifiée pour vérifier les limites d'abonnement avant la recherche par nom
  const handleNameSearchWithCheck = (name) => {
    if (!isAuthorized('search_by_name')) {
      setSubscriptionError("Vous avez atteint votre limite de recherches par nom pour aujourd'hui. Veuillez mettre à niveau votre abonnement pour continuer.");
      return;
    }
    
    setSubscriptionError(null);
    handleNameSearch(name);
  };

  // Fonction modifiée pour vérifier les limites d'abonnement avant le scan avec l'appareil photo
  const handleScanCompleteWithCheck = (scannedCode) => {
    if (!isAuthorized('scan_barcode')) {
      setSubscriptionError("Vous avez atteint votre limite de scans avec l'appareil photo pour aujourd'hui. Veuillez mettre à niveau votre abonnement pour continuer.");
      return;
    }
    
    setSubscriptionError(null);
    handleScanComplete(scannedCode);
  };
  
  // Si l'utilisateur n'est pas connecté, afficher l'écran d'authentification requise
  if (!currentUser) {
    return <AuthRequiredScreen redirectPath="/recherche-filtre" />;
  }
  
  return (
    <section className="py-12 bg-green-50">
      {/* Overlay de chargement */}
      {loading && <LoadingOverlay />}
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Titre de la page */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Recherche de Produit <span className="text-green-600">..</span></h1>
            <p className="text-green-700">Recherchez un produit par code-barres ou par nom avec des filtres avancés</p>
          </div>
          
          {/* Affichage des quotas d'utilisation */}
          <UsageQuotaDisplay 
            userQuotas={userQuotas}
            userLimits={userLimits}
            isSubscriptionLimited={isSubscriptionLimited}
            onUpgrade={handleUpgradeSubscription}
          />
          
          {/* Onglets de recherche - on s'assure que "barcode" est l'onglet actif par défaut */}
          <SearchTabs 
            activeTab={activeTab || 'barcode'} 
            onTabChange={setActiveTab} 
            defaultTab="barcode"
          />
          
          {/* Alerte d'erreur d'abonnement */}
          {subscriptionError && (
            <div className="mb-4 p-4 border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{subscriptionError}</p>
                  <div className="mt-2">
                    <button
                      onClick={handleUpgradeSubscription}
                      className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Mettre à niveau mon abonnement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Formulaire de recherche par code-barres */}
          {(!activeTab || activeTab === 'barcode') && (
            <BarcodeSearchForm
              barcode={barcode}
              setBarcode={setBarcode}
              onSearch={handleBarcodeSearchWithCheck}
              onScan={handleScanCompleteWithCheck}
              isMobile={isMobileDevice}
              showScanner={showScanner}
              setShowScanner={setShowScanner}
              setBarcodeSource={setBarcodeSource}
              isAuthorized={(action) => isAuthorized(action)}
              loading={loading}
            />
          )}
          
          {/* Formulaire de recherche par nom */}
          {activeTab === 'name' && (
            <NameSearchForm
              productName={productName}
              setProductName={setProductName}
              onSearch={handleNameSearchWithCheck}
              onApplyFilters={handleApplyFilters}
              searchFilters={searchFilters}
              filtersApplied={filtersApplied}
              isMobile={isMobileDevice}
              isAuthorized={(action) => isAuthorized(action)}
              loading={loading}
            />
          )}
          
          {/* Message d'erreur général */}
          {error && <ErrorMessage message={error} />}
          
          {/* Affichage des détails du produit */}
          {product && (
            <ProductDetails 
              product={product}
              showDetailedInfo={isAuthorized('detailed_info')}
              ref={productDetailRef}
            />
          )}
          
          {/* Résultats de recherche */}
          {activeTab === 'name' && searchResults.length > 0 && !product && (
            <SearchResults
              results={searchResults}
              totalResults={totalResults}
              searchTerm={productName}
              onSelectProduct={selectProduct}
              onLoadMore={loadMoreResults}
              loading={loading}
              searchFilters={searchFilters}
            />
          )}
          
          {/* Message quand aucune recherche n'est effectuée */}
          {!product && !loading && !error && searchResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {(!activeTab || activeTab === 'barcode') 
                  ? "Saisissez un code-barres et cliquez sur Rechercher pour afficher les informations du produit" 
                  : filtersApplied
                    ? "Saisissez un nom de produit avec vos filtres pour trouver des produits correspondant à vos critères"
                    : "Saisissez un nom de produit et cliquez sur Rechercher ou utilisez les filtres avancés pour affiner votre recherche"}
              </p>
            </div>
          )}
          
          {/* Exemples de codes-barres */}
          {!product && (!activeTab || activeTab === 'barcode') && (
            <ProductExamples 
              examples={exampleBarcodes}
              onSelectExample={(code) => {
                setBarcode(code);
                setActiveTab('barcode');
                handleBarcodeSearchWithCheck(code);
              }}
            />
          )}
          
          {/* Informations sur la recherche avancée */}
          <InfoBox 
            title="Recherche avancée"
            className="mt-6 p-4 bg-green-100 rounded-md"
          >
            <p className="text-sm text-green-700">
              Cette version améliorée vous permet de rechercher des produits en spécifiant les ingrédients que vous souhaitez inclure ou exclure.
              Par exemple, vous pouvez chercher des "macaroni" SANS "gluten" et AVEC "céleri".
            </p>
            <p className="text-sm text-green-700 mt-2">
              Note: La précision des résultats dépend de la qualité des données d'OpenFoodFacts. Certains produits peuvent ne pas avoir tous leurs ingrédients correctement enregistrés.
            </p>
          </InfoBox>
        </div>
      </div>
    </section>
  );
};

export default ProductSearchEnhanced;