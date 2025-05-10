// src/hooks/useProductSearch.js
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProductsByName, fetchProductByBarcode, debugProductFields } from '../utils/searchUtils';
import { useAuth } from '../contexts/AuthContext';
import { addToHistory } from '../services/productService';
import useSubscriptionPermissions from './useSubscriptionPermissions';

/**
 * Hook personnalisé pour gérer la recherche de produits
 * Gère les états et la logique de recherche
 */
const useProductSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Récupérer les paramètres URL
  const urlBarcode = queryParams.get('barcode');
  const urlSearchQuery = queryParams.get('q');
  
  // États pour les onglets et formulaires
  const [activeTab, setActiveTab] = useState(urlBarcode ? 'barcode' : 'name');
  const [barcode, setBarcode] = useState(urlBarcode || '');
  const [productName, setProductName] = useState(urlSearchQuery || '');
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeSource, setBarcodeSource] = useState('manual_entry');
  
  // États pour les résultats de recherche
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchOrigin, setSearchOrigin] = useState('direct');
  
  // État pour la gestion des limites d'abonnement
  const [isSubscriptionLimited, setIsSubscriptionLimited] = useState(false);
  
  // États pour les filtres
  const [searchFilters, setSearchFilters] = useState({
    withIngredients: [],
    withoutIngredients: []
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Références
  const productDetailRef = useRef(null);
  const isUserInitiatedSearch = useRef(false);
  
  // Contexte et hooks
  const { currentUser, userDetails } = useAuth();
  const { isAuthorized, incrementUsage, getQuotaExceededMessage } = useSubscriptionPermissions();
  
  // Constantes
  const resultsPerPage = 20;
  const exampleBarcodes = [
    { code: '3523230014267', name: 'Yaourt chèvre nature' },
    { code: '3421557112003', name: 'Muesli+sans gluten Raisin, Figue, Banane' },
    { code: '3242274034054', name: 'Salade Roma' },
    { code: '3245412567734', name: 'Yaourt La Laitière' },
    { code: '3175680011480', name: 'Sésame' }
  ];
  
  // Effet pour traiter les paramètres d'URL
  useEffect(() => {
    if (isUserInitiatedSearch.current) {
      isUserInitiatedSearch.current = false;
      return;
    }
    
    const handleUrlParams = async () => {
      if (!currentUser) return;
      
      // Récupérer le paramètre openScanner
      const openScannerParam = queryParams.get('openScanner');
      
      // Vérifier si le scanner doit être ouvert automatiquement
      if (openScannerParam === 'true') {
        if (!isAuthorized('scan')) {
          setError(getQuotaExceededMessage('scan'));
          setIsSubscriptionLimited(true);
          navigate('/recherche-filtre', { replace: true });
          return;
        }
        
        setActiveTab('barcode');
        setShowScanner(true);
        setBarcodeSource('scan');
        
        navigate('/recherche-filtre', { replace: true });
        return;
      }
      
      // Si un code barre est présent dans l'URL, faire une recherche automatique
      if (urlBarcode) {
        setActiveTab('barcode');
        setBarcode(urlBarcode);
        await handleBarcodeSearch(urlBarcode, true);
      } 
      // Si un terme de recherche est présent dans l'URL, faire une recherche automatique
      else if (urlSearchQuery) {
        setActiveTab('name');
        setProductName(urlSearchQuery);
        await handleNameSearch(true, urlSearchQuery, null, true);
      }
    };
    
    handleUrlParams();
  }, [urlBarcode, urlSearchQuery, currentUser]);
  
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
      
      // Mettre à jour les quotas localement
      incrementUsage(interactionType);
      
      console.log(`Produit ajouté à l'historique: ${product.code} (${interactionType})`);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement dans l'historique:", error);
    }
  };
  
  // Mise à jour des paramètres d'URL
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
  
  // Callback pour le scan réussi
  const handleScanComplete = (scannedCode) => {
    setShowScanner(false);
    setBarcode(scannedCode);
    handleBarcodeSearch(scannedCode, false, 'scan');
  };
  
  // Recherche par code-barres
  const handleBarcodeSearch = async (barcodeToFetch = null, isInitialLoad = false, source = null) => {
    const codeToSearch = barcodeToFetch || barcode;
    const interactionSource = source || barcodeSource;
    
    if (!codeToSearch.trim()) {
      setError('Veuillez saisir un code-barres');
      return;
    }
    
    // Vérifier si l'utilisateur est autorisé
    if (!isInitialLoad && !isAuthorized(interactionSource)) {
      setError(getQuotaExceededMessage(interactionSource));
      setIsSubscriptionLimited(true);
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
          recordProductView(result.product, interactionSource);
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
  
  // Recherche par nom
  const handleNameSearch = async (newSearch = true, searchQuery = null, filters = null, isInitialLoad = false) => {
    const queryToSearch = searchQuery || productName;
    
    if (!queryToSearch.trim() && newSearch) {
      setError('Veuillez saisir un nom de produit');
      return;
    }
    
    // Vérifier si l'utilisateur est autorisé
    if (!isInitialLoad && newSearch && !isAuthorized('searchName')) {
      setError(getQuotaExceededMessage('searchName'));
      setIsSubscriptionLimited(true);
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

      // Enregistrer la recherche dans l'historique
      if (newSearch && !isInitialLoad && currentUser && userDetails && queryToSearch.trim()) {
        // Construire les critères de recherche
        let searchCriteria = `Recherche: ${queryToSearch.trim()}`;
        
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
          product_name: queryToSearch.trim(),
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
          
          // Mettre à jour le quota de recherche par nom
          incrementUsage('searchName');
        } catch (historyError) {
          console.error('Erreur lors de l\'enregistrement de la recherche:', historyError);
        }
      }
      
      if (result.status === 'filtered-empty') {
        setError(result.message || 'Aucun produit ne correspond aux filtres sélectionnés.');
        setSearchResults([]);
        setTotalResults(result.count || 0);
      } else {
        // Si c'est une nouvelle recherche, remplace les résultats, sinon ajoute aux résultats existants
        setSearchResults(prev => newSearch ? result.products : [...prev, ...result.products]);
        
        // Mettre à jour le nombre total pour l'affichage
        setTotalResults(result.count);
        
        // Mise à jour de la pagination
        setPage(newSearch ? 2 : page + 1);
        
        // Mettre à jour l'URL
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
  
  // Sélectionner un produit dans les résultats
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
        
        // Faire défiler la page vers le haut
        setTimeout(() => {
          if (productDetailRef.current) {
            productDetailRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          } else {
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
  
  // Charger plus de résultats
  const loadMoreResults = () => {
    handleNameSearch(false);
  };
  
  // Gérer l'application des filtres
  const handleApplyFilters = (filters) => {
    // Créer une copie locale des filtres
    const newFilters = {
      withIngredients: [...(filters.withIngredients || [])],
      withoutIngredients: [...(filters.withoutIngredients || [])]
    };

    setSearchFilters(newFilters);
    
    setFiltersApplied(
      (filters.withIngredients.length > 0) || 
      (filters.withoutIngredients.length > 0)
    );
    
    // Relancer la recherche si un nom de produit est déjà saisi
    if (productName.trim()) {
      handleNameSearch(true, null, newFilters);
    }
  };
  
  return {
    // États
    activeTab, setActiveTab,
    barcode, setBarcode,
    productName, setProductName,
    product, searchResults,
    loading, error, setError,
    totalResults, page,
    searchFilters, filtersApplied,
    showScanner, setShowScanner,
    barcodeSource, setBarcodeSource,
    searchOrigin,
    isSubscriptionLimited, setIsSubscriptionLimited,
    
    // Références
    productDetailRef,
    
    // Fonctions
    handleBarcodeSearch,
    handleNameSearch,
    handleScanComplete,
    selectProduct,
    loadMoreResults,
    handleApplyFilters,
    
    // Constantes
    exampleBarcodes,
    resultsPerPage
  };
};

export default useProductSearch;