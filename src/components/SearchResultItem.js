// src/components/SearchResultItem.js - Version modifiée
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Heart } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { filterProductByAllFields, formatIngredients } from '../utils/searchUtils';
import FavoriteButton from './FavoriteButton';
import { getProductDetails } from '../services/productService';

const SearchResultItem = ({ result, onSelect, searchFilters = {} }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // S'assurer que searchFilters est bien un objet avec les propriétés attendues
  const filters = {
    withIngredients: Array.isArray(searchFilters?.withIngredients) ? searchFilters.withIngredients : [],
    withoutIngredients: Array.isArray(searchFilters?.withoutIngredients) ? searchFilters.withoutIngredients : []
  };

  // Récupérer les données détaillées du produit depuis la table products
  useEffect(() => {
    const fetchProductDetails = async () => {
      // Vérifier si les données sont déjà présentes dans l'objet result
      if ((result.average_rating !== undefined && result.average_price !== undefined && 
           result.total_favorites !== undefined) || loading) {
        return;
      }
      
      setLoading(true);
      try {
        const { success, data } = await getProductDetails(result.code);
        if (success && data) {
          setProductDetails(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [result.code, result.average_rating, result.average_price, result.total_favorites, loading]);

  // Déterminer les valeurs à afficher (soit des données existantes, soit des données chargées)
  const averageRating = productDetails?.average_rating || result.average_rating || 0;
  const averagePrice = productDetails?.average_price || result.average_price || 0;
  const totalReviews = productDetails?.total_reviews || result.reviews_count || 0;
  const totalFavorites = productDetails?.total_favorites || result.favorites_count || 0;

  // Fonction sécurisée pour vérifier si un produit contient un ingrédient
  const safelyCheckIngredient = (ingredient, isIncluded) => {
    try {
      if (isIncluded) {
        return filterProductByAllFields(result, { 
          withIngredients: [ingredient], 
          withoutIngredients: [] 
        });
      } else {
        return !filterProductByAllFields(result, { 
          withIngredients: [], 
          withoutIngredients: [ingredient] 
        });
      }
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
      return false;
    }
  };

  // Gestionnaire de clic sécurisé
  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(result.code);
    }
  };

  return (
    <div 
      className="p-4 hover:bg-green-50 cursor-pointer transition-colors"
      onClick={handleSelect}
    >
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
          {result.image_url ? (
            <img 
              src={result.image_url} 
              alt={result.product_name || 'Produit'} 
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = '/placeholder.png'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Pas d'image
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-green-800">{result.product_name || 'Produit sans nom'}</h4>
              {result.brands && <p className="text-sm text-gray-600">{result.brands}</p>}
            </div>
            
            {/* Bouton favori */}
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <FavoriteButton 
                productCode={result.code}
                productData={{
                  product_name: result.product_name,
                  brands: result.brands,
                  image_url: result.image_url
                }}
                size="sm"
              />
            </div>
          </div>
          
          {/* Statistiques du produit */}
          <div className="flex flex-wrap items-center mt-2 text-sm">
            {/* Note moyenne */}
            <div className="flex items-center mr-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    className={`${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                  />
                ))}
              </div>
              <span className="ml-1 text-gray-600">
                {averageRating.toFixed(1)}
              </span>
            </div>
            
            {/* Nombre d'avis */}
            <div className="flex items-center mr-3">
              <MessageSquare size={14} className="text-gray-500 mr-1" />
              <span className="text-gray-600">
                {totalReviews} avis
              </span>
            </div>
            
            {/* Nombre de suivis/favoris - NOUVEAU */}
            <div className="flex items-center mr-3">
              <Heart size={14} className={`mr-1 ${totalFavorites > 0 ? "text-pink-500 fill-pink-500" : "text-gray-500"}`} />
              <span className="text-gray-600">
                {totalFavorites} suivis
              </span>
            </div>
            
            {/* Prix moyen - FORMAT EURO */}
            {averagePrice > 0 && (
              <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                <span className="font-medium">
                  {averagePrice.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            )}
          </div>
          
          {/* Badges de filtres */}
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.withIngredients.map(ing => {
              const hasIngredient = safelyCheckIngredient(ing, true);
              return (
                <span 
                  key={`with-${ing}`} 
                  className={`text-xs px-2 py-1 rounded-full ${
                    hasIngredient 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800 line-through'
                  }`}
                >
                  AVEC {ing}
                </span>
              );
            })}
            
            {filters.withoutIngredients.map(ing => {
              const hasIngredient = !safelyCheckIngredient(ing, false);
              return (
                <span 
                  key={`without-${ing}`} 
                  className={`text-xs px-2 py-1 rounded-full ${
                    !hasIngredient 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  SANS {ing}
                </span>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div>
              <span className="mr-2">Code: {result.code}</span>
            </div>
            <div>
              {formatIngredients(result)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultItem;