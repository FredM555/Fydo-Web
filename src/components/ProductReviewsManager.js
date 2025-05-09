// src/components/ProductReviewsManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewsDisplay from './ReviewsDisplay';
import AddReviewForm from './AddReviewForm';
import { checkUserReview, canUserLeaveReview } from '../services/reviewService';
import { formatDate } from '../utils/formatters';

const ProductReviewsManager = ({ product }) => {
  const { currentUser, userDetails } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [canLeaveReview, setCanLeaveReview] = useState(true);
  const [lastReviewDate, setLastReviewDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur a déjà laissé un avis et s'il peut en laisser un nouveau
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!currentUser || !userDetails || !product?.code) return;
      
      setLoading(true);
      
      try {
        // Vérifier l'avis existant
        const { success, hasReviewed, reviewStatus } = await checkUserReview(
          userDetails.id, 
          product.code
        );
        
        if (success) {
          setUserReviewed(hasReviewed);
          setReviewStatus(reviewStatus);
        }
        
        // Vérifier si l'utilisateur peut laisser un avis (limite d'un par mois)
        const { success: successLimit, canLeaveReview: canReview, lastReviewDate: lastDate } = 
          await canUserLeaveReview(userDetails.id, product.code);
        
        if (successLimit) {
          setCanLeaveReview(canReview);
          setLastReviewDate(lastDate);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du statut:", err);
        setError("Une erreur est survenue lors de la vérification.");
      } finally {
        setLoading(false);
      }
    };
    
    checkReviewStatus();
  }, [currentUser, userDetails, product?.code]);

  // Gérer le clic sur le bouton d'ajout d'avis
  const handleAddReviewClick = () => {
    if (!currentUser) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      // ou afficher un message d'erreur
      setError("Vous devez être connecté pour laisser un avis");
      return;
    }
    
    if (userReviewed && !canLeaveReview) {
      // L'utilisateur a déjà laissé un avis ce mois-ci
      return;
    }
    
    setShowAddReview(true);
  };

  // Gérer la soumission réussie d'un avis
  const handleReviewSubmitted = () => {
    setShowAddReview(false);
    setUserReviewed(true);
    setCanLeaveReview(false);
    setLastReviewDate(new Date().toISOString());
    
    // Recharger les avis après un court délai pour voir le nouvel avis
    setTimeout(() => {
      // Forcer le rechargement des avis
      window.location.reload();
    }, 1500);
  };

  // Message à afficher sur le bouton en fonction de l'état
  const getButtonMessage = () => {
    if (showAddReview) return 'Annuler';
    if (userReviewed && !canLeaveReview) {
      return `Vous avez déjà donné votre avis`;
    }
    if (userReviewed && canLeaveReview) {
      return 'Donner un nouvel avis';
    }
    return 'Donner mon avis';
  };

  // Tooltip explicatif si l'utilisateur a déjà laissé un avis
  const getButtonTooltip = () => {
    if (userReviewed && !canLeaveReview && lastReviewDate) {
      const reviewDate = new Date(lastReviewDate);
      const nextMonth = new Date(reviewDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1); // Premier jour du mois suivant
      
      return `Vous avez déjà laissé un avis le ${formatDate(lastReviewDate)}. 
              Vous pourrez laisser un nouvel avis à partir du ${formatDate(nextMonth)}.`;
    }
    return '';
  };

  // Rendu du composant
  return (
    <div>
      {showAddReview ? (
        <AddReviewForm 
          product={product} 
          onCancel={() => setShowAddReview(false)}
          onSuccess={handleReviewSubmitted}
        />
      ) : (
        <ReviewsDisplay 
          product={product}
          onAddReviewClick={handleAddReviewClick}
          buttonState={{
            disabled: userReviewed && !canLeaveReview,
            message: getButtonMessage(),
            tooltip: getButtonTooltip()
          }}
        />
      )}
    </div>
  );
};

export default ProductReviewsManager;