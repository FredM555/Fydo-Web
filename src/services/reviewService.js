// src/services/reviewService.js (mise à jour)
import { supabase } from '../supabaseClient';
// src/services/reviewService.js - Ajoutez cet import en haut du fichier
import { linkReceiptItemToReview } from './receiptService';

/**
 * Récupère tous les critères d'évaluation disponibles
 * @returns {Promise<object>} - Résultat avec les critères d'évaluation
 */
export const getReviewCriterias = async () => {
  try {
    const { data, error } = await supabase
      .from('review_criterias')
      .select('*')
      .order('weight', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des critères:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les avis pour un produit spécifique
 * @param {string} productCode - Code-barres du produit
 * @param {number} limit - Nombre maximum d'avis à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<object>} - Résultat avec les avis
 */
export const getProductReviews = async (productCode, limit = 10, offset = 0) => {
  try {
    if (!productCode) {
      throw new Error("Code produit requis");
    }
    
    // Récupérer d'abord les métadonnées du produit pour avoir la note moyenne, les détails et le prix moyen
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        average_rating,
        taste_rating,
        quantity_rating,
        price_rating,
        total_reviews,
        total_favorites,
        average_price
      `)
      .eq('code', productCode)
      .single();
      
    if (productError && productError.code !== 'PGRST116') {
      throw productError;
    }
    
    // Récupérer les avis avec les notes par critère
    const { data: reviews, count, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        users!inner (id, display_name),
        review_ratings (id, criteria_id, rating)
      `, { count: 'exact' })
      .eq('product_code', productCode)
      .in('status', ['approved', 'approved_auto'])
      .order('creation_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    // Récupérer le nombre de likes pour chaque avis
    const reviewsWithLikes = await Promise.all(
      reviews.map(async (review) => {
        const { count: likesCount, error: likesError } = await supabase
          .from('review_likes')
          .select('id', { count: 'exact', head: true })
          .eq('review_id', review.id);
          
        if (likesError) throw likesError;
        
        return {
          ...review,
          likes_count: likesCount || 0
        };
      })
    );
    
    // Récupérer les critères pour afficher les noms
    const { data: criterias, error: criteriasError } = await supabase
      .from('review_criterias')
      .select('*');
      
    if (criteriasError) throw criteriasError;
    
    // Formater les avis pour faciliter l'affichage
    const formattedReviews = reviewsWithLikes.map(review => {
      // Organiser les notes par critère
      const ratingsByCriteria = {};
      
      review.review_ratings.forEach(rating => {
        const criteria = criterias.find(c => c.id === rating.criteria_id);
        if (criteria) {
          ratingsByCriteria[criteria.name] = {
            rating: rating.rating,
            display_name: criteria.display_name,
            weight: criteria.weight
          };
        }
      });
      
      // Inclure les nouveaux champs dans le résultat formaté
      return {
        id: review.id,
        user_name: review.users.display_name,
        comment: review.comment,
        date: review.creation_date,
        is_verified: review.is_verified,
        average_rating: review.average_rating,
        likes_count: review.likes_count,
        ratings: ratingsByCriteria,
        // Nouveaux champs
        purchase_price: review.purchase_price,
        purchase_date: review.purchase_date,
        store_name: review.store_name,
        // Ne pas renvoyer les coordonnées précises par défaut pour des raisons de confidentialité
        has_location: !!review.purchase_location,
        // Ne pas envoyer le ticket si l'utilisateur n'a pas autorisé le partage
        can_show_receipt: review.authorize_receipt_sharing && review.receipt_id
      };
    });
    
    return { 
      success: true, 
      reviews: formattedReviews, 
      total: count,
      average: productData?.average_rating || 0,
      taste_rating: productData?.taste_rating || 0,
      quantity_rating: productData?.quantity_rating || 0,
      price_rating: productData?.price_rating || 0,
      average_price: productData?.average_price || 0,
      total_reviews: productData?.total_reviews || 0,
      total_favorites: productData?.total_favorites || 0,
      verified_reviews: reviews.filter(r => r.is_verified).length || 0
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Ajoute un nouvel avis pour un produit
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @param {string} comment - Commentaire de l'avis
 * @param {string|null} receiptId - ID du ticket de caisse (si disponible)
 * @param {object} ratings - Notes par critère {criteria_id: rating, ...}
 * @param {object} purchaseInfo - Informations sur l'achat
 * @returns {Promise<object>} - Résultat de l'opération
 */  


export const addProductReview = async (
  userId, 
  productCode, 
  comment, 
  receiptId, 
  ratings,
  purchaseInfo = {}
) => {
  try {
    // Validations des entrées
    if (!userId || !productCode) {
      throw new Error("ID utilisateur et code produit requis");
    }
    
    if (!comment || comment.trim() === '') {
      throw new Error("Un commentaire est requis pour publier un avis");
    }
    
    if (!ratings || Object.keys(ratings).length === 0) {
      throw new Error("Au moins une note est requise");
    }
    
    // Vérifier si un article du ticket est sélectionné si le ticket a des articles
    if (purchaseInfo.receiptItems && purchaseInfo.receiptItems.length > 0 && !purchaseInfo.selectedItemId) {
      throw new Error("Vous devez sélectionner un article du ticket correspondant au produit");
    }
    
    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const { data: existingReview, error: checkError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', userId)
      .neq('status','rejected')
      .eq('product_code', productCode)
      .single();
      
    if (existingReview) {
      throw new Error("Vous avez déjà laissé un avis pour ce produit");
    }
      
    // Vérifier si le ticket existe et appartient à l'utilisateur
    if (receiptId) {
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .select('id')
        .eq('id', receiptId)
        .eq('user_id', userId)
        .single();
        
      if (receiptError) {
        throw new Error("Ticket de caisse invalide");
      }
    }
    
    // Extraire les informations d'achat
    const { 
      price,
      date,
      location,
      storeName,
      authorizeSharing = false,
      selectedItemId = null, // Récupération de l'ID de l'article sélectionné
      receiptItems = [],
      matchScore = 0 // Nouveau: score de correspondance pour la logique de statut
    } = purchaseInfo;
    
    // Déterminer le statut de l'avis en fonction du taux de correspondance
    // Si le taux de correspondance est >= 75%, l'avis est approuvé automatiquement
    // Sinon, il est en attente de modération
    const reviewStatus = matchScore >= 0.70 ? 'approved_auto' : 'pending';
    
    // Récupérer les ratings spécifiques par critère
    const tasteRating = ratings['1'] || 0; // Supposant que l'ID 1 est pour le goût
    const quantityRating = ratings['2'] || 0; // Supposant que l'ID 2 est pour la quantité
    const priceRating = ratings['3'] || 0; // Supposant que l'ID 3 est pour le prix
    
    // Calculer la note moyenne avec 2 décimales
    const criteriaWeights = {
      '1': 3.0, // Poids du goût
      '2': 2.0, // Poids de la quantité
      '3': 1.0  // Poids du prix
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(ratings).forEach(([criteriaId, rating]) => {
      const weight = criteriaWeights[criteriaId] || 1.0;
      weightedSum += rating * weight;
      totalWeight += weight;
    });
    
    const averageRating = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
    
    // Insérer l'avis avec les nouveaux champs
    const { data: newReview, error: reviewError } = await supabase
      .from('product_reviews')
      .insert([
        {
          user_id: userId,
          product_code: productCode,
          comment: comment,
          receipt_id: receiptId,
          receipt_item_id: selectedItemId, // Ajout de la liaison avec l'article sélectionné
          is_verified: !!receiptId, // Considéré comme vérifié si un ticket est fourni
          status: reviewStatus, // Statut déterminé par le taux de correspondance
          match_score: matchScore, // Enregistrer le score de correspondance
          // Nouveaux champs pour les notes spécifiques
          average_rating: averageRating,
          taste_rating: tasteRating,
          quantity_rating: quantityRating,
          price_rating: priceRating,
          // Informations d'achat
          authorize_receipt_sharing: authorizeSharing,
          purchase_price: price,
          purchase_date: date,
          purchase_location: location ? `(${location.lat},${location.lng})` : null,
          store_name: storeName
        }
      ])
      .select()
      .single();
      
    if (reviewError) throw reviewError;
    
    // Insérer les notes pour chaque critère
    const ratingsToInsert = Object.entries(ratings).map(([criteriaId, rating]) => ({
      review_id: newReview.id,
      criteria_id: criteriaId,
      rating: rating
    }));
    
    const { error: ratingsError } = await supabase
      .from('review_ratings')
      .insert(ratingsToInsert);
      
    if (ratingsError) throw ratingsError;

    // Si un article est sélectionné, utilisez la fonction linkReceiptItemToReview pour le marquer
    if (selectedItemId && receiptId) {
      try {
        console.log(`Liaison de l'article ${selectedItemId} à l'avis ${newReview.id}`);
        const linkResult = await linkReceiptItemToReview(newReview.id, selectedItemId);
        
        if (!linkResult.success) {
          console.warn("Avertissement: La liaison article-avis a échoué:", linkResult.error);
          // Ne pas faire échouer l'ensemble du processus pour cette raison
        }
      } catch (linkError) {
        console.error("Erreur lors de la liaison article-avis:", linkError);
        // Ne pas faire échouer l'ensemble du processus pour cette raison
      }
    }
    // Mettre à jour les articles du ticket pour les lier à l'avis
    if (receiptId && receiptItems && receiptItems.length > 0) {
      console.log("Articles du ticket à associer:", receiptItems);
      
      // Pour chaque article, vérifier s'il existe déjà dans receipt_items
      // Si non, l'insérer; si oui, le mettre à jour
      for (const item of receiptItems) {
        if (item.id && (item.id.startsWith('ai-item-') || item.id.startsWith('temp-'))) {
          // C'est un ID temporaire, il faut insérer un nouvel article
          const newItem = {
            receipt_id: receiptId,
            designation: item.designation,
            product_code: productCode, // Lier au produit de l'avis
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            prix_total: item.prix_total,
            // Si l'article est sélectionné, marquer dans la base de données
            is_selected: item.id === purchaseInfo.selectedItemId
          };
          
          await supabase.from('receipt_items').insert([newItem]);
        } else {
          // C'est un ID existant, mettre à jour l'article
          const updateItem = {
            designation: item.designation,
            product_code: productCode, // Lier au produit de l'avis
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            prix_total: item.prix_total,
            // Si l'article est sélectionné, marquer dans la base de données
            is_selected: item.id === purchaseInfo.selectedItemId
          };
          
          await supabase.from('receipt_items').update(updateItem).eq('id', item.id);
        }
      }
    }
    
    // Mettre à jour les statistiques du produit seulement si l'avis est approuvé
    if (reviewStatus === 'approved' || reviewStatus === 'approved_auto') {
      await updateProductStats(productCode);
    }
    
    return { 
      success: true, 
      review: newReview,
      status: reviewStatus // Renvoyer le statut pour informer l'utilisateur
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour les statistiques agrégées d'un produit (notes moyennes, nombre d'avis, etc.)
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<boolean>} - Succès de l'opération
 */
export const updateProductStats = async (productCode) => {
  try {
    // Calculer toutes les statistiques du produit
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select(`
        average_rating,
        taste_rating,
        quantity_rating,
        price_rating,
        purchase_price,
        is_verified
      `)
      .eq('product_code', productCode)
      .in('status', ['approved', 'approved_auto']);
      
    if (error) throw error;
    
    if (!reviews || reviews.length === 0) {
      return true; // Pas d'avis approuvés
    }
    
    // Nombre total d'avis
    const totalReviews = reviews.length;
    
    // Note moyenne globale
    const averageRating = Number((reviews.reduce((sum, r) => sum + (r.average_rating || 0), 0) / totalReviews).toFixed(2));
    
    // Notes moyennes par critère
    const tasteRating = Number((reviews.reduce((sum, r) => sum + (r.taste_rating || 0), 0) / totalReviews).toFixed(2));
    const quantityRating = Number((reviews.reduce((sum, r) => sum + (r.quantity_rating || 0), 0) / totalReviews).toFixed(2));
    const priceRating = Number((reviews.reduce((sum, r) => sum + (r.price_rating || 0), 0) / totalReviews).toFixed(2));
    
    // Prix moyen (uniquement basé sur les avis vérifiés avec un prix d'achat)
    const validPriceReviews = reviews.filter(r => r.is_verified && r.purchase_price > 0);
    const averagePrice = validPriceReviews.length > 0 
      ? Number((validPriceReviews.reduce((sum, r) => sum + r.purchase_price, 0) / validPriceReviews.length).toFixed(2))
      : 0;
    
    // Mettre à jour le produit avec les statistiques calculées
    const { error: updateError } = await supabase
      .from('products')
      .update({
        average_rating: averageRating,
        taste_rating: tasteRating,
        quantity_rating: quantityRating,
        price_rating: priceRating,
        average_price: averagePrice,
        total_reviews: totalReviews
      })
      .eq('code', productCode);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques du produit:", error.message);
    return false;
  }
};

/**
 * Récupère si l'utilisateur a déjà laissé un avis pour ce produit
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat avec hasReviewed et reviewStatus
 */
export const checkUserReview = async (userId, productCode) => {
  try {
    if (!userId || !productCode) {
      throw new Error("ID utilisateur et code produit requis");
    }
    
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, status')
      .eq('user_id', userId)
      .eq('product_code', productCode)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows returned"
      throw error;
    }
    
    return { 
      success: true, 
      hasReviewed: !!data,
      reviewStatus: data?.status || null,
      reviewId: data?.id || null
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Ajoute ou supprime un like sur un avis
 * @param {string} userId - ID de l'utilisateur
 * @param {string} reviewId - ID de l'avis
 * @param {boolean} addLike - true pour ajouter, false pour supprimer
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const toggleReviewLike = async (userId, reviewId, addLike) => {
  try {
    if (!userId || !reviewId) {
      throw new Error("ID utilisateur et ID avis requis");
    }
    
    if (addLike) {
      // Ajouter un like
      const { data, error } = await supabase
        .from('review_likes')
        .insert([
          {
            user_id: userId,
            review_id: reviewId
          }
        ])
        .select();
        
      if (error && error.code !== '23505') { // 23505 = "Unique constraint violation"
        throw error;
      }
      
      return { success: true, liked: true };
    } else {
      // Supprimer un like
      const { data, error } = await supabase
        .from('review_likes')
        .delete()
        .eq('user_id', userId)
        .eq('review_id', reviewId);
        
      if (error) throw error;
      
      return { success: true, liked: false };
    }
  } catch (error) {
    console.error("Erreur lors de la modification du like:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si l'utilisateur a liké un avis
 * @param {string} userId - ID de l'utilisateur
 * @param {string} reviewId - ID de l'avis
 * @returns {Promise<object>} - Résultat avec hasLiked
 */
export const checkUserLike = async (userId, reviewId) => {
  try {
    if (!userId || !reviewId) {
      throw new Error("ID utilisateur et ID avis requis");
    }
    
    const { data, error } = await supabase
      .from('review_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows returned"
      throw error;
    }
    
    return { success: true, hasLiked: !!data };
  } catch (error) {
    console.error("Erreur lors de la vérification du like:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère tous les avis d'un utilisateur avec les métadonnées du produit
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre maximum d'avis à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<object>} - Résultat avec les avis
 */
export const getUserReviews = async (userId, limit = 10, offset = 0) => {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }
    
    // Récupérer les avis de l'utilisateur avec relations
    const { data: reviews, count, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        review_ratings (id, criteria_id, rating)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('creation_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    // Récupérer les critères pour afficher les noms
    const { data: criterias, error: criteriasError } = await supabase
      .from('review_criterias')
      .select('*');
      
    if (criteriasError) throw criteriasError;
    
    // Pour chaque avis, récupérer les informations du produit associé
    const formattedReviews = await Promise.all(reviews.map(async (review) => {
      // Organiser les notes par critère
      const ratingsByCriteria = {};
      
      review.review_ratings.forEach(rating => {
        const criteria = criterias.find(c => c.id === rating.criteria_id);
        if (criteria) {
          ratingsByCriteria[criteria.name] = {
            rating: rating.rating,
            display_name: criteria.display_name,
            weight: criteria.weight
          };
        }
      });
      
      // Récupérer les infos de base du produit (nom, marque, etc.)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('product_name, brands, image_url, firebase_image_path')
        .eq('code', review.product_code)
        .single();
        
      if (productError && productError.code !== 'PGRST116') {
        console.warn(`Erreur lors de la récupération du produit ${review.product_code}:`, productError);
      }
      
      // S'il n'y a pas d'image dans le produit, chercher dans product_images
      let productImageUrl = product?.image_url || product?.firebase_image_path || null;
      
      if (!productImageUrl) {
        // Chercher la première image (généralement l'image principale)
        const { data: productImages, error: imagesError } = await supabase
          .from('product_images')
          .select('image_url, firebase_path')
          .eq('product_code', review.product_code)
          .order('display_order', { ascending: true })
          .limit(1);
          
        if (!imagesError && productImages && productImages.length > 0) {
          productImageUrl = productImages[0].image_url || productImages[0].firebase_path;
        }
      }
      
      return {
        id: review.id,
        product_code: review.product_code,
        comment: review.comment,
        date: review.creation_date,
        is_verified: review.is_verified,
        average_rating: review.average_rating,
        // Informations du produit
        product_name: product?.product_name || 'Produit sans nom',
        product_brand: product?.brands || 'Marque inconnue',
        product_image_url: productImageUrl,
        // Statut de l'avis
        status: review.status,
        // Notes par critère
        ratings: ratingsByCriteria,
        // Informations d'achat
        purchase_price: review.purchase_price,
        purchase_date: review.purchase_date,
        store_name: review.store_name,
        has_location: !!review.purchase_location,
        authorize_receipt_sharing: review.authorize_receipt_sharing,
        // Score de correspondance
        match_score: review.match_score
      };
    }));
    
    return { success: true, reviews: formattedReviews, total: count };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obtient l'image du ticket de caisse si autorisé
 * @param {string} reviewId - ID de l'avis
 * @returns {Promise<object>} - URL du ticket ou erreur
 */
export const getReceiptImage = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error("ID de l'avis requis");
    }
    
    // Vérifier si l'avis autorise le partage du ticket
    const { data: review, error: reviewError } = await supabase
      .from('product_reviews')
      .select('receipt_id, authorize_receipt_sharing, user_id')
      .eq('id', reviewId)
      .single();
      
    if (reviewError) throw reviewError;
    
    if (!review.receipt_id) {
      throw new Error("Aucun ticket associé à cet avis");
    }
    
    if (!review.authorize_receipt_sharing) {
      throw new Error("L'utilisateur n'a pas autorisé le partage du ticket");
    }
    
    // Récupérer les informations du ticket
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .select('firebase_url')
      .eq('id', review.receipt_id)
      .single();
      
    if (receiptError) throw receiptError;
    
    return { 
      success: true, 
      receiptUrl: receipt.firebase_url 
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du ticket:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si un utilisateur peut laisser un avis (un par produit et par mois)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat avec canLeaveReview, lastReviewDate
 */
export const canUserLeaveReview = async (userId, productCode) => {
  try {
    if (!userId || !productCode) {
      throw new Error("ID utilisateur et code produit requis");
    }
    
    // Récupérer la date du dernier avis laissé par l'utilisateur pour ce produit
    const { data, error } = await supabase
      .from('product_reviews')
      .select('creation_date')
      .eq('user_id', userId)
      .eq('product_code', productCode)
      .neq('status','rejected')
      .order('creation_date', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    // Si aucun avis n'a été trouvé, l'utilisateur peut en laisser un
    if (!data || data.length === 0) {
      return { 
        success: true, 
        canLeaveReview: true,
        lastReviewDate: null
      };
    }
    
    const lastReviewDate = data[0].creation_date;
    
    // Vérifier si le dernier avis date de ce mois
    const now = new Date();
    const lastReview = new Date(lastReviewDate);
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = lastReview.getMonth();
    const lastYear = lastReview.getFullYear();
    
    // Si le dernier avis date d'un mois différent ou d'une année différente,
    // l'utilisateur peut en laisser un nouveau
    const canLeaveReview = currentMonth !== lastMonth || currentYear !== lastYear;
    
    return { 
      success: true, 
      canLeaveReview,
      lastReviewDate
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'autorisation:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Active ou désactive le partage public du ticket de caisse
 * @param {string} reviewId - ID de l'avis
 * @param {boolean} authorize - Autoriser le partage (true) ou non (false)
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const toggleReceiptSharing = async (reviewId, authorize) => {
  try {
    if (!reviewId) {
      throw new Error("ID de l'avis requis");
    }
    
    // Mettre à jour l'autorisation
    const { error } = await supabase
      .from('product_reviews')
      .update({ 
        authorize_receipt_sharing: authorize,
        modification_date: new Date().toISOString()
      })
      .eq('id', reviewId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la modification de l'autorisation:", error.message);
    return { success: false, error: error.message };
  }
};