// src/components/ProductSearchEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Search, Barcode, Filter, Info, MessageSquare } from 'lucide-react';
import ProductDetail from './ProductDetail';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import { searchProductsByName, fetchProductByBarcode, filterProductByAllFields, formatIngredients, debugProductFields } from '../utils/searchUtils';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../contexts/AuthContext';
import { addToHistory } from '../services/productService';
import SearchResultItem from './SearchResultItem';

const ProductSearchEnhanced = () => {
  // Récupérer les paramètres d'URL avec useLocation
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Extraire les paramètres d'URL
  const urlBarcode = queryParams.get('barcode');
  const urlSearchQuery = queryParams.get('q');
  
  const [activeTab, setActiveTab] = useState(urlBarcode ? 'barcode' : 'name');
  const [barcode, setBarcode] = useState(urlBarcode || '');
  const [productName, setProductName] = useState(urlSearchQuery || '');
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 20;
  const [searchFilters, setSearchFilters] = useState({
    withIngredients: [],
    withoutIngredients: []
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Ajouter le contexte d'authentification
  const { currentUser, userDetails } = useAuth();
  // État pour suivre l'origine de la recherche
  const [searchOrigin, setSearchOrigin] = useState('direct');
  
  // Référence pour le conteneur des détails du produit
  const productDetailRef = React.useRef(null);
  
  // Référence pour suivre si la modification d'URL est déclenchée par un clic sur le bouton
  const isUserInitiatedSearch = useRef(false);
  
  // Liste d'exemples de codes-barres qui fonctionnent bien avec OpenFoodFacts
  const exampleBarcodes = [
    { code: '3523230014267', name: 'Yaourt chèvre nature' },
    { code: '3421557112003', name: 'Muesli+sans gluten Raisin, Figue, Banane' },
    { code: '3242274034054', name: 'Salade Roma' },
    { code: '3245412567734', name: 'Yaourt La Laitière' },
    { code: '3175680011480', name: 'Sésame' }
  ];

  // Fonction pour enregistrer l'historique
  const recordProductView = async (product, interactionType) => {
    if (!product || !product.code || !currentUser || !userDetails) return;
    
    try {
      // Extraire les métadonnées du produit
      const productMetadata = {
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url
      };
      
      // Enregistrer dans l'historique
      await addToHistory(
        userDetails.id,
        product.code,
        interactionType,
        productMetadata
      );
      
      console.log(`Produit ajouté à l'historique: ${product.code} (${interactionType})`);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement dans l'historique:", error);
    }
  };

  // Mise à jour des paramètres d'URL lors du changement des filtres/recherches
  const updateUrlParams = (type, value, shouldTriggerSearch = false) => {
    isUserInitiatedSearch.current = shouldTriggerSearch;
    
    const newParams = new URLSearchParams(location.search);
    
    // Réinitialiser d'abord les paramètres non pertinents
    if (type === 'barcode') {
      newParams.delete('q');
      if (value) newParams.set('barcode', value);
      else newParams.delete('barcode');
    } else if (type === 'search') {
      newParams.delete('barcode');
      if (value) newParams.set('q', value);
      else newParams.delete('q');
    }
    
    // Mettre à jour l'URL sans recharger la page
    navigate({
      pathname: location.pathname,
      search: newParams.toString()
    }, { replace: true });
  };

  // Traiter les paramètres d'URL au chargement initial ou lorsqu'ils changent
  useEffect(() => {
    // Si la recherche est déclenchée par l'utilisateur (via le bouton), ne pas exécuter
    if (isUserInitiatedSearch.current) {
      isUserInitiatedSearch.current = false;
      return;
    }
    
    const handleUrlParams = async () => {
      // Si un code barre est présent dans l'URL, faire une recherche automatique
      if (urlBarcode) {
        setActiveTab('barcode');
        setBarcode(urlBarcode);
        await handleFetchProduct(urlBarcode, true);
      } 
      // Si un terme de recherche est présent dans l'URL, faire une recherche automatique
      else if (urlSearchQuery) {
        setActiveTab('name');
        setProductName(urlSearchQuery);
        await handleSearchByName(true, urlSearchQuery, null, true);
      }
    };
    
    handleUrlParams();
  }, [urlBarcode, urlSearchQuery]); // Se déclenche uniquement lors du changement des paramètres d'URL

  // Recherche par code-barres
  const handleFetchProduct = async (barcodeToFetch = null, isInitialLoad = false) => {
    const codeToSearch = barcodeToFetch || barcode;
    
    if (!codeToSearch.trim()) {
      setError('Veuillez saisir un code-barres');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSearchOrigin('direct');

    try {
      const result = await fetchProductByBarcode(codeToSearch);
      
      if (result.status === 'not-found') {
        setError(result.message || 'Produit non trouvé. Essayez un des exemples ci-dessous.');
        setProduct(null);
      } else {
        setProduct(result.product);
        
        // Ajouter à l'historique seulement si ce n'est pas le chargement initial
        if (!isInitialLoad) {
          recordProductView(result.product, 'manual_entry');
        }
        
        // Pour le débogage, vérifier les champs disponibles
        console.log('Données du produit récupéré:');
        debugProductFields(result.product);
        
        // Mettre à jour l'URL si le code-barres est différent et si ce n'est pas un chargement initial
        if (codeToSearch !== urlBarcode && !isInitialLoad) {
          updateUrlParams('barcode', codeToSearch, true);
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des données. Essayez un des exemples ci-dessous.');
      setProduct(null);
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Recherche par nom de produit avec filtres
  const handleSearchByName = async (newSearch = true, searchQuery = null, filters = null, isInitialLoad = false) => {
    const queryToSearch = searchQuery || productName;
    
    if (!queryToSearch.trim() && newSearch) {
      setError('Veuillez saisir un nom de produit');
      return;
    }

    setLoading(true);
    setError(null);
    
    if (newSearch) {
      setProduct(null);
      setPage(1);
      setSearchResults([]);
    }
    
    // Utiliser les filtres passés en paramètre ou les filtres enregistrés dans l'état
    const filtersToUse = filters || searchFilters;
    
    try {
      console.log('handleSearchByName: Recherche avec filtres:', filtersToUse);
      
      // Paramètres pour la recherche continue
      const minResults = 5;
      const maxPages = 5;
      
      // Recherche de produits avec les filtres
      const result = await searchProductsByName(
        queryToSearch, 
        filtersToUse, 
        newSearch ? 1 : page,
        resultsPerPage,
        minResults,
        maxPages
      );

      // Enregistrer la recherche dans l'historique SEULEMENT si c'est une nouvelle recherche
      if (newSearch && !isInitialLoad && currentUser && userDetails && (searchQuery || productName).trim()) {
        // Construire les critères de recherche
        let searchCriteria = `Recherche: ${productName.trim()}`;
        
        if (filtersToUse.withIngredients && filtersToUse.withIngredients.length > 0) {
          searchCriteria += ` AVEC: ${filtersToUse.withIngredients.join(', ')}`;
        }
        
        if (filtersToUse.withoutIngredients && filtersToUse.withoutIngredients.length > 0) {
          searchCriteria += ` SANS: ${filtersToUse.withoutIngredients.join(', ')}`;
        }
        
        // Ajouter le nombre de résultats trouvés
        const totalResultsCount = result.count || 0;
        
        // Créer un enregistrement générique pour la recherche
        const searchMetadata = {
          product_name: productName.trim(),
          search_criteria: searchCriteria,
          total_results: totalResultsCount
        };
        
        try {
          await addToHistory(
            userDetails.id,
            'search_' + new Date().getTime(),
            'searchName',
            searchMetadata,
            totalResultsCount
          );
          console.log(`Recherche enregistrée dans l'historique (${totalResultsCount} résultats trouvés)`);
        } catch (historyError) {
          console.error('Erreur lors de l\'enregistrement de la recherche:', historyError);
        }
      }
      
      if (result.status === 'filtered-empty') {
        setError(result.message || 'Aucun produit ne correspond aux filtres sélectionnés.');
        setSearchResults([]);
        setTotalResults(result.count || 0);
      } else {
        // Afficher le nombre de pages parcourues
        if (result.pagesSearched > 1) {
          console.log(`${result.pagesSearched} pages parcourues pour trouver ${result.filteredCount} résultats`);
        }
        
        // Si c'est une nouvelle recherche, remplace les résultats, sinon ajoute aux résultats existants
        setSearchResults(prev => newSearch ? result.products : [...prev, ...result.products]);
        
        console.log(`Produits après filtrage: ${result.filteredCount}`);
        
        // Pour le débogage, vérifier les champs d'un produit
        if (result.products.length > 0) {
          console.log('Exemple de produit après filtrage:');
          debugProductFields(result.products[0]);
        }
        
        // Mettre à jour le nombre total pour l'affichage
        setTotalResults(result.count);
        
        // Mise à jour de la pagination
        if (!newSearch) {
          setPage(page + 1);
        } else {
          setPage(2);
        }
        
        // Mettre à jour l'URL si le terme de recherche est différent et si ce n'est pas un chargement initial
        if (queryToSearch !== urlSearchQuery && newSearch && !isInitialLoad) {
          updateUrlParams('search', queryToSearch, true);
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la recherche. Veuillez réessayer.');
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des filtres de recherche avancée
  const handleApplyFilters = (filters) => {
    console.log('handleApplyFilters: Nouveaux filtres reçus:', filters);
    // Créer une copie locale des filtres pour s'assurer qu'ils soient disponibles immédiatement
    const newFilters = {
      withIngredients: [...(filters.withIngredients || [])],
      withoutIngredients: [...(filters.withoutIngredients || [])]
    };

    // S'assurer que les tableaux sont correctement copiés
    setSearchFilters(newFilters);
    
    setFiltersApplied(
      (filters.withIngredients.length > 0) || 
      (filters.withoutIngredients.length > 0)
    );
    
    // Relancer la recherche si un nom de produit est déjà saisi
    if (productName.trim()) {
      handleSearchByName(true, null, newFilters);
    }
  };
  
  // Charger plus de résultats
  const loadMoreResults = () => {
    handleSearchByName(false);
  };

  // Gestionnaire d'événement pour la touche Entrée dans le champ code-barres
  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFetchProduct();
    }
  };
  
  // Gestionnaire d'événement pour la touche Entrée dans le champ nom de produit
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchByName();
    }
  };

  // Sélectionner un produit spécifique dans les résultats de recherche
  const selectProduct = async (productCode) => {
    setLoading(true);
    setError(null);
    setBarcode(productCode);
    setSearchOrigin('results');
    
    try {
      const result = await fetchProductByBarcode(productCode);
      
      if (result.status === 'not-found') {
        setError('Impossible de charger les détails du produit.');
        setProduct(null);
      } else {
        setProduct(result.product);
        // Ajouter à l'historique
        recordProductView(result.product, 'search');
        // Mettre à jour l'URL avec le code-barres sélectionné
        updateUrlParams('barcode', productCode, true);
        
        // Faire défiler la page vers le haut après le rendu du produit
        setTimeout(() => {
          if (productDetailRef.current) {
            productDetailRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          } else {
            // Fallback - remonter au début de la page si la référence n'est pas disponible
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    } catch (err) {
      setError('Erreur lors du chargement des détails du produit.');
      setProduct(null);
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-green-50">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center max-w-md w-full mx-4">
            <svg className="animate-spin h-12 w-12 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-lg font-medium text-green-800 mb-2">Recherche en cours...</h3>
            <p className="text-green-600 text-center">Veuillez patienter pendant que nous recherchons les informations du produit</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Recherche de Produit <span className="text-green-600">...</span></h1>
            <p className="text-green-700">Recherchez un produit par code-barres ou par nom avec des filtres avancés</p>
          </div>
          
          {/* Onglets de recherche */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('barcode')}
                className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
                  activeTab === 'barcode' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Barcode size={20} />
                <span>Recherche par code-barres</span>
              </button>
              <button
                onClick={() => setActiveTab('name')}
                className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
                  activeTab === 'name' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search size={20} />
                <span>Recherche par nom</span>
              </button>
            </div>
          </div>
          
          {/* Formulaire de recherche par code-barres */}
          {activeTab === 'barcode' && (
            <div className="mb-6 flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Saisissez le code-barres (ex: 3017620422003)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
              />
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]"
                onClick={() => handleFetchProduct()}
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
          
          {/* Formulaire de recherche par nom avec filtres avancés */}
          {activeTab === 'name' && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Saisissez le nom du produit (ex: macaroni, yaourt...)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                />
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]"
                  onClick={() => handleSearchByName()}
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
              
              {/* Filtres avancés */}
              <AdvancedSearchFilters onApplyFilters={handleApplyFilters} />
              
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
          )}

          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* Affichage des détails du produit */}
          {product && (
            <div className="mb-6 relative bg-white rounded-lg shadow-md" ref={productDetailRef}>
              <ProductDetail product={product} />
            </div>
          )}
          
{/* Résultats de la recherche par nom */}
{activeTab === 'name' && searchResults.length > 0 && !product && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">
      Résultats de recherche pour "{productName}" 
      <span className="text-green-600 ml-2">({totalResults} produits trouvés)</span>
    </h3>
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 divide-y">
        {searchResults.map((result) => (
          <SearchResultItem 
            key={result.code}
            result={result}
            onSelect={selectProduct}
            searchFilters={searchFilters}
          />
        ))}
      </div>
    </div>
    
    {/* Bouton "Charger plus" si tous les résultats ne sont pas affichés */}
    {searchResults.length < totalResults && (
      <div className="mt-4 text-center">
        <button
          onClick={loadMoreResults}
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
          ) : `Afficher plus (${searchResults.length} sur ${totalResults})`}
        </button>
      </div>
    )}
  </div>
)}

          {!product && !loading && !error && searchResults.length === 0 && !(urlBarcode || urlSearchQuery) && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === 'barcode' 
                  ? "Saisissez un code-barres et cliquez sur Rechercher pour afficher les informations du produit" 
                  : filtersApplied
                    ? "Saisissez un nom de produit avec vos filtres pour trouver des produits correspondant à vos critères"
                    : "Saisissez un nom de produit et cliquez sur Rechercher ou utilisez les filtres avancés pour affiner votre recherche"}
              </p>
            </div>
          )}
          
          {/* Section d'exemples de codes-barres */}
          {!product && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Exemples de codes-barres</h3>
              <p className="text-sm text-green-700 mb-3">Si vous rencontrez des difficultés, essayez un de ces codes-barres qui fonctionnent bien avec l'API:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {exampleBarcodes.map((example) => (
                  <button
                    key={example.code}
                    className="p-3 bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-200 transition-colors"
                    onClick={() => {
                      setBarcode(example.code);
                      setActiveTab('barcode');
                      handleFetchProduct(example.code);
                    }}
                  >
                    <div className="font-medium">{example.name}</div>
                    <div className="text-sm text-gray-500">{example.code}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-green-100 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Recherche avancée</h3>
            <p className="text-sm text-green-700">
              Cette version améliorée vous permet de rechercher des produits en spécifiant les ingrédients que vous souhaitez inclure ou exclure.
              Par exemple, vous pouvez chercher des "macaroni" SANS "gluten" et AVEC "céleri".
            </p>
            <p className="text-sm text-green-700 mt-2">
              Note: La précision des résultats dépend de la qualité des données d'OpenFoodFacts. Certains produits peuvent ne pas avoir tous leurs ingrédients correctement enregistrés.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSearchEnhanced;