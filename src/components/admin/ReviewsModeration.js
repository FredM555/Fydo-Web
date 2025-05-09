// src/components/admin/ReviewsModeration.js
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, AlertCircle, Loader, ShoppingBag, MapPin, Calendar, DollarSign, Check, X, Eye } from 'lucide-react';
import { 
  getPendingReviews,
  approveReview,
  rejectReview,
  getReviewImage
} from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/formatters';

/**
 * Composant d'administration pour la modération des avis en attente
 * @returns {JSX.Element}
 */
const ReviewsModeration = () => {
  // États pour gérer les avis et les filtres
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptImage, setShowReceiptImage] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewToReject, setReviewToReject] = useState(null);

  // Charger les avis en attente au chargement du composant et lors des changements de filtres
  useEffect(() => {
    fetchPendingReviews();
  }, [filter, sortOrder]);

  // Fonction pour récupérer les avis en attente
  const fetchPendingReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options = {
        filter,
        sortOrder,
        searchTerm
      };
      
      const { success, data, count, error } = await getPendingReviews(options);
      
      if (success) {
        setReviews(data);
        setTotalReviews(count);
      } else {
        setError(error || 'Erreur lors de la récupération des avis');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la communication avec le serveur');
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour approuver un avis
  const handleApproveReview = async (reviewId) => {
    setProcessing(reviewId);
    
    try {
      const { success, error } = await approveReview(reviewId);
      
      if (success) {
        // Supprimer l'avis approuvé de la liste
        setReviews(reviews.filter(review => review.id !== reviewId));
        setTotalReviews(prev => prev - 1);
      } else {
        setError(error || 'Erreur lors de l\'approbation de l\'avis');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la communication avec le serveur');
      console.error('Erreur détaillée:', err);
    } finally {
      setProcessing(null);
    }
  };

  // Fonction pour ouvrir la modal de rejet d'un avis
  const openRejectModal = (reviewId) => {
    setReviewToReject(reviewId);
    setRejectionReason('');
  };

  // Fonction pour fermer la modal de rejet
  const closeRejectModal = () => {
    setReviewToReject(null);
    setRejectionReason('');
  };

  // Fonction pour rejeter un avis
  const handleRejectReview = async () => {
    if (!reviewToReject) return;
    
    setProcessing(reviewToReject);
    
    try {
      const reason = rejectionReason.trim() || null;
      const { success, error } = await rejectReview(reviewToReject, reason);
      
      if (success) {
        // Supprimer l'avis rejeté de la liste
        setReviews(reviews.filter(review => review.id !== reviewToReject));
        setTotalReviews(prev => prev - 1);
        closeRejectModal();
      } else {
        setError(error || 'Erreur lors du rejet de l\'avis');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la communication avec le serveur');
      console.error('Erreur détaillée:', err);
    } finally {
      setProcessing(null);
    }
  };

  // Fonction pour afficher l'image du ticket de caisse
  const handleViewReceipt = async (reviewId) => {
    try {
      const { success, imageUrl, error } = await getReviewImage(reviewId);
      
      if (success && imageUrl) {
        setShowReceiptImage(imageUrl);
      } else {
        setError(error || 'Impossible de récupérer l\'image du ticket');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération de l\'image');
      console.error('Erreur détaillée:', err);
    }
  };

  // Fermer la modal d'affichage du ticket
  const handleCloseReceiptModal = () => {
    setShowReceiptImage(null);
  };

  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPendingReviews();
  };

  // Fonction pour afficher les étoiles avec précision
  const renderPreciseStars = (rating, size = 16) => {
    // Convertir la note en nombre
    const ratingNum = parseFloat(rating);
    
    return (
      <div className="flex relative">
        {[1, 2, 3, 4, 5].map((star) => {
          // Calculer le pourcentage de remplissage pour chaque étoile
          let fillPercentage = 0;
          
          if (ratingNum >= star) {
            // Étoile complètement remplie
            fillPercentage = 100;
          } else if (ratingNum > star - 1) {
            // Étoile partiellement remplie
            fillPercentage = Math.round((ratingNum - (star - 1)) * 100);
          }
          
          return (
            <div key={star} className="relative" style={{ width: size, height: size }}>
              {/* Étoile de fond (grise) */}
              <Star 
                size={size} 
                className="absolute text-gray-300"
              />
              
              {/* Étoile de premier plan (jaune) avec clip-path pour le remplissage partiel */}
              <div 
                className="absolute overflow-hidden" 
                style={{ width: `${fillPercentage}%`, height: '100%' }}
              >
                <Star 
                  size={size} 
                  className="text-yellow-400 fill-yellow-400"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Modération des avis</h1>
        <p className="text-gray-600">Gérez les avis en attente de validation</p>
      </div>
      
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filtre</label>
              <select
                id="filter"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tous les avis</option>
                <option value="verified">Avis vérifiés</option>
                <option value="unverified">Avis non vérifiés</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Tri</label>
              <select
                id="sortOrder"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <form onSubmit={handleSearch}>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <div className="flex">
                <input
                  type="text"
                  id="searchTerm"
                  className="border border-gray-300 rounded-l-md p-2 w-full"
                  placeholder="Code produit, nom d'utilisateur ou texte d'avis"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded-r-md px-4 hover:bg-green-700"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Liste des avis en attente */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Chargement des avis...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">Aucun avis en attente</h3>
          <p className="text-gray-600">Tous les avis ont été traités</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">{totalReviews} avis en attente de modération</p>
          
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
                  processing === review.id ? 'opacity-50' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">{review.users.display_name}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span className="text-gray-500">{review.users.email}</span>
                        {review.is_verified && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Achat vérifié
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Produit: <span className="font-medium">{review.product_code}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Date de création: {formatDate(review.creation_date)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {review.receipt_id && (
                        <button
                          onClick={() => handleViewReceipt(review.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          disabled={processing === review.id}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir le ticket
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center"
                        disabled={processing === review.id}
                      >
                        {processing === review.id ? (
                          <Loader className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approuver
                      </button>
                      
                      <button
                        onClick={() => openRejectModal(review.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center"
                        disabled={processing === review.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 mb-3">
                    <div className="flex space-x-6 mb-2">
                      <div className="flex items-center">
                        <span className="mr-2 text-sm font-medium">Note moyenne:</span>
                        <div className="flex items-center">
                          {renderPreciseStars(review.average_rating)}
                          <span className="ml-1 font-medium">{parseFloat(review.average_rating).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {/* Notes spécifiques sur une ligne */}
                      <div className="flex space-x-4">
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600 mr-1">Goût:</span>
                          <span className="font-medium">{review.taste_rating}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600 mr-1">Quantité:</span>
                          <span className="font-medium">{review.quantity_rating}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600 mr-1">Prix:</span>
                          <span className="font-medium">{review.price_rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commentaire de l'avis */}
                    <p className="text-gray-700 border-l-4 border-gray-200 pl-3 py-1 my-2">
                      {review.comment}
                    </p>
                    
                    {/* Informations d'achat */}
                    {(review.purchase_price || review.store_name || review.purchase_date) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                        {review.purchase_date && (
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>Achat: {formatDate(review.purchase_date)}</span>
                          </div>
                        )}
                        
                        {review.purchase_price > 0 && (
                          <div className="flex items-center">
                            <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>Prix: {formatPrice(review.purchase_price)}</span>
                          </div>
                        )}
                        
                        {review.store_name && (
                          <div className="flex items-center">
                            <ShoppingBag className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>Enseigne: {review.store_name}</span>
                          </div>
                        )}
                        
                        {review.purchase_location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span className="text-green-600">Localisation disponible</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Modal pour le rejet d'un avis */}
      {reviewToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Rejeter l'avis</h2>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">Veuillez indiquer la raison du rejet (optionnel) :</p>
              
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 h-24"
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={closeRejectModal}
                disabled={processing === reviewToReject}
              >
                Annuler
              </button>
              
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                onClick={handleRejectReview}
                disabled={processing === reviewToReject}
              >
                {processing === reviewToReject ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour afficher l'image du ticket de caisse */}
      {showReceiptImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Ticket de caisse</h3>
              
              <button
                onClick={handleCloseReceiptModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 bg-gray-100">
              <div className="flex justify-center">
                <img 
                  src={showReceiptImage} 
                  alt="Ticket de caisse" 
                  className="max-h-[70vh] object-contain"
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={handleCloseReceiptModal}
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

export default ReviewsModeration;