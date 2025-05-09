// src/pages/TopProducts.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Filter, X, Loader } from 'lucide-react';
import { getTopProducts } from '../services/topProductsService';
import SearchResultItem from '../components/SearchResultItem';
import { formatPrice } from '../utils/formatters';

const TopProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // États pour les options de filtrage et de tri
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'average_rating');
  const [sortAsc, setSortAsc] = useState(queryParams.get('sortAsc') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page') || '1', 10));
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // États pour les résultats
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Paramètres de pagination
  const productsPerPage = 20;
  
  // Options de tri disponibles
  const sortOptions = [
    { value: 'average_rating', label: 'Note globale' },
    { value: 'taste_rating', label: 'Goût' },
    { value: 'quantity_rating', label: 'Quantité' },
    { value: 'price_rating', label: 'Rapport qualité/prix' },
    { value: 'total_reviews', label: 'Nombre d\'avis' },
    { value: 'total_favorites', label: 'Popularité (favoris)' },
    { value: 'average_price', label: 'Prix moyen' }
  ];
  
  // Mettre à jour l'URL avec les paramètres actuels
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    params.set('sortBy', sortBy);
    params.set('sortAsc', sortAsc.toString());
    params.set('page', currentPage.toString());
    
    navigate({ 
      pathname: location.pathname, 
      search: params.toString() 
    }, { replace: true });
  };
  
  // Charger les produits
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (currentPage - 1) * productsPerPage;
      
      const { success, products, totalCount, error } = await getTopProducts({
        searchTerm,
        sortBy,
        sortAsc,
        limit: productsPerPage,
        offset
      });
      
      if (success) {
        setProducts(products);
        setTotalCount(totalCount);
      } else {
        setError(error || 'Erreur lors du chargement des produits');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les produits lorsque les filtres ou la pagination changent
  useEffect(() => {
    loadProducts();
    updateUrlParams();
  }, [sortBy, sortAsc, currentPage]);
  
  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Revenir à la première page lors d'une nouvelle recherche
    loadProducts();
    updateUrlParams();
  };
  
  // Gérer le changement de tri
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Si le même champ, inverser l'ordre
      setSortAsc(!sortAsc);
    } else {
      // Si nouveau champ, définir l'ordre par défaut
      setSortBy(newSortBy);
      
      // Par défaut, trier en ordre décroissant pour les notes, croissant pour le prix
      if (newSortBy === 'average_price') {
        setSortAsc(true); // Prix croissant
      } else {
        setSortAsc(false); // Notes décroissantes
      }
    }
    
    setCurrentPage(1); // Revenir à la première page
  };
  
  // Pagination
  const totalPages = Math.ceil(totalCount / productsPerPage);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Les fonctions renderStars et getProductImage sont maintenant gérées par le composant SearchResultItem
  
  return (
    <section className="py-12 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Top Produits</h1>
          
          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit par nom ou ingrédients..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                >
                  <Search size={20} />
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Filter size={18} className="mr-2" />
                Filtres
                {filtersVisible ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
              </button>
            </form>
            
            {/* Options de tri */}
            {filtersVisible && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Trier par :</h3>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        sortBy === option.value
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        sortAsc ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Messages de statut */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader size={30} className="animate-spin text-green-600 mr-3" />
              <span className="text-green-600">Chargement des produits...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {/* Affichage des résultats */}
          {!loading && !error && (
            <>
              <div className="text-sm text-gray-600 mb-4">
                {totalCount} produit{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </div>
              
              {products.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md">
                  {products.map((product) => (
                    <SearchResultItem 
                      key={product.code}
                      result={{
                        ...product,
                        // Uniformiser les noms de propriétés pour rendre compatible avec SearchResultItem
                        product_name: product.product_name || product.product_name_fr || product.product_name_en,
                        reviews_count: product.total_reviews,
                        favorites_count: product.total_favorites,
                        // SearchResultItem s'attend à ces propriétés, assurons-nous qu'elles existent
                        average_rating: product.average_rating || 0,
                        average_price: product.average_price || 0
                      }}
                    onSelect={() => navigate(`/recherche-filtre?barcode=${product.code}`)}
                      // Passer les filtres de recherche actuels
                      searchFilters={{
                        withIngredients: [], 
                        withoutIngredients: []
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="text-gray-500 mb-2">Aucun produit trouvé</div>
                  {searchTerm && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setCurrentPage(1);
                          loadProducts();
                        }}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <X size={16} className="mr-1" />
                        Effacer la recherche
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      ««
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      «
                    </button>
                    
                    {/* Pages numérotées */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        // Moins de 5 pages, afficher toutes les pages
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        // Au début, afficher les 5 premières pages
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // À la fin, afficher les 5 dernières pages
                        pageNumber = totalPages - 4 + i;
                      } else {
                        // Au milieu, afficher 2 pages avant et 2 pages après
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNumber
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      »
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      »»
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopProducts;