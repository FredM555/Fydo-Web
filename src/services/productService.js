// src/services/productService.js
import { supabase } from '../supabaseClient';

/**
 * Ajoute une entrée à l'historique de navigation pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @param {string} interactionType - Type d'interaction ('scan', 'search', 'manual_entry', 'searchName')
 * @param {object} productMetadata - Métadonnées du produit (nom, marque, image)
 * @param {number} totalResults - Nombre total de résultats trouvés (pour 'searchName')
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const addToHistory = async (
    userId, 
    productCode, 
    interactionType, 
    productMetadata = {},
    totalResults = null
  ) => {
    try {
      if (!userId || !productCode) {
        throw new Error("ID utilisateur et code produit requis");
      }
      
      // Vérifier que le type d'interaction est valide
      if (!['scan', 'search', 'manual_entry', 'searchName'].includes(interactionType)) {
        throw new Error("Type d'interaction invalide");
      }
      
      // Ajouter l'entrée dans l'historique
      const { data, error } = await supabase
        .from('product_history')
        .insert([
          {
            user_id: userId,
            product_code: productCode,
            interaction_type: interactionType,
            product_name: productMetadata.product_name || null,
            product_brand: productMetadata.brands || null,
            product_image_url: productMetadata.image_url || null,
            total_results: totalResults, // Nouveau champ
            search_criteria: productMetadata.search_criteria || null // Si vous stockez les critères de recherche
          }
        ]);
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Erreur lors de l'ajout à l'historique:", error.message);
      return { success: false, error: error.message };
    }
  };

/**
 * Récupère l'historique de navigation d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre maximum d'entrées à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<object>} - Résultat de l'opération avec les données d'historique
 */
export const getUserHistory = async (userId, limit = 20, offset = 0) => {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }
    
    // Récupérer l'historique avec pagination
    const { data, count, error } = await supabase
      .from('product_history')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('interaction_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return { success: true, data, total: count };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Ajoute ou supprime un produit des favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @param {boolean} addToFavorites - true pour ajouter, false pour supprimer
 * @param {object} productMetadata - Métadonnées du produit (nom, marque, image)
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const toggleFavorite = async (userId, productCode, addToFavorites, productMetadata = {}, refreshUserDetails = null) => {
    try {
    if (!userId || !productCode) {
      throw new Error("ID utilisateur et code produit requis");
    }
    
    if (addToFavorites) {
      // Ajouter aux favoris
      const { data, error } = await supabase
        .from('favorite_products')
        .insert([
          {
            user_id: userId,
            product_code: productCode,
            product_name: productMetadata.product_name || null,
            product_brand: productMetadata.brands || null,
            product_image_url: productMetadata.image_url || null,
            product_nutriscore: productMetadata.nutriscore_grade || null
          }
        ]);
        
      if (error) throw error;
      
      // Rafraîchir les données utilisateur si la fonction est fournie
      if (refreshUserDetails) {
        refreshUserDetails();
      }

      return { success: true, data, isFavorite: true };
    } else {
      // Supprimer des favoris
      const { data, error } = await supabase
        .from('favorite_products')
        .delete()
        .eq('user_id', userId)
        .eq('product_code', productCode);
        
      if (error) throw error;
      
      return { success: true, data, isFavorite: false };
    }
  } catch (error) {
    console.error("Erreur lors de la modification des favoris:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si un produit est dans les favoris d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat de l'opération avec un boolean isFavorite
 */
export const checkIsFavorite = async (userId, productCode) => {
  try {
    if (!userId || !productCode) {
      throw new Error("ID utilisateur et code produit requis");
    }
    
    const { data, error } = await supabase
      .from('favorite_products')
      .select('id')
      .eq('user_id', userId)
      .eq('product_code', productCode)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows returned"
      throw error;
    }
    
    return { success: true, isFavorite: !!data };
  } catch (error) {
    console.error("Erreur lors de la vérification des favoris:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère la liste des produits favoris d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre maximum d'entrées à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<object>} - Résultat de l'opération avec les données des favoris
 */
export const getUserFavorites = async (userId, limit = 20, offset = 0) => {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }
    
    // Récupérer les favoris avec pagination
    const { data, count, error } = await supabase
      .from('favorite_products')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('added_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return { success: true, data, total: count };
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si l'utilisateur a le droit d'utiliser les favoris
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<object>} - Résultat de l'opération avec un boolean canUseFavorites
 */
export const checkFavoritesPermission = async (userId) => {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }
    
    // Récupérer les informations d'abonnement
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('end_date', { ascending: false })
      .limit(1)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError;
    }
    
    // Vérifier si l'utilisateur peut utiliser les favoris
    if (!subscriptionData) {
      // Vérifier si le plan gratuit permet les favoris
      const { data: freePlan, error: freePlanError } = await supabase
        .from('subscription_plans')
        .select('can_favorite')
        .eq('name', 'Gratuit')
        .single();
        
      if (freePlanError) throw freePlanError;
      
      return { success: true, canUseFavorites: freePlan.can_favorite };
    }
    
    return { 
      success: true, 
      canUseFavorites: subscriptionData.subscription_plans.can_favorite 
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error.message);
    return { success: false, error: error.message };
  }
};

// Ajout d'une fonction pour obtenir les données de la table products
export const getProductDetails = async (productCode) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('average_rating, taste_rating, quantity_rating, price_rating, total_reviews, average_price, total_favorites')
      .eq('code', productCode)
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du produit:", error.message);
    return { success: false, error: error.message };
  }
};