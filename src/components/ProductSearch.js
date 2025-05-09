// src/components/ProductSearch.js
import React, { useState } from 'react';
import { Star, Search, Barcode } from 'lucide-react';

const ProductSearch = () => {
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode' ou 'name'
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  // Mise à jour du nombre de résultats par page pour avoir plus de produits à la fois
  const resultsPerPage = 20; // Augmenté de 10 à 20 pour voir plus de résultats d'un coup
  
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
      // Utilisez l'URL principale ou de secours pour l'API
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
      console.log("Réponse API:", data); // Pour debug
      
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

  // Affichage des étoiles
  const renderStars = (rating) => {
    rating = Math.round(rating);
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
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
            <h1 className="text-3xl font-bold text-green-800 mb-2">Recherche de Produit</h1>
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
          {activeTab === 'name' && searchResults.length > 0 && (
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
          
          {product && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 mb-4 md:mb-0 flex flex-col justify-center items-center">
                  {/* Image principale du produit */}
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.product_name || 'Produit'} 
                      className="max-h-64 object-contain mb-2"
                    />
                  ) : (
                    <div className="h-64 w-64 bg-gray-200 flex items-center justify-center mb-2">
                      <span className="text-gray-500">Image non disponible</span>
                    </div>
                  )}
                  
                  {/* Code-barres */}
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-gray-700">Code EAN: {product.code}</p>
                  </div>
                  
                  {/* Images supplémentaires en miniatures si disponibles */}
                  {(product.images && Object.keys(product.images).length > 1) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Images supplémentaires:</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {Object.keys(product.images).slice(0, 4).map((key, index) => {
                          if (key !== 'front' && product.images[key] && product.images[key].display_url) {
                            return (
                              <div key={index} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={product.images[key].display_url} 
                                  alt={`Vue ${key}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:w-2/3 md:pl-6">
                  <h2 className="text-2xl font-bold mb-2">{product.product_name || 'Nom non disponible'}</h2>
                  
                  {/* Catégorie */}
                  {product.categories_hierarchy && product.categories_hierarchy.length > 0 && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Catégorie:</span> {product.categories || product.categories_hierarchy.join(', ')}
                    </p>
                  )}
                  
                  {product.brands && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Marque:</span> {product.brands}
                    </p>
                  )}
                  
                  {product.quantity && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Quantité:</span> {product.quantity}
                    </p>
                  )}
                  
                  {/* Commerces où on trouve le produit */}
                  {product.stores && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Disponible chez:</span> {product.stores}
                    </p>
                  )}
                  
                  {/* Labels et indications sur l'étiquette */}
                  {product.labels && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Labels:</span> {product.labels}
                    </p>
                  )}
                  
                  {/* Lieu de production séparé */}
                  {product.manufacturing_places && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Lieu de production:</span> {product.manufacturing_places}
                    </p>
                  )}
                  
                  {/* Pays de distribution séparé */}
                  {product.countries && product.countries !== 'en:unknown' && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">Pays de distribution:</span> {product.countries}
                    </p>
                  )}
                  
                  {/* Adresse du fabricant si disponible */}
                  {product.producer_address && (
                    <div className="text-gray-600 mb-2">
                      <span className="font-semibold">Adresse du fabricant:</span> {product.producer_address}
                    </div>
                  )}
                  
                  {/* Emballage */}
                  {(product.packaging || product.packaging_text) && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 text-green-800">Emballage</h3>
                      {product.packaging && (
                        <p className="text-gray-700 mb-2">
                          <span className="font-medium">Type:</span> {product.packaging}
                        </p>
                      )}
                      {product.packaging_text && (
                        <p className="text-gray-700">
                          <span className="font-medium">Description:</span> {product.packaging_text}
                        </p>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>
              
              {/* Impact environnemental */}
              {product.ecoscore_data && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">Impact environnemental</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      {product.ecoscore_grade && (
                        <div className="mb-3 flex items-center">
                          <span className="font-semibold mr-2">Éco-Score:</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-2
                            ${product.ecoscore_grade === 'a' ? 'bg-green-500' : 
                            product.ecoscore_grade === 'b' ? 'bg-green-300' : 
                            product.ecoscore_grade === 'c' ? 'bg-yellow-400' : 
                            product.ecoscore_grade === 'd' ? 'bg-orange-400' : 
                            'bg-red-500'}`}>
                            {product.ecoscore_grade?.toUpperCase()}
                          </div>
                          {product.ecoscore_score && (
                            <span className="text-sm text-gray-600">({product.ecoscore_score}/100)</span>
                          )}
                        </div>
                      )}
                      
                      {/* Empreinte carbone */}
                      {product.ecoscore_data.agribalyse?.co2_total && (
                        <div className="mb-2">
                          <p className="font-medium text-green-800">Empreinte carbone totale: {product.ecoscore_data.agribalyse.co2_total} kg CO2 eq</p>
                          <div className="ml-4 mt-1">
                            {product.ecoscore_data.agribalyse.co2_packaging && (
                              <p className="text-sm text-gray-600">Emballage: {product.ecoscore_data.agribalyse.co2_packaging} kg CO2 eq</p>
                            )}
                            {product.ecoscore_data.agribalyse.co2_processing && (
                              <p className="text-sm text-gray-600">Transformation: {product.ecoscore_data.agribalyse.co2_processing} kg CO2 eq</p>
                            )}
                            {product.ecoscore_data.agribalyse.co2_distribution && (
                              <p className="text-sm text-gray-600">Transport: {product.ecoscore_data.agribalyse.co2_distribution} kg CO2 eq</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {/* Catégorie NOVA */}
                      {product.nova_group && (
                        <div className="flex items-center mb-3">
                          <span className="font-semibold mr-2">Groupe NOVA:</span>
                          <div className={`px-3 py-1 rounded-md text-white font-medium
                            ${product.nova_group === 1 ? 'bg-green-500' : 
                            product.nova_group === 2 ? 'bg-yellow-400' : 
                            product.nova_group === 3 ? 'bg-orange-400' : 
                            'bg-red-500'}`}>
                            {product.nova_group}
                          </div>
						  <span className="text-sm text-gray-600 ml-2">
                            {product.nova_group === 1 ? '(Aliment non transformé)' : 
                             product.nova_group === 2 ? '(Ingrédient culinaire transformé)' : 
                             product.nova_group === 3 ? '(Aliment transformé)' : 
                             '(Aliment ultra-transformé)'}
                          </span>
                        </div>
                      )}
                      
                      {/* Conseils de recyclage si disponibles */}
                      {product.packaging_text && product.packaging_text.includes("recycl") && (
                        <div className="p-2 bg-blue-50 text-blue-800 rounded-md">
                          <p className="text-sm"><span className="font-medium">Conseils de recyclage:</span> {product.packaging_text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Informations nutritionnelles */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Informations nutritionnelles</h3>
                {product.nutriments ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="font-medium">Énergie:</span> {product.nutriments.energy_100g || 'N/A'} {product.nutriments.energy_unit || 'kcal'}
                        {product.nutriments.energy_kcal_100g && <span className="text-sm text-gray-600 ml-1">({product.nutriments.energy_kcal_100g} kcal)</span>}
                      </div>
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="font-medium">Matières grasses:</span> {product.nutriments.fat_100g || 'N/A'} g
                        {product.nutriments.saturated_fat_100g && (
                          <div className="text-sm text-gray-600">dont saturées: {product.nutriments.saturated_fat_100g} g</div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="font-medium">Glucides:</span> {product.nutriments.carbohydrates_100g || 'N/A'} g
                        {product.nutriments.sugars_100g && (
                          <div className="text-sm text-gray-600">dont sucres: {product.nutriments.sugars_100g} g</div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="font-medium">Protéines:</span> {product.nutriments.proteins_100g || 'N/A'} g
                      </div>
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="font-medium">Sel:</span> {product.nutriments.salt_100g || 'N/A'} g
                      </div>
                      {product.nutriments.alcohol_100g && (
                        <div className="p-2 bg-gray-100 rounded-md">
                          <span className="font-medium">Alcool:</span> {product.nutriments.alcohol_100g} %
                        </div>
                      )}
                      {product.nutriments.water_100g && (
                        <div className="p-2 bg-gray-100 rounded-md">
                          <span className="font-medium">Eau:</span> {product.nutriments.water_100g} %
                        </div>
                      )}
                    </div>
                    
                    {/* Nutriscore */}
                    {product.nutriscore_grade && (
                      <div className="mt-2 flex items-center">
                        <span className="font-semibold mr-2">Nutri-Score:</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white 
                          ${product.nutriscore_grade === 'a' ? 'bg-green-500' : 
                          product.nutriscore_grade === 'b' ? 'bg-green-300' : 
                          product.nutriscore_grade === 'c' ? 'bg-yellow-400' : 
                          product.nutriscore_grade === 'd' ? 'bg-orange-400' : 
                          'bg-red-500'}`}>
                          {product.nutriscore_grade.toUpperCase()}
                        </div>
                        {product.nutriscore_data && product.nutriscore_data.is_beverage && product.nutriments.alcohol_100g && (
                          <span className="ml-2 text-sm text-gray-500">(Non applicable car boisson alcoolisée)</span>
                        )}
                      </div>
                    )}
                    
                    {product.nutrition_grade_fr && !product.nutriscore_grade && (
                      <div className="mt-2 flex items-center">
                        <span className="font-semibold mr-2">Grade nutritionnel:</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white 
                          ${product.nutrition_grade_fr === 'a' ? 'bg-green-500' : 
                          product.nutrition_grade_fr === 'b' ? 'bg-green-300' : 
                          product.nutrition_grade_fr === 'c' ? 'bg-yellow-400' : 
                          product.nutrition_grade_fr === 'd' ? 'bg-orange-400' : 
                          'bg-red-500'}`}>
                          {product.nutrition_grade_fr.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Informations nutritionnelles non disponibles</p>
                )}
              </div>
              
              {/* Ingrédients */}
              {product.ingredients_text && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Ingrédients</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-700">{product.ingredients_text}</p>
                    {product.ingredients_n && (
                      <p className="text-sm text-gray-500 mt-2">
                        {product.ingredients_n} ingrédients identifiés
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Allergènes */}
              {(product.allergens || product.allergens_tags?.length > 0 || product.traces || product.traces_tags?.length > 0) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Allergènes</h3>
                  <div className="p-3 bg-red-50 rounded-md">
                    {(product.allergens || product.allergens_tags?.length > 0) && (
                      <div className="mb-2">
                        <p className="font-medium text-red-700">Contient :</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.allergens_tags ? (
                            product.allergens_tags.map((allergen, index) => (
                              <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                                {allergen.replace('en:', '')}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-700">{product.allergens}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(product.traces || product.traces_tags?.length > 0) && (
                      <div>
                        <p className="font-medium text-orange-700">Peut contenir :</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.traces_tags ? (
                            product.traces_tags.map((trace, index) => (
                              <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                                {trace.replace('en:', '')}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-700">{product.traces}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additifs */}
              {product.additives_tags && product.additives_tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Additifs</h3>
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <div className="flex flex-wrap gap-1">
                      {product.additives_tags.map((additive, index) => {
                        const additiveName = additive.replace('en:', '');
                        const additiveCode = additiveName.split(' - ')[0];
                        const additiveLabel = additiveName.includes(' - ') ? additiveName.split(' - ')[1] : '';
                        
                        return (
                          <div key={index} className="bg-yellow-100 px-3 py-1 rounded-md">
                            <span className="font-medium text-yellow-800">{additiveCode}</span>
                            {additiveLabel && <span className="text-gray-700 text-sm ml-1">({additiveLabel})</span>}
                          </div>
                        );
                      })}
                    </div>
                    
                    {product.additives_n && (
                      <p className="text-sm text-gray-600 mt-2">
                        Nombre d'additifs : {product.additives_n}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Particularités */}
              {(product.ingredients_analysis_tags?.length > 0 || 
                product.ingredients_that_may_be_from_palm_oil_tags?.length > 0 || 
                product.ingredients_from_palm_oil_tags?.length > 0 ||
                product._keywords?.includes('cookie') ||
                product._keywords?.includes('complete-meal') ||
                product.ingredients_n > 40) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Particularités</h3>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <ul className="space-y-2">
                      {product.ingredients_that_may_be_from_palm_oil_tags?.length > 0 && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-yellow-400"></span>
                          <span>Peut contenir de l'huile de palme</span>
                        </li>
                      )}
                      
                      {product.ingredients_from_palm_oil_tags?.length > 0 && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-red-400"></span>
                          <span>Contient de l'huile de palme</span>
                        </li>
                      )}
                      
                      {product.ingredients_n > 40 && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-blue-400"></span>
                          <span>Composition très détaillée avec {product.ingredients_n} ingrédients identifiés</span>
                        </li>
                      )}
                      
                      {product._keywords?.includes('complete-meal') && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-green-400"></span>
                          <span>Produit complet (repas avec entrée, plat et dessert)</span>
                        </li>
                      )}
                      
                      {product._keywords?.includes('cookie') && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-purple-400"></span>
                          <span>Le produit inclut un dessert (cookie au chocolat)</span>
                        </li>
                      )}
                      
                      {product.ingredients_text?.includes('fourchette') && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-gray-400"></span>
                          <span>Contient une fourchette (accessoire)</span>
                        </li>
                      )}
                      
                      {product.ingredients_analysis_tags?.filter(tag => tag.includes('vegan')).length > 0 && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-green-500"></span>
                          <span>{product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('vegan-status-unknown') ? 'Statut végan incertain' : 
                                product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('non-vegan') ? 'Non végan' : 'Végan'}</span>
                        </li>
                      )}
                      
                      {product.ingredients_analysis_tags?.filter(tag => tag.includes('vegetarian')).length > 0 && (
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mt-1 mr-2 rounded-full bg-green-300"></span>
                          <span>{product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('vegetarian-status-unknown') ? 'Statut végétarien incertain' : 
                                product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('non-vegetarian') ? 'Non végétarien' : 'Végétarien'}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Footer avec métadonnées */}
              <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
                <p>Données fournies par OpenFoodFacts - Code-barres: {product.code}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {product._keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product._keywords.slice(0, 5).map((keyword, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-gray-700">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            
            <div className="mt-6 p-4 bg-green-100 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">À propos de cette fonctionnalité</h3>
              <p className="text-sm text-green-700">
                Cette fonctionnalité utilise l'API OpenFoodFacts pour rechercher des informations sur les produits alimentaires.
                Certains codes-barres peuvent ne pas être trouvés si le produit n'est pas dans la base de données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSearch;