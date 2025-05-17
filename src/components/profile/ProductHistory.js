// src/components/profile/ProductHistory.js - Version modifiée avec vérification d'autorisation
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Search, Camera, Keyboard, ExternalLink, Loader, AlertCircle, Filter, Hash, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { getUserHistory } from '../../services/productService';
import { Link } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import FavoriteButton from '../FavoriteButton';
import useSubscriptionPermissions from '../../hooks/useSubscriptionPermissions';

const ProductHistory = () => {
  const { currentUser, userDetails } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedHistory, setGroupedHistory] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'scan', 'search', 'manual_entry', 'searchName'
  
  // Utiliser le hook de permissions d'abonnement
  const { isAuthorized, userLimits } = useSubscriptionPermissions();

  // Récupérer l'historique de l'utilisateur
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser || !userDetails) return;
      
      // Vérifier si l'utilisateur a l'autorisation d'accéder à l'historique
      if (!isAuthorized('history')) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { success, data, total, error } = await getUserHistory(userDetails.id, 50, offset);
        
        if (success) {
          setHistory(prev => offset === 0 ? data : [...prev, ...data]);
          setTotal(total);
          setHasMore(offset + data.length < total);
        } else {
          setError(error || "Impossible de récupérer votre historique");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique:", err);
        setError("Une erreur est survenue lors du chargement de votre historique");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [currentUser, userDetails, offset, isAuthorized]);

  // Regrouper l'historique par produit et filtrer selon les critères
  useEffect(() => {
    // Filtrer d'abord par le filtre de type d'interaction
    let filtered = [...history];
    
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.interaction_type === filter);
    }
    
    // Ensuite filtrer par le terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        item => {
          // Pour les recherches par nom, chercher aussi dans les critères de recherche
          if (item.interaction_type === 'searchName' && item.search_criteria) {
            return (
              item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.search_criteria.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          return (
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_code?.includes(searchTerm)
          );
        }
      );
    }
    
    // Regrouper les produits par code-barres ou par terme de recherche pour searchName
    const grouped = {};
    
    filtered.forEach(item => {
      const key = item.interaction_type === 'searchName' 
        ? `search_${item.product_name}` // Clé unique pour les recherches par nom
        : item.product_code;
      
      if (!grouped[key]) {
        grouped[key] = {
          productInfo: {
            product_code: item.product_code,
            product_name: item.product_name,
            product_brand: item.product_brand,
            product_image_url: item.product_image_url,
            interaction_type: item.interaction_type, // Conserver le type d'interaction principal
            search_criteria: item.search_criteria,
            total_results: item.total_results,
            last_interaction_date: item.interaction_date
          },
          interactions: []
        };
      }
      
      // Si c'est une interaction plus récente, mettre à jour les infos du produit
      const currentLastDate = new Date(grouped[key].productInfo.last_interaction_date);
      const newDate = new Date(item.interaction_date);
      
      if (newDate > currentLastDate) {
        grouped[key].productInfo.last_interaction_date = item.interaction_date;
      }
      
      // Ajouter l'interaction à la liste des interactions
      grouped[key].interactions.push({
        id: item.id,
        interaction_type: item.interaction_type,
        interaction_date: item.interaction_date
      });
      
      // Trier les interactions par date, de la plus récente à la plus ancienne
      grouped[key].interactions.sort((a, b) => {
        return new Date(b.interaction_date) - new Date(a.interaction_date);
      });
    });
    
    setGroupedHistory(grouped);
  }, [history, searchTerm, filter]);

  // Basculer l'état d'expansion d'un produit
  const toggleProductExpansion = (productKey) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productKey]: !prev[productKey]
    }));
  };

  // Charger plus d'éléments d'historique
  const loadMoreHistory = () => {
    if (hasMore && !loading) {
      setOffset(offset + 50);
    }
  };

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return minutes <= 1 ? 'Il y a une minute' : `Il y a ${minutes} minutes`;
      }
      return hours === 1 ? 'Il y a une heure' : `Il y a ${hours} heures`;
    }
    
    // Moins d'une semaine
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return days === 1 ? 'Hier' : `Il y a ${days} jours`;
    }
    
    // Plus d'une semaine
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formater l'heure
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Icône correspondant au type d'interaction
  const getInteractionIcon = (type) => {
    switch (type) {
      case 'scan':
        return <Camera size={16} className="text-blue-500" />;
      case 'search':
        return <Search size={16} className="text-green-500" />;
      case 'manual_entry':
        return <Keyboard size={16} className="text-purple-500" />;
      case 'searchName':
        return <Filter size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  // Libellé correspondant au type d'interaction
  const getInteractionLabel = (type) => {
    switch (type) {
      case 'scan':
        return 'Scanné';
      case 'search':
        return 'Recherché';
      case 'manual_entry':
        return 'Saisi manuellement';
      case 'searchName':
        return 'Recherche par nom';
      default:
        return 'Consulté';
    }
  };

  // Composant pour afficher les filtres de recherche
  const SearchFilters = ({ productInfo }) => {
    // Extraction des filtres à partir des métadonnées
    const withIngredients = productInfo.with_ingredients || [];
    const withoutIngredients = productInfo.without_ingredients || [];
    
    // Si pas de filtres, ne rien afficher
    if (withIngredients.length === 0 && withoutIngredients.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {withIngredients.map((ing, index) => (
          <span 
            key={`with-${index}`} 
            className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800"
          >
            AVEC {ing}
          </span>
        ))}
        
        {withoutIngredients.map((ing, index) => (
          <span 
            key={`without-${index}`} 
            className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800"
          >
            SANS {ing}
          </span>
        ))}
      </div>
    );
  };

  // Afficher un placeholder pour l'historique vide
  const renderPlaceholder = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <Clock size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Historique vide</h3>
      <p className="text-gray-600 mb-4">
        Vous n'avez pas encore consulté de produits.
      </p>
      <Link 
        to="/recherche-filtre" 
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        <Search size={16} className="mr-2" />
        Rechercher des produits
      </Link>
    </div>
  );

  // Afficher un message pour les utilisateurs sans autorisation d'accès à l'historique
  const renderSubscriptionUpgrade = () => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-yellow-100 p-3 rounded-full">
          <Lock size={32} className="text-yellow-600" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">Accès limité</h3>
      <p className="text-gray-600 mb-6">
        L'historique des produits est une fonctionnalité disponible avec nos formules d'abonnement payantes.
        Passez à un abonnement supérieur pour garder une trace de tous les produits que vous consultez !
      </p>
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-green-700 font-medium mb-2">Avantages de l'historique :</h4>
        <ul className="text-gray-600 text-left space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Retrouvez facilement les produits déjà consultés
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Gardez une trace des recherches effectuées
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Comparez les produits que vous consultez régulièrement
          </li>
        </ul>
      </div>
      <Link 
        to="/abonnements" 
        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
      >
        Découvrir nos abonnements
      </Link>
    </div>
  );

  return (
    <ProfileLayout title="Historique des produits">
      {loading && !isAuthorized('history') ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : !isAuthorized('history') ? (
        // Afficher le message d'upgrade si l'utilisateur n'a pas accès à l'historique
        renderSubscriptionUpgrade()
      ) : loading && Object.keys(groupedHistory).length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Une erreur est survenue</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : Object.keys(groupedHistory).length === 0 ? (
        renderPlaceholder()
      ) : (
        <div>
          {/* Barre de recherche et filtres */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rechercher dans l'historique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2 bg-white rounded-md border border-gray-300 px-3">
                <Filter size={16} className="text-gray-500" />
                <select 
                  className="bg-transparent border-0 focus:outline-none py-2 text-gray-700"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="scan">Scannés</option>
                  <option value="search">Recherchés</option>
                  <option value="manual_entry">Saisis</option>
                  <option value="searchName">Recherches par nom</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Compteur */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {total} interactions dans l'historique
              {(searchTerm || filter !== 'all') && ` • ${Object.keys(groupedHistory).length} produit${Object.keys(groupedHistory).length > 1 ? 's' : ''}`}
            </p>
          </div>
          
          {/* Liste de l'historique regroupée par produit */}
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600">Aucun résultat pour cette recherche.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedHistory).sort(([keyA, dataA], [keyB, dataB]) => {
                const dateA = new Date(dataA.productInfo.last_interaction_date);
                const dateB = new Date(dataB.productInfo.last_interaction_date);
                return dateB - dateA; // Ordre décroissant (plus récent en premier)
              }).map(([productKey, productData]) => {
                const { productInfo, interactions } = productData;
                const isExpanded = expandedProducts[productKey] || false;
                
                // URL du produit (pour les produits réels) ou de la recherche (pour les recherches par nom)
                const productUrl = productInfo.interaction_type === 'searchName'
                  ? `/recherche-filtre?q=${encodeURIComponent(productInfo.product_name || '')}`
                  : `/recherche-filtre?barcode=${productInfo.product_code}`;
                
                return (
                  <div key={productKey} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* En-tête du produit avec la dernière interaction */}
                    <div className="p-4">
                      <div className="flex items-center">
                        {/* Image du produit - maintenant cliquable pour les produits réels */}
                        {productInfo.interaction_type === 'searchName' ? (
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 mr-4">
                            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600">
                              <Search size={20} />
                            </div>
                          </div>
                        ) : (
                          <Link 
                            to={productUrl}
                            className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 mr-4 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {productInfo.product_image_url ? (
                              <img 
                                src={productInfo.product_image_url} 
                                alt={productInfo.product_name || 'Produit'} 
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = '/placeholder.png'}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Search size={20} />
                              </div>
                            )}
                          </Link>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              {productInfo.interaction_type === 'searchName' ? (
                                <h3 className="font-medium text-green-800">
                                  {`"${productInfo.product_name || 'Terme de recherche'}"`}
                                </h3>
                              ) : (
                                <Link to={productUrl} className="hover:text-green-700 transition-colors">
                                  <h3 className="font-medium text-green-800">
                                    {productInfo.product_name || 'Produit sans nom'}
                                  </h3>
                                  {productInfo.product_brand && (
                                    <p className="text-sm text-gray-600">{productInfo.product_brand} - {productInfo.product_code}</p>
                                  )}
                                </Link>
                              )}
                              
                              {/* Affichage spécifique pour les recherches par nom */}
                              {productInfo.interaction_type === 'searchName' && (
                                <>
                                  {/* Affichage des critères de recherche */}
                                  {productInfo.search_criteria && (
                                    <p className="text-xs text-gray-500 mt-1">{productInfo.search_criteria}</p>
                                  )}
                                  
                                  {/* Affichage des filtres */}
                                  <SearchFilters productInfo={productInfo} />
                                  
                                  {/* Affichage du nombre de résultats */}
                                  {productInfo.total_results !== undefined && (
                                    <div className="mt-1 inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                      <Hash size={12} className="mr-1" />
                                      <span className="font-semibold">{productInfo.total_results}</span> produits trouvés
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {/* Bouton favori uniquement pour les produits réels (pas pour les recherches) */}
                            {productInfo.interaction_type !== 'searchName' && (
                              <div className="flex items-center space-x-2">
                                <FavoriteButton 
                                  productCode={productInfo.product_code}
                                  productData={{
                                    product_name: productInfo.product_name,
                                    brands: productInfo.product_brand,
                                    image_url: productInfo.product_image_url
                                  }}
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center mt-2 justify-between">
                            <div className="flex items-center text-gray-500 text-xs">
                              {getInteractionIcon(interactions[0].interaction_type)}
                              <span className="ml-1">{getInteractionLabel(interactions[0].interaction_type)}</span>
                              <span className="mx-2">•</span>
                              <time dateTime={interactions[0].interaction_date}>
                                {formatDate(interactions[0].interaction_date)}
                              </time>
                            </div>
                            
                            {/* Lien vers la recherche pour les recherches par nom */}
                            <div className="flex items-center space-x-3">
                              {productInfo.interaction_type === 'searchName' && (
                                <Link
                                  to={productUrl}
                                  className="inline-flex items-center text-orange-600 hover:text-orange-800 text-sm"
                                >
                                  Relancer la recherche <ExternalLink size={14} className="ml-1" />
                                </Link>
                              )}
                              
                              {/* Bouton pour afficher l'historique des interactions */}
                              {interactions.length > 1 && (
                                <button
                                  onClick={() => toggleProductExpansion(productKey)}
                                  className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={16} className="mr-1" />
                                      Masquer l'historique
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} className="mr-1" />
                                      Voir l'historique ({interactions.length})
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Historique détaillé des interactions */}
                      {isExpanded && interactions.length > 1 && (
                        <div className="mt-4 pl-16 border-t border-gray-100 pt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Historique des interactions</h4>
                          <ul className="space-y-2">
                            {interactions.map((interaction, index) => (
                              <li key={interaction.id} className="flex items-center text-sm text-gray-600">
                                {getInteractionIcon(interaction.interaction_type)}
                                <span className="ml-2">{getInteractionLabel(interaction.interaction_type)}</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium">
                                  {formatDate(interaction.interaction_date)} à {formatTime(interaction.interaction_date)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Chargement de plus de résultats */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMoreHistory}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : 'Charger plus d\'historique'}
              </button>
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  );
};

export default ProductHistory;