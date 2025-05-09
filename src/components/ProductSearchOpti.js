// src/components/ProductSearchOpti.js
import React, { useState } from 'react';
import { Star, Search, Barcode } from 'lucide-react';
import ProductDetail from './ProductDetail';

const ProductSearchOpti = () => {
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode' ou 'name'
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 20;
  
  // Liste d'exemples de codes-barres qui fonctionnent bien avec OpenFoodFacts
  const exampleBarcodes = [
    { code: '3523230014267', name: 'Yaourt chèvre nature' },
    { code: '3421557112003', name: 'Muesli+sans gluten Raisin, Figue, Banane' },
    { code: '3242274034054', name: 'Salade Roma' },
    { code: '3245412567734', name: 'Yaourt La Laitière' },
    { code: '3175680011480', name: 'Sésame' }
  ];

  // Recherche par code-barres
  const fetchProduct = async () => {
    if (!barcode.trim()) {
      setError('Veuillez saisir un code-barres');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 100 secondes timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'ProductInfoApp/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 0) {
        setError('Produit non trouvé. Essayez un des exemples ci-dessous.');
        setProduct(null);
      } else {
        setProduct(data.product);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('La requête a pris trop de temps. Veuillez réessayer.');
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        setError('Erreur lors de la récupération des données. Essayez un des exemples ci-dessous.');
      }
      setProduct(null);
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Recherche par nom de produit
  const searchProductsByName = async (newSearch = true) => {
    if (!productName.trim() && newSearch) {
      setError('Veuillez saisir un nom de produit');
      return;
    }

    setLoading(true);
    setError(null);
    
    if (newSearch) {
      setProduct(null);
      setPage(1);
      setSearchResults([]); // Réinitialise les résultats si c'est une nouvelle recherche
    }
    
    const currentPage = newSearch ? 1 : page;
    
    try {
      const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&json=1&page=${currentPage}&page_size=${resultsPerPage}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 100 secondes timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'ProductInfoApp/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.count === 0 || !data.products || data.products.length === 0) {
        setError('Aucun produit trouvé avec ce nom. Essayez un autre terme de recherche.');
        setSearchResults([]);
        setTotalResults(0);
      } else {
        // Si c'est une nouvelle recherche, remplace les résultats, sinon ajoute aux résultats existants
        setSearchResults(prev => newSearch ? data.products : [...prev, ...data.products]);
        
        // Assurons-nous que le nombre total est correctement défini
        setTotalResults(data.count || data.products.length);
        
        if (!newSearch) {
          setPage(currentPage + 1); // Incrémente le numéro de page pour la prochaine requête
        } else {
          setPage(2); // Réinitialise à la page 2 car on vient de charger la page 1
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('La requête a pris trop de temps. Veuillez réessayer.');
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        setError('Erreur lors de la recherche. Veuillez réessayer.');
      }
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger plus de résultats
  const loadMoreResults = () => {
    searchProductsByName(false);
  };

  // Gestionnaire d'événement pour la touche Entrée dans le champ code-barres
  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchProduct();
    }
  };
  
  // Gestionnaire d'événement pour la touche Entrée dans le champ nom de produit
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchProductsByName();
    }
  };
  
  // Sélectionner un produit spécifique dans les résultats de recherche
  const selectProduct = async (productCode) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${productCode}.json`;
      
      const response = await fetch(url, { 
        headers: {
          'User-Agent': 'ProductInfoApp/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 0) {
        setError('Impossible de charger les détails du produit.');
        setProduct(null);
      } else {
        setProduct(data.product);
        setBarcode(productCode);
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
            <h1 className="text-3xl font-bold text-green-800 mb-2">Recherche de Produit <span className="text-green-600">(Version Optimisée)</span></h1>
            <p className="text-green-700">Recherchez un produit par code-barres ou par nom</p>
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
                onClick={fetchProduct}
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
          
          {/* Formulaire de recherche par nom */}
          {activeTab === 'name' && (
            <div className="mb-6 flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Saisissez le nom du produit (ex: Nutella)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={handleNameKeyDown}
              />
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]"
                onClick={() => searchProductsByName()}
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

          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
              {error}
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
                    <div 
                      key={result.code}
                      className="p-4 hover:bg-green-50 cursor-pointer transition-colors flex items-center"
                      onClick={() => selectProduct(result.code)}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                        {result.image_url ? (
                          <img 
                            src={result.image_url} 
                            alt={result.product_name || 'Produit'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{result.product_name || 'Produit sans nom'}</h4>
                        {result.brands && <p className="text-sm text-gray-600">{result.brands}</p>}
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="mr-2">Code: {result.code}</span>
                          {result.nutriscore_grade && (
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-xs mr-2
                              ${result.nutriscore_grade === 'a' ? 'bg-green-500' : 
                                result.nutriscore_grade === 'b' ? 'bg-green-300' : 
                                result.nutriscore_grade === 'c' ? 'bg-yellow-400' : 
                                result.nutriscore_grade === 'd' ? 'bg-orange-400' : 
                                'bg-red-500'}`}>
                              {result.nutriscore_grade.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
          
          {/* Affichage des détails du produit (version onglets) */}
          {product && (
            <div className="mb-6 relative">
              <button 
                onClick={() => setProduct(null)}
                className="absolute top-2 right-3 bg-gray-200 text-gray-600 hover:bg-gray-300 p-2 rounded-full"
                title="Retour à la recherche"
              >
                ←
              </button>
              <ProductDetail product={product} />
            </div>
          )}

          {!product && !loading && !error && searchResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === 'barcode' 
                  ? "Saisissez un code-barres et cliquez sur Rechercher pour afficher les informations du produit" 
                  : "Saisissez un nom de produit et cliquez sur Rechercher pour trouver des produits correspondants"}
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
                      fetchProduct();
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
            <h3 className="font-semibold text-green-800 mb-2">Nouvelle interface</h3>
            <p className="text-sm text-green-700">
              Cette version optimisée utilise un système d'onglets pour afficher les informations du produit de manière plus organisée et plus claire.
              Les informations sont regroupées par catégories : informations générales, nutrition, environnement et avis utilisateurs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSearchOpti;