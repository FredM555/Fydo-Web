// src/services/adminService.js
import { supabase } from '../supabaseClient';

/**
 * Récupère tous les avis en attente de validation
 * @param {Object} options - Options de filtrage et de tri
 * @returns {Promise<Object>} - Résultat de la requête
 */
export const getPendingReviews = async (options = {}) => {
  const { filter = 'all', sortOrder = 'newest', searchTerm = '', limit = 100, offset = 0 } = options;
  
  try {
    // Construire la requête
    let query = supabase
      .from('product_reviews')
      .select(`
        *,
        users!inner (id, display_name, email),
        review_ratings (id, criteria_id, rating),
        review_criterias:review_ratings(criteria_id)!inner (id, name, display_name, weight)
      `, { count: 'exact' })
      .eq('status', 'pending');
    
    // Appliquer les filtres
    if (filter === 'verified') {
      query = query.eq('is_verified', true);
    } else if (filter === 'unverified') {
      query = query.eq('is_verified', false);
    }
    
    // Appliquer le tri
    if (sortOrder === 'newest') {
      query = query.order('creation_date', { ascending: false });
    } else {
      query = query.order('creation_date', { ascending: true });
    }
    
    // Limiter les résultats pour la pagination
    query = query.range(offset, offset + limit - 1);
    
    // Exécuter la requête
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Filtrer selon le terme de recherche si présent
    let filteredData = data;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = data.filter(review => 
        review.product_code.includes(lowerSearchTerm) ||
        review.users.display_name.toLowerCase().includes(lowerSearchTerm) ||
        review.users.email.toLowerCase().includes(lowerSearchTerm) ||
        review.comment.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return { 
      success: true, 
      data: filteredData, 
      count: count || filteredData.length 
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis en attente:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Approuve un avis
 * @param {number} reviewId - ID de l'avis à approuver
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const approveReview = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error("ID de l'avis requis");
    }
    
    const { error } = await supabase
      .from('product_reviews')
      .update({ 
        status: 'approved',
        modification_date: new Date().toISOString()
      })
      .eq('id', reviewId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Rejette un avis
 * @param {number} reviewId - ID de l'avis à rejeter
 * @param {string} reason - Raison optionnelle du rejet
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const rejectReview = async (reviewId, reason = null) => {
  try {
    if (!reviewId) {
      throw new Error("ID de l'avis requis");
    }
    
    const updateData = {
      status: 'rejected',
      modification_date: new Date().toISOString()
    };
    
    // Ajouter la raison si fournie
    if (reason) {
      updateData.rejection_reason = reason;
    }
    
    const { error } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du rejet de l'avis:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère l'image du ticket de caisse associé à un avis
 * @param {number} reviewId - ID de l'avis
 * @returns {Promise<Object>} - URL de l'image ou erreur
 */
export const getReviewImage = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error("ID de l'avis requis");
    }
    
    // Récupérer l'ID du ticket de l'avis
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_reviews')
      .select('receipt_id')
      .eq('id', reviewId)
      .single();
      
    if (reviewError) throw reviewError;
    
    if (!reviewData.receipt_id) {
      throw new Error("Cet avis n'a pas de ticket de caisse associé");
    }
    
    // Récupérer l'URL du ticket
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .select('firebase_url')
      .eq('id', reviewData.receipt_id)
      .single();
      
    if (receiptError) throw receiptError;
    
    return { 
      success: true, 
      imageUrl: receiptData.firebase_url 
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image du ticket:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les statistiques des avis pour le tableau de bord d'administration
 * @returns {Promise<Object>} - Statistiques des avis
 */
export const getReviewStats = async () => {
  try {
    // Récupérer le nombre d'avis par statut
    const counts = {};
    
    // Compter le nombre d'avis en attente
    const { count: pendingCount, error: pendingError } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    if (pendingError) throw pendingError;
    counts.pending = pendingCount || 0;
    
    // Compter le nombre d'avis approuvés
    const { count: approvedCount, error: approvedError } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'approved_auto']);
      
    if (approvedError) throw approvedError;
    counts.approved = approvedCount || 0;
    
    // Compter le nombre d'avis rejetés
    const { count: rejectedCount, error: rejectedError } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');
      
    if (rejectedError) throw rejectedError;
    counts.rejected = rejectedCount || 0;
    
    // Compter le total
    counts.total = counts.pending + counts.approved + counts.rejected;
    
    return { success: true, stats: counts };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des avis:", error.message);
    return { success: false, error: error.message };
  }
};