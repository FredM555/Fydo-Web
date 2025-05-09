// src/components/ReviewsDisplay.js
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, AlertCircle, Loader, ShoppingBag, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getProductReviews, 
  toggleReviewLike,
  checkUserLike,
  getReceiptImage
} from '../services/reviewService';
import { formatPrice } from '../utils/formatters';

/**
 * Composant d'affichage des avis pour un produit
 * @param {object} props - Propriétés du composant
 * @param {object} props.product - Données du produit
 * @param {Function} props.onAddReviewClick - Fonction appelée lorsque l'utilisateur souhaite ajouter un avis
 * @returns {JSX.Element}
 */
const ReviewsDisplay = ({ product, onAddReviewClick }) => {
  const { currentUser, userDetails } = useAuth();
  
  // États pour les avis et leur chargement
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState(null);
  const [showReceiptImage, setShowReceiptImage] = useState(null);
  
  // États pour les données
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [verifiedReviews, setVerifiedReviews] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [reviewLikes, setReviewLikes] = useState({});
  
  // Chargement des avis pour le produit
  useEffect(() => {
    if (!product?.code) return;
    
    const fetchReviews = async () => {
      setLoadingReviews(true);
      
      const { success, reviews, total, average, total_reviews, verified_reviews, error } = 
        await getProductReviews(product.code, 5, offset);
      
      if (success) {
        setReviews(prev => offset === 0 ? reviews : [...prev, ...reviews]);
        setTotalReviews(total_reviews);
        setAverageRating(average || 0);
        setVerifiedReviews(verified_reviews);
        setHasMore(reviews.length + (offset === 0 ? 0 : reviews.length) < total);
      } else if (error) {
        console.error("Erreur lors du chargement des avis:", error);
        setError("Impossible de charger les avis. Veuillez réessayer plus tard.");
      }
      
      setLoadingReviews(false);
    };
    
    fetchReviews();
  }, [product?.code, offset]);
  
  // Vérifier les likes de l'utilisateur sur les avis
  useEffect(() => {
    const checkLikes = async () => {
      if (!currentUser || !userDetails || reviews.length === 0) return;
      
      const newLikes = {};
      
      // Pour chaque avis, vérifier si l'utilisateur l'a liké
      for (const review of reviews) {
        const { success, hasLiked } = await checkUserLike(userDetails.id, review.id);
        if (success) {
          newLikes[review.id] = hasLiked;
        }
      }
      
      setReviewLikes(newLikes);
    };
    
    checkLikes();
  }, [currentUser, userDetails, reviews]);

  // Affichage de l'image du ticket
  const handleViewReceipt = async (reviewId) => {
    try {
      const { success, receiptUrl, error } = await getReceiptImage(reviewId);
      
      if (success && receiptUrl) {
        setShowReceiptImage(receiptUrl);
      } else {
        console.error("Erreur lors de la récupération du ticket:", error);
      }
    } catch (err) {
      console.error("Erreur lors de l'affichage du ticket:", err);
    }
  };

  // Fermer la modal d'affichage du ticket
  const handleCloseReceiptModal = () => {
    setShowReceiptImage(null);
  };
  
  // Gestion des likes sur les avis
  const handleLikeReview = async (reviewId) => {
    if (!currentUser || !userDetails) {
      setError("Vous devez être connecté pour aimer un avis");
      return;
    }
    
    // Inverser l'état actuel du like
    const currentlyLiked = reviewLikes[reviewId] || false;
    
    try {
      const { success } = await toggleReviewLike(userDetails.id, reviewId, !currentlyLiked);
      
      if (success) {
        // Mettre à jour l'état local des likes
        setReviewLikes(prev => ({
          ...prev,
          [reviewId]: !currentlyLiked
        }));
        
        // Mettre à jour le compteur de likes dans la liste des avis
        setReviews(prev => 
          prev.map(review => {
            if (review.id === reviewId) {
              return {
                ...review,
                likes_count: currentlyLiked 
                  ? Math.max(0, review.likes_count - 1) 
                  : review.likes_count + 1
              };
            }
            return review;
          })
        );
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout/retrait du like:", err);
    }
  };
  
  // Charger plus d'avis
  const handleLoadMoreReviews = () => {
    if (hasMore && !loadingReviews) {
      setOffset(prev => prev + 5);
    }
  };
  
  // Fonction pour afficher les étoiles de notation moyenne
  const renderAverageStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={24} 
            className={`${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };

  // Fonction pour afficher les étoiles de notation individuelle
  const renderReviewStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={`${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Si aucun produit n'est sélectionné
  if (!product) return null;
  
  return (
    <div>
      {/* Résumé des avis */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="text-4xl font-bold text-green-800 mr-3">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex mb-1">
                {renderAverageStars(averageRating)}
              </div>
              <div className="text-sm text-gray-600">
                Basé sur {totalReviews} avis
                {verifiedReviews > 0 && ` dont ${verifiedReviews} vérifiés`}
              </div>
            </div>
          </div>
          
          <button
            onClick={onAddReviewClick}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
          >
            <MessageSquare size={18} className="mr-2" />
            Donner mon avis
          </button>
        </div>
      </div>
      
      {/* Liste des avis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Avis des utilisateurs</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {loadingReviews && reviews.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader size={30} className="animate-spin text-green-600" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{review.user_name}</span>
                      {review.is_verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <ShoppingBag size={12} className="mr-1" />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(review.date)}
                    </div>
                    <div className="mb-2 flex items-center">
                      {renderReviewStars(review.average_rating)}
                      <span className="ml-2 font-medium">{review.average_rating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <button 
                    className={`text-gray-400 hover:text-green-600 flex items-center ${
                      reviewLikes[review.id] ? 'text-green-600' : ''
                    }`}
                    onClick={() => handleLikeReview(review.id)}
                  >
                    <ThumbsUp size={16} className={reviewLikes[review.id] ? 'fill-green-600' : ''} />
                    <span className="text-xs ml-1">{review.likes_count}</span>
                  </button>
                </div>
                
                {/* Détail des notes par critère */}
                <div className="mt-2 mb-3 grid grid-cols-2 gap-2">
                  {Object.entries(review.ratings).map(([key, value]) => (
                    <div key={key} className="flex items-center text-sm">
                      <span className="text-gray-600 mr-2">{value.display_name}:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={12} 
                            className={`${star <= value.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                {/* Affichage des nouvelles informations d'achat */}
                {(review.purchase_date || review.purchase_price || review.store_name || review.has_location) && (
                  <div className="mt-2 border-t border-gray-200 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Détails de l'achat</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {review.purchase_date && (
                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-500 mr-1" />
                          <span>Acheté le {formatDate(review.purchase_date)}</span>
                        </div>
                      )}
                      
                      {review.purchase_price && (
                        <div className="flex items-center">
                          <DollarSign size={14} className="text-gray-500 mr-1" />
                          <span>Prix: {formatPrice(review.purchase_price)}</span>
                        </div>
                      )}
                      
                      {review.store_name && (
                        <div className="flex items-center">
                          <ShoppingBag size={14} className="text-gray-500 mr-1" />
                          <span>Enseigne: {review.store_name}</span>
                        </div>
                      )}
                      
                      {review.has_location && (
                        <div className="flex items-center">
                          <MapPin size={14} className="text-gray-500 mr-1" />
                          <span>Localisation disponible</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Bouton pour voir le ticket de caisse si disponible */}
                {review.can_show_receipt && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleViewReceipt(review.id)}
                      className="text-green-600 hover:text-green-800 text-sm flex items-center"
                    >
                      <ShoppingBag size={14} className="mr-1" />
                      Voir le ticket de caisse
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Bouton pour charger plus d'avis */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMoreReviews}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  disabled={loadingReviews}
                >
                  {loadingReviews ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : 'Voir plus d\'avis'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 text-center rounded-lg">
            <MessageSquare size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
          </div>
        )}
      </div>
      
      {/* Modal pour afficher l'image du ticket de caisse */}
      {showReceiptImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ticket de caisse</h3>
              <button
                onClick={handleCloseReceiptModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
              <img
                src={showReceiptImage}
                alt="Ticket de caisse"
                className="max-h-[70vh] object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleCloseReceiptModal}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;