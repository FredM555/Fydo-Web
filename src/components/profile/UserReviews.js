import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserReviews, getReceiptImage, toggleReceiptSharing } from '../../services/reviewService';
import ProfileLayout from '../profile/ProfileLayout';
import { Star, MessageSquare, Loader, AlertCircle, Calendar, Check, ShoppingBag, MapPin, DollarSign, ExternalLink, Eye, EyeOff, Receipt, Image } from 'lucide-react';

/**
 * Composant pour afficher tous les avis publiés par l'utilisateur connecté
 * @returns {JSX.Element}
 */
const UserReviews = () => {
  const { currentUser, userDetails } = useAuth();
  
  // États
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [receiptImages, setReceiptImages] = useState({});
  const [loadingReceipt, setLoadingReceipt] = useState({});
  const [expandedReceipt, setExpandedReceipt] = useState({});
  const [toggleSharing, setToggleSharing] = useState({});
  
  // Chargement des avis de l'utilisateur
  useEffect(() => {
    if (!currentUser || !userDetails) return;
    
    const fetchUserReviews = async () => {
      setLoading(true);
      
      try {
        const { success, reviews, total, error } = await getUserReviews(userDetails.id, 10, offset);
        
        if (success) {
          setReviews(prev => offset === 0 ? reviews : [...prev, ...reviews]);
          setTotalReviews(total);
          setHasMore(offset + reviews.length < total);
        } else {
          setError(error || "Impossible de récupérer vos avis");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des avis:", err);
        setError("Une erreur est survenue lors du chargement de vos avis");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [currentUser, userDetails, offset]);
  
  // Charger plus d'avis
  const loadMoreReviews = () => {
    if (hasMore && !loading) {
      setOffset(prev => prev + 10);
    }
  };
  
  // Fonction pour charger l'image du ticket de caisse
  const loadReceiptImage = async (reviewId) => {
    if (loadingReceipt[reviewId] || receiptImages[reviewId]) return;
    
    setLoadingReceipt(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      const { success, receiptUrl, error: receiptError } = await getReceiptImage(reviewId);
      
      if (success && receiptUrl) {
        setReceiptImages(prev => ({ ...prev, [reviewId]: receiptUrl }));
      } else if (receiptError) {
        console.error("Erreur lors du chargement du ticket:", receiptError);
      }
    } catch (err) {
      console.error("Erreur lors du chargement du ticket:", err);
    } finally {
      setLoadingReceipt(prev => ({ ...prev, [reviewId]: false }));
    }
  };
  
  // Fonction pour basculer l'autorisation de partage du ticket
  const handleToggleSharing = async (reviewId, currentState) => {
    if (toggleSharing[reviewId]) return;
    
    setToggleSharing(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      const { success, error: sharingError } = await toggleReceiptSharing(reviewId, !currentState);
      
      if (success) {
        // Mettre à jour l'état local
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, authorize_receipt_sharing: !currentState } 
            : review
        ));
        
        // Si on désactive le partage, on supprime l'image du ticket si elle a été chargée
        if (currentState && receiptImages[reviewId]) {
          setReceiptImages(prev => {
            const newState = { ...prev };
            delete newState[reviewId];
            return newState;
          });
          
          setExpandedReceipt(prev => {
            const newState = { ...prev };
            delete newState[reviewId];
            return newState;
          });
        }
      } else if (sharingError) {
        console.error("Erreur lors du changement d'autorisation:", sharingError);
      }
    } catch (err) {
      console.error("Erreur lors du changement d'autorisation:", err);
    } finally {
      setToggleSharing(prev => ({ ...prev, [reviewId]: false }));
    }
  };
  
  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating) => {
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
  
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Obtenir la classe de couleur pour le statut de l'avis
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'approved_auto':
        return 'bg-green-100 text-green-800';        
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtenir le texte du statut de l'avis
  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'approved_auto':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };
  
  // Obtenir l'icône du statut de l'avis
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check size={14} className="mr-1" />;
      case 'approved_auto':
        return <Check size={14} className="mr-1" />;
      case 'pending':
        return <Loader size={14} className="mr-1" />;
      case 'rejected':
        return <AlertCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };
  
  // Afficher un placeholder si aucun avis n'est trouvé
  const renderPlaceholder = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun avis publié</h3>
      <p className="text-gray-600 mb-4">
        Vous n'avez pas encore publié d'avis sur des produits.
      </p>
      <Link 
        to="/recherche-filtre" 
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        <Star size={16} className="mr-2" />
        Découvrir des produits
      </Link>
    </div>
  );

  // Fonction pour basculer l'affichage du ticket
  const toggleReceiptDisplay = (reviewId) => {
    setExpandedReceipt(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
    
    // Si on affiche le ticket et qu'il n'est pas encore chargé, on le charge
    if (!expandedReceipt[reviewId] && !receiptImages[reviewId]) {
      loadReceiptImage(reviewId);
    }
  };
  
  return (
    <ProfileLayout title="Mes avis publiés">
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Une erreur est survenue</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : reviews.length === 0 ? (
        renderPlaceholder()
      ) : (
        <div>
          {/* En-tête avec statistiques */}
          <div className="mb-6 bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Résumé de vos contributions</h3>
                <p className="text-green-700 mt-1">Vous avez publié {totalReviews} avis sur des produits</p>
              </div>
              <Link
                to="/recherche-filtre"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <Star size={16} className="mr-2" />
                Évaluer un produit
              </Link>
            </div>
          </div>
          
          {/* Liste des avis */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  {/* En-tête de l'avis avec statut et date */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(review.status)}`}>
                        {getStatusIcon(review.status)}
                        {getStatusText(review.status)}
                      </span>
                      {review.is_verified && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                          <Check size={12} className="mr-1" />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(review.date)}
                    </div>
                  </div>
                  
                  {/* Informations du produit - AMÉLIORÉ avec photo, nom et code EAN */}
                  <div className="mb-3 flex items-start">
                    {/* Photo du produit */}
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                      {review.product_image_url ? (
                        <img 
                          src={review.product_image_url} 
                          alt="Produit" 
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = '/placeholder.png'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-medium text-green-800">
                          {review.product_name || 'Produit sans nom'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Code EAN: {review.product_code}
                      </p>
                      <div className="flex items-center mb-2">
                        {renderStars(review.average_rating)}
                        <span className="ml-2 font-medium">{review.average_rating.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Détail des notes par critère - ALIGNÉS SUR LA MÊME LIGNE */}
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div key={key} className="flex items-center mr-6 mb-2">
                          <div className="w-20 text-sm text-gray-600 mr-1">{value.display_name}:</div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={14} 
                                className={`${star <= value.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Commentaire de l'avis */}
                  <div className="mb-3">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  
                  {/* Affichage des informations d'achat */}
                  {(review.purchase_date || review.purchase_price || review.store_name || review.has_location) && (
                    <div className="mt-2 border-t border-gray-200 pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Détails de l'achat</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {review.purchase_date && (
                          <div className="flex items-center">
                            <Calendar size={14} className="text-gray-500 mr-1" />
                            <span>Acheté le {formatDate(review.purchase_date)}</span>
                          </div>
                        )}
                        
                        {review.purchase_price && (
                          <div className="flex items-center">
                            <DollarSign size={14} className="text-gray-500 mr-1" />
                            <span>Prix: {review.purchase_price} €</span>
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
                  
                  {/* Section du ticket de caisse */}
                  {review.is_verified && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Receipt size={16} className="text-gray-600 mr-2" />
                          <h4 className="text-sm font-medium text-gray-700">Ticket de caisse</h4>
                        </div>
                        
                        <div className="flex space-x-2">
                          {/* Bouton pour basculer l'autorisation de partage */}
                          <button
                            onClick={() => handleToggleSharing(review.id, review.authorize_receipt_sharing)}
                            disabled={toggleSharing[review.id]}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                              review.authorize_receipt_sharing 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={review.authorize_receipt_sharing ? "Désactiver le partage public" : "Activer le partage public"}
                          >
                            {toggleSharing[review.id] ? (
                              <Loader size={12} className="animate-spin mr-1" />
                            ) : review.authorize_receipt_sharing ? (
                              <EyeOff size={12} className="mr-1" />
                            ) : (
                              <Eye size={12} className="mr-1" />
                            )}
                            {review.authorize_receipt_sharing ? "Public" : "Privé"}
                          </button>
                          
                          {/* Bouton pour afficher/masquer le ticket */}
                          <button
                            onClick={() => toggleReceiptDisplay(review.id)}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
                          >
                            <Image size={12} className="mr-1" />
                            {expandedReceipt[review.id] ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                      </div>
                      
                      {/* Affichage de l'image du ticket de caisse */}
                      {expandedReceipt[review.id] && (
                        <div className="mt-2">
                          {loadingReceipt[review.id] ? (
                            <div className="flex justify-center items-center h-40 bg-gray-100 rounded">
                              <Loader size={24} className="animate-spin text-gray-400" />
                            </div>
                          ) : receiptImages[review.id] ? (
                            <div className="max-h-96 overflow-auto">
                              <img 
                                src={receiptImages[review.id]} 
                                alt="Ticket de caisse" 
                                className="w-full object-contain rounded border border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center items-center h-40 bg-gray-100 rounded">
                              <div className="text-center text-gray-500">
                                <Receipt size={32} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Impossible de charger le ticket de caisse</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Information sur la confidentialité */}
                      <p className="text-xs text-gray-500 mt-2">
                        {review.authorize_receipt_sharing 
                          ? "Ce ticket de caisse est visible par les autres utilisateurs." 
                          : "Ce ticket de caisse est privé et n'est visible que par vous."}
                      </p>
                    </div>
                  )}
                  
                  {/* Bouton pour voir le produit */}
                  <div className="mt-3 flex justify-end">
                    <Link
                      to={`/recherche-filtre?barcode=${review.product_code}`}
                      className="inline-flex items-center text-green-600 hover:text-green-800 text-sm"
                    >
                      Voir le produit <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Chargement de plus de résultats */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMoreReviews}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader size={16} className="animate-spin mr-2" />
                      Chargement...
                    </div>
                  ) : 'Charger plus d\'avis'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default UserReviews;