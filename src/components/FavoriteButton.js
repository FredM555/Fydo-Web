// src/components/FavoriteButton.js
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

/**
 * Bouton pour ajouter/supprimer un produit des favoris
 * @param {string} productCode - Code-barres du produit
 * @param {object} productData - Données du produit (nom, marque, image)
 * @param {string} size - Taille du bouton ('sm', 'md', 'lg')
 * @returns {JSX.Element}
 */
const FavoriteButton = ({ productCode, productData, size = 'md' }) => {
  // Ajouter refreshUserDetails à la liste des éléments récupérés depuis useAuth
  const { currentUser, userDetails, subscriptionPlan, refreshUserDetails } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  // Vérifier si l'utilisateur a le droit de mettre en favoris
  const canUseFavorites = subscriptionPlan?.can_favorite || false;

  // Tailles pour le bouton
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };


  // Récupérer l'état initial (si le produit est déjà en favoris)
  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!currentUser || !userDetails || !productCode) return;
      
      try {
        // Vérifier si le produit est déjà en favoris
        const { data, error } = await supabase
          .from('favorite_products')
          .select('id')
          .eq('user_id', userDetails.id)
          .eq('product_code', productCode)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows returned"
          console.error("Erreur lors de la vérification des favoris:", error);
          return;
        }
        
        setIsFavorite(!!data);
      } catch (err) {
        console.error("Erreur lors de la vérification des favoris:", err);
      }
    };

    checkIfFavorite();
  }, [currentUser, userDetails, productCode]);

  // Toggle favoris
  const toggleFavorite = async () => {
    // Si utilisateur non connecté, afficher message d'erreur
    if (!currentUser) {
      setError("Veuillez vous connecter pour ajouter des favoris");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Si l'utilisateur n'a pas le droit d'utiliser les favoris
    if (!canUseFavorites) {
      setError("Cette fonctionnalité nécessite un abonnement supérieur");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Supprimer des favoris
        const { error } = await supabase
          .from('favorite_products')
          .delete()
          .eq('user_id', userDetails.id)
          .eq('product_code', productCode);
          
        if (error) throw error;
        
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris avec les métadonnées
        const { error } = await supabase
          .from('favorite_products')
          .insert([
            {
              user_id: userDetails.id,
              product_code: productCode,
              product_name: productData?.product_name || null,
              product_brand: productData?.brands || null,
              product_image_url: productData?.image_url || null,
              product_nutriscore: productData?.nutriscore_grade || null
            }
          ]);
          
        if (error) throw error;
        
        setIsFavorite(true);
      }
      
      // Rafraîchir les données utilisateur pour mettre à jour le nombre de favoris dans le header
      if (refreshUserDetails) {
        refreshUserDetails();
      }
    } catch (err) {
      console.error("Erreur lors de la modification des favoris:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`${sizes[size]} rounded-full flex items-center justify-center transition-colors ${
          isFavorite 
            ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Star 
          className={`${isFavorite ? 'fill-yellow-500' : ''}`} 
          size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} 
        />
      </button>

      {/* Message d'erreur */}
      {showError && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 text-red-600 text-xs px-3 py-1 rounded shadow-md whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;