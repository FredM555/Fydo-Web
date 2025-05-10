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
            <h1 className="text-3xl font-bold text-green-800 mb-2">Recherche de Produit <span className="text-green-600">...</span></h1>
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
          
          {/* Formulaire de recherche par code-barres */}
          {(!activeTab || activeTab === 'barcode') && (
            <BarcodeSearchForm
              barcode={barcode}
              setBarcode={setBarcode}
              onSearch={handleBarcodeSearch}
              onScan={handleScanComplete}
              isMobile={isMobileDevice}
              showScanner={showScanner}
              setShowScanner={setShowScanner}
              setBarcodeSource={setBarcodeSource}
              isAuthorized={isAuthorized}
              loading={loading}
            />
          )}
          
          {/* Formulaire de recherche par nom */}
          {activeTab === 'name' && (
            <NameSearchForm
              productName={productName}
              setProductName={setProductName}
              onSearch={handleNameSearch}
              onApplyFilters={handleApplyFilters}
              searchFilters={searchFilters}
              filtersApplied={filtersApplied}
              isMobile={isMobileDevice}
              isAuthorized={isAuthorized}
              loading={loading}
            />
          )}
          
          {/* Message d'erreur */}
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
                handleBarcodeSearch(code);
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