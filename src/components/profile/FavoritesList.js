// src/components/profile/FavoritesList.js - Version modifiée avec vérification d'autorisation
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Trash, Search, ExternalLink, Loader, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { getUserFavorites, toggleFavorite } from '../../services/productService';
import { Link } from 'react-router-dom';
import ProfileLayout from './ProfileLayout';
import useSubscriptionPermissions from '../../hooks/useSubscriptionPermissions';

const FavoritesList = () => {
  const { currentUser, userDetails } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [removing, setRemoving] = useState({});
  
  // Utiliser le hook de permissions d'abonnement
  const { isAuthorized } = useSubscriptionPermissions();

  // Récupérer les favoris de l'utilisateur
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser || !userDetails) return;
      
      setLoading(true);
      
      try {
        const { success, data, total, error } = await getUserFavorites(userDetails.id, 20, offset);
        
        if (success) {
          setFavorites(prev => offset === 0 ? data : [...prev, ...data]);
          setTotal(total);
          setHasMore(offset + data.length < total);
        } else {
          setError(error || "Impossible de récupérer vos produits favoris");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des favoris:", err);
        setError("Une erreur est survenue lors du chargement de vos favoris");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [currentUser, userDetails, offset]);

  // Filtrer les favoris selon le terme de recherche
  useEffect(() => {
    if (searchTerm) {
      const filtered = favorites.filter(
        fav => fav.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               fav.product_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               fav.product_code?.includes(searchTerm)
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [searchTerm, favorites]);

  // Charger plus de favoris
  const loadMoreFavorites = () => {
    if (hasMore && !loading && isAuthorized('favorites')) {
      setOffset(offset + 20);
    }
  };

  // Supprimer un favori
  const removeFavorite = async (productCode) => {
    if (removing[productCode]) return;
    
    setRemoving(prev => ({ ...prev, [productCode]: true }));
    
    try {
      const { success, error } = await toggleFavorite(userDetails.id, productCode, false);
      
      if (success) {
        // Mettre à jour la liste des favoris
        setFavorites(prev => prev.filter(fav => fav.product_code !== productCode));
        setTotal(prev => prev - 1);
      } else {
        console.error("Erreur lors de la suppression du favori:", error);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du favori:", err);
    } finally {
      setRemoving(prev => ({ ...prev, [productCode]: false }));
    }
  };

  // Afficher un placeholder pour les favoris
  const renderPlaceholder = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <Star size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun produit favori</h3>
      <p className="text-gray-600 mb-4">
        Vous n'avez pas encore ajouté de produits à vos favoris.
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

  // Rendu d'un badge Nutriscore
  const renderNutriscore = (grade) => {
    if (!grade) return null;
    
    const getBgColor = (grade) => {
      switch (grade.toLowerCase()) {
        case 'a': return 'bg-green-500';
        case 'b': return 'bg-green-300';
        case 'c': return 'bg-yellow-400';
        case 'd': return 'bg-orange-400';
        case 'e': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };
    
    return (
      <div className={`${getBgColor(grade)} text-white font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center`}>
        {grade.toUpperCase()}
      </div>
    );
  };

  // Afficher le message d'abonnement pour les utilisateurs limités
  const renderSubscriptionMessage = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2 mr-4">
          <Lock size={24} className="text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Accès limité aux favoris</h3>
          <p className="text-yellow-700 mb-4">
            Avec votre abonnement actuel, vous pouvez voir uniquement vos 3 favoris les plus récents.
            Passez à un abonnement supérieur pour sauvegarder et accéder à un nombre illimité de produits favoris !
          </p>
          <Link 
            to="/abonnements" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Découvrir nos abonnements <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );

  // Préparer les favoris à afficher en fonction de l'autorisation
  const getFavoritesToDisplay = () => {
    // Si l'utilisateur est autorisé, afficher tous les favoris filtrés
    if (isAuthorized('favorites')) {
      return filteredFavorites;
    }
    
    // Sinon, n'afficher que les 3 premiers favoris
    return filteredFavorites.slice(0, 3);
  };

  const favoritesToDisplay = getFavoritesToDisplay();

  return (
    <ProfileLayout title="Mes produits favoris">
      {loading && favorites.length === 0 ? (
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
      ) : favorites.length === 0 ? (
        renderPlaceholder()
      ) : (
        <div>
          {/* Recherche (uniquement visible si l'utilisateur est autorisé ou a au moins un favori) */}
          {(isAuthorized('favorites') || favorites.length > 0) && (
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Rechercher dans vos favoris..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          )}
          
          {/* Compteur */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {total} {total > 1 ? 'produits favoris' : 'produit favori'}
              {searchTerm && ` • ${filteredFavorites.length} résultat${filteredFavorites.length > 1 ? 's' : ''}`}
              {!isAuthorized('favorites') && total > 3 && ` • Affichage limité à 3`}
            </p>
          </div>
          
          {/* Liste des favoris */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritesToDisplay.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-green-800 line-clamp-2">{favorite.product_name || 'Produit sans nom'}</h3>
                      <p className="text-sm text-gray-600">{favorite.product_brand || 'Marque inconnue'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderNutriscore(favorite.product_nutriscore)}
                      <button
                        onClick={() => removeFavorite(favorite.product_code)}
                        disabled={removing[favorite.product_code]}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Retirer des favoris"
                      >
                        {removing[favorite.product_code] ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 mb-3">
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400" />
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      Ajouté le {new Date(favorite.added_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{favorite.product_code}</span>
                    <Link
                      to={`/recherche-filtre?barcode=${favorite.product_code}`}
                      className="inline-flex items-center text-green-600 hover:text-green-800 text-sm"
                    >
                      Voir le produit <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                {favorite.product_image_url && (
                  <div className="h-40 w-full bg-gray-100 overflow-hidden">
                    <img 
                      src={favorite.product_image_url} 
                      alt={favorite.product_name || 'Image produit'} 
                      className="w-full h-full object-contain p-2"
                      onError={(e) => e.target.src = '/placeholder.png'} // Image par défaut en cas d'erreur
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Message d'abonnement si l'utilisateur n'est pas autorisé et a plus de 3 favoris */}
          {!isAuthorized('favorites') && total > 3 && renderSubscriptionMessage()}
          
          {/* Chargement de plus de résultats (uniquement visible si l'utilisateur est autorisé) */}
          {isAuthorized('favorites') && hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMoreFavorites}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spin mr-2" />
                    Chargement...
                  </div>
                ) : 'Charger plus de favoris'}
              </button>
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  );
};

export default FavoritesList;