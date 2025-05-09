// src/components/PageAvisEnhanced.js - Version modifiée avec le hook personnalisé
import React, { useState } from 'react';
import ReviewsDisplay from './ReviewsDisplay';
import ReviewForm from './ReviewForm';
import useProductReviews from '../hooks/useProductReviews';
import { formatDate } from '../utils/formatters';

/**
 * Composant amélioré pour afficher et gérer les avis produits
 * Utilise le hook personnalisé useProductReviews
 * @param {object} product - Données du produit
 * @returns {JSX.Element}
 */
const PageAvisEnhanced = ({ product }) => {
  const [showAddReview, setShowAddReview] = useState(false);
  
  const {
    loading,
    error,
    reviews,
    totalReviews,
    averageRating,
    verifiedReviews,
    submitReview,
    getUserPermissions
  } = useProductReviews(product?.code);
  
  const { userReviewed, canLeaveReview, lastReviewDate, isLoggedIn } = getUserPermissions();

  // Gestion de l'ouverture du formulaire d'ajout d'avis
  const handleShowAddReview = () => {
    if (!isLoggedIn) {
      // Gérer l'erreur de non-connexion
      alert("Vous devez être connecté pour laisser un avis");
      return;
    }
    
    if (userReviewed && !canLeaveReview) {
      // Si l'utilisateur a déjà laissé un avis ce mois-ci, ne pas ouvrir le formulaire
      return;
    }
    
    setShowAddReview(true);
  };

  // Gestion de l'annulation du formulaire d'ajout d'avis
  const handleCancelAddReview = () => {
    setShowAddReview(false);
  };

  // Gestion du succès après l'ajout d'un avis
  const handleReviewSuccess = async (reviewData) => {
    // Soumettre l'avis via le hook
    const result = await submitReview(reviewData);
    
    if (result.success) {
      setShowAddReview(false);
      
      // Recharger la page après un court délai pour afficher le nouvel avis
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Obtenir le message à afficher sur le bouton
  const getButtonMessage = () => {
    if (userReviewed && !canLeaveReview) {
      return "Vous avez déjà donné votre avis";
    }
    
    if (userReviewed && canLeaveReview) {
      return "Donner un nouvel avis";
    }
    
    return "Donner mon avis";
  };

  // Obtenir le tooltip à afficher sur le bouton
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

  // Si aucun produit n'est sélectionné
  if (!product) return null;
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {showAddReview ? (
        // Afficher le formulaire d'ajout d'avis
        <ReviewForm 
          product={product}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelAddReview}
        />
      ) : (
        // Afficher la liste des avis
        <ReviewsDisplay 
          product={product}
          onAddReviewClick={handleShowAddReview}
          buttonState={{
            disabled: userReviewed && !canLeaveReview,
            message: getButtonMessage(),
            tooltip: getButtonTooltip()
          }}
          loading={loading}
          reviews={reviews}
          totalReviews={totalReviews}
          averageRating={averageRating}
          verifiedReviews={verifiedReviews}
        />
      )}
    </div>
  );
};

export default PageAvisEnhanced;