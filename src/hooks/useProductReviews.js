// src/hooks/useProductReviews.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getProductReviews, 
  checkUserReview, 
  addProductReview, 
  canUserLeaveReview 
} from '../services/reviewService';

/**
 * Hook personnalisé pour gérer les avis produits
 * @param {string} productCode - Code-barres du produit
 * @returns {object} - Fonctions et états pour gérer les avis
 */
const useProductReviews = (productCode) => {
const { currentUser, userDetails, refreshUserDetails } = useAuth();
  
  // États pour les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [verifiedReviews, setVerifiedReviews] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // États spécifiques aux critères
  const [tasteRating, setTasteRating] = useState(0);
  const [quantityRating, setQuantityRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);
  
  // États pour les permissions utilisateur
  const [userReviewed, setUserReviewed] = useState(false);
  const [canLeaveReview, setCanLeaveReview] = useState(true);
  const [lastReviewDate, setLastReviewDate] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);
  
  // État pour la pagination
  const [offset, setOffset] = useState(0);
  
  // Fonction pour charger les avis
  const fetchReviews = useCallback(async (newOffset = 0) => {
    if (!productCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { 
        success, 
        reviews: fetchedReviews, 
        total, 
        average, 
        taste_rating, 
        quantity_rating, 
        price_rating,
        average_price,
        total_reviews,
        total_favorites,
        verified_reviews, 
        error: reviewsError 
      } = await getProductReviews(productCode, 5, newOffset);
      
      if (success) {
        // Si c'est un nouvel offset (pas 0), ajouter aux avis existants
        if (newOffset === 0) {
          setReviews(fetchedReviews);
        } else {
          setReviews(prev => [...prev, ...fetchedReviews]);
        }
        
        // Mettre à jour toutes les données
        setTotalReviews(total_reviews || 0);
        setAverageRating(average || 0);
        setVerifiedReviews(verified_reviews || 0);
        setTasteRating(taste_rating || 0);
        setQuantityRating(quantity_rating || 0);
        setPriceRating(price_rating || 0);
        setAveragePrice(average_price || 0);
        setTotalFavorites(total_favorites || 0);
        
        // Vérifier s'il y a plus d'avis à charger
        setHasMore(fetchedReviews.length + (newOffset === 0 ? 0 : reviews.length) < total);
      } else if (reviewsError) {
        setError(reviewsError);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des avis:", err);
      setError("Une erreur est survenue lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  }, [productCode, reviews.length]);
  
  // Fonction pour charger plus d'avis
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const newOffset = offset + 5;
      setOffset(newOffset);
      fetchReviews(newOffset);
    }
  }, [fetchReviews, hasMore, loading, offset]);
  
  // Fonction pour vérifier les permissions de l'utilisateur
  const checkUserPermissions = useCallback(async () => {
    if (!currentUser || !userDetails || !productCode) {
      setUserReviewed(false);
      setCanLeaveReview(false);
      return;
    }
    
    try {
      // Vérifier si l'utilisateur a déjà laissé un avis
      const { success, hasReviewed, reviewStatus: status } = 
        await checkUserReview(userDetails.id, productCode);
      
      if (success) {
        setUserReviewed(hasReviewed);
        setReviewStatus(status);
        
        // Si l'utilisateur a déjà laissé un avis, vérifier s'il peut en laisser un nouveau (limite mensuelle)
        if (hasReviewed) {
          const { success: canReviewSuccess, canLeaveReview: canReview, lastReviewDate: lastDate } = 
            await canUserLeaveReview(userDetails.id, productCode);
          
          if (canReviewSuccess) {
            setCanLeaveReview(canReview);
            setLastReviewDate(lastDate);
          }
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification des permissions:", err);
    }
  }, [currentUser, userDetails, productCode]);
  
  // Fonction pour soumettre un nouvel avis
  const submitReview = useCallback(async (reviewData) => {
    if (!currentUser || !userDetails || !productCode) {
      return { success: false, error: "Vous devez être connecté pour laisser un avis" };
    }
    
    try {
      const { comment, ratings, receiptId, purchaseInfo } = reviewData;
      
      const result = await addProductReview(
        userDetails.id,
        productCode,
        comment,
        receiptId,
        ratings,
        purchaseInfo
      );
      
      if (result.success) {
        // Mettre à jour les états locaux
        setUserReviewed(true);
        setCanLeaveReview(false);
        setLastReviewDate(new Date().toISOString());
        
        // Recharger les avis pour voir le nouvel avis (il sera en attente)
        await fetchReviews(0);

              // Rafraîchir les données utilisateur dans le contexte
        if (refreshUserDetails) {
          refreshUserDetails();
        }
        
      }
      
      return result;
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'avis:", err);
      return { success: false, error: "Une erreur est survenue lors de l'ajout de l'avis." };
    }
  }, [currentUser, userDetails, productCode, fetchReviews]);
  
  // Obtenir les informations sur les permissions de l'utilisateur
  const getUserPermissions = useCallback(() => {
    return {
      userReviewed,
      canLeaveReview,
      lastReviewDate,
      reviewStatus,
      isLoggedIn: !!currentUser
    };
  }, [userReviewed, canLeaveReview, lastReviewDate, reviewStatus, currentUser]);
  
  // Charger les avis au chargement initial et lorsque le code produit change
  useEffect(() => {
    if (productCode) {
      setOffset(0);
      fetchReviews(0);
      checkUserPermissions();
    }
  }, [productCode, fetchReviews, checkUserPermissions]);
  
  return {
    // États
    loading,
    error,
    reviews,
    totalReviews,
    averageRating,
    verifiedReviews,
    hasMore,
    tasteRating,
    quantityRating,
    priceRating,
    averagePrice,
    totalFavorites,
    
    // Fonctions
    loadMore,
    submitReview,
    getUserPermissions,
    refreshReviews: () => fetchReviews(0)
  };
};

export default useProductReviews;