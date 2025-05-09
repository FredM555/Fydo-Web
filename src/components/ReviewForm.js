// src/components/ReviewForm.js
import React, { useState, useEffect, useMemo } from 'react';
import { Star, AlertCircle, CheckCircle, Loader, MapPin, Calendar, DollarSign, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReceiptUploadEnhanced from './ReceiptUploadEnhanced';
import { 
  getReviewCriterias, 
  addProductReview
} from '../services/reviewService';

/**
 * Composant de formulaire pour créer un avis
 * @param {object} props - Propriétés du composant
 * @param {object} props.product - Données du produit
 * @param {function} props.onSuccess - Fonction appelée après création réussie
 * @param {function} props.onCancel - Fonction appelée lors de l'annulation
 * @returns {JSX.Element}
 */
const ReviewForm = ({ product, onSuccess, onCancel }) => {
  const { currentUser, userDetails } = useAuth();
  
  // États pour le formulaire
  const [ratings, setRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [comment, setComment] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // États pour les critères d'évaluation
  const [criterias, setCriterias] = useState([]);
  
  // États pour les informations d'achat
  const [authorizeReceiptSharing, setAuthorizeReceiptSharing] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Chargement des critères d'évaluation
  useEffect(() => {
    const fetchReviewCriterias = async () => {
      const { success, data, error } = await getReviewCriterias();
      
      if (success && data) {
        setCriterias(data);
        
        // Initialiser les états de notation pour chaque critère
        const initialRatings = {};
        data.forEach(criteria => {
          initialRatings[criteria.id] = 0;
        });
        setRatings(initialRatings);
        setHoverRatings(initialRatings);
      } else if (error) {
        console.error("Erreur lors du chargement des critères:", error);
        setError("Impossible de charger les critères d'évaluation. Veuillez réessayer plus tard.");
      }
    };
    
    fetchReviewCriterias();
  }, []);
  
  // Calcul de la note moyenne en temps réel (weighted average)
  // Ce calcul simule ce qui sera fait au niveau de la base de données
  const averageRating = useMemo(() => {
    if (!criterias.length) return 0;
    
    let totalWeightedRating = 0;
    let totalWeight = 0;
    
    criterias.forEach(criteria => {
      const rating = ratings[criteria.id] || 0;
      if (rating > 0) {
        totalWeightedRating += rating * criteria.weight;
        totalWeight += criteria.weight;
      }
    });
    
    // Si aucune note n'a été donnée, retourner 0
    if (totalWeight === 0) return 0;
    
    // Calculer la moyenne pondérée et arrondir à 1 décimale (comme spécifié dans la base de données - numeric(3,1))
    return Math.round((totalWeightedRating / totalWeight) * 10) / 10;
  }, [ratings, criterias]);
  
  // Gestion de la géolocalisation
  useEffect(() => {
    if (useCurrentLocation) {
      setLocationLoading(true);
      setLocationError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setLocationError("Impossible d'obtenir votre position. Veuillez autoriser l'accès à votre localisation.");
          setLocationLoading(false);
          setUseCurrentLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else if (!useCurrentLocation) {
      setLocation(null);
    }
  }, [useCurrentLocation]);
  
  // Gestion de la notation par critère
  const handleRatingChange = (criteriaId, value) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };
  
  // Gestion du hover sur les étoiles
  const handleRatingHover = (criteriaId, value) => {
    setHoverRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };
  
  // Gestion du upload du ticket de caisse
  const handleReceiptUpload = (receipt, url) => {
    setReceiptUploaded(true);
    setReceiptId(receipt.id);
  };
  
  // Gestion de l'envoi de l'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Vérifier que l'utilisateur est connecté
    if (!currentUser || !userDetails) {
      setError("Vous devez être connecté pour laisser un avis");
      return;
    }
    
    // Vérifier qu'au moins une note est donnée
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      setError("Veuillez attribuer au moins une note");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les informations d'achat
      const purchaseInfo = {
        price: purchasePrice ? parseFloat(purchasePrice) : null,
        date: purchaseDate || null,
        location: location,
        storeName: storeName || null,
        authorizeSharing: authorizeReceiptSharing
      };
      
      // Envoyer l'avis - pas besoin d'envoyer la note moyenne car elle sera calculée côté serveur
      const { success, error } = await addProductReview(
        userDetails.id,
        product.code,
        comment,
        receiptId,
        ratings,
        purchaseInfo
      );
      
      if (success) {
        setSuccess(true);
        
        // Attendre 2 secondes puis appeler onSuccess
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setError(error || "Une erreur est survenue lors de l'envoi de votre avis");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de votre avis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Rendu des étoiles pour un critère
  const renderStars = (criteriaId, interactive = false) => {
    const rating = ratings[criteriaId] || 0;
    const hover = hoverRatings[criteriaId] || 0;
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={`${star <= (interactive ? hover || rating : rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && handleRatingChange(criteriaId, star)}
            onMouseEnter={() => interactive && handleRatingHover(criteriaId, star)}
            onMouseLeave={() => interactive && handleRatingHover(criteriaId, 0)}
          />
        ))}
      </div>
    );
  };
  
  // Rendu des étoiles pour la note moyenne
  const renderAverageStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          // Pour afficher des demi-étoiles
          const difference = star - rating;
          let starClass = "text-gray-300";
          
          if (difference <= 0) {
            starClass = "text-yellow-400 fill-yellow-400"; // Étoile pleine
          } else if (difference < 1 && difference > 0) {
            starClass = "text-yellow-400 fill-yellow-400 opacity-50"; // Demi-étoile (simulée avec opacité)
          }
          
          return (
            <Star 
              key={star} 
              size={20} 
              className={starClass}
            />
          );
        })}
      </div>
    );
  };
  
  // Si aucun produit n'est sélectionné
  if (!product) return null;
  
  return (
    <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Votre avis sur {product.product_name}</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          title="Annuler"
        >
          <X size={20} />
        </button>
      </div>
      
      {success ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle size={20} className="mr-2" />
          <span>Votre avis a été envoyé avec succès et sera publié après modération. Merci !</span>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview}>
          {/* Affichage de la note moyenne calculée en temps réel */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Note moyenne</h4>
            <div className="flex items-center">
              {renderAverageStars(averageRating)}
              <span className="ml-3 text-lg font-bold text-green-700">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}/5
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cette note est calculée automatiquement en fonction de vos évaluations et du poids de chaque critère.
            </p>
          </div>
          
          {/* Notes par critère */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Notation</label>
            <div className="space-y-3">
              {criterias.map(criteria => (
                <div key={criteria.id} className="flex items-center justify-between">
                  <div className="w-1/3">
                    <span className="font-medium">{criteria.display_name}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      (coefficient {criteria.weight})
                    </span>
                  </div>
                  <div className="flex items-center">
                    {renderStars(criteria.id, true)}
                    <span className="ml-2 text-sm text-gray-600">
                      {ratings[criteria.id] > 0 ? `${ratings[criteria.id]}/5` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Commentaire */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Commentaire</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Partagez votre expérience avec ce produit..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          
          {/* Informations d'achat */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Informations d'achat</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Date d'achat */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="purchaseDate">
                  <Calendar size={14} className="inline mr-1" />
                  Date d'achat
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Empêcher les dates futures
                />
              </div>
              
              {/* Prix d'achat */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="purchasePrice">
                  <DollarSign size={14} className="inline mr-1" />
                  Prix d'achat
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                />
              </div>
              
              {/* Nom du magasin */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="storeName">
                  <ShoppingBag size={14} className="inline mr-1" />
                  Nom du magasin
                </label>
                <input
                  type="text"
                  id="storeName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ex: Carrefour, Auchan..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              
              {/* Localisation */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="location">
                  <MapPin size={14} className="inline mr-1" />
                  Localisation
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                    className={`flex items-center px-3 py-2 rounded-md border ${
                      useCurrentLocation 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <MapPin size={16} className="mr-1" />
                    {useCurrentLocation 
                      ? locationLoading 
                        ? 'Chargement...' 
                        : location 
                          ? 'Position actuelle' 
                          : 'Utiliser ma position'
                      : 'Utiliser ma position'
                    }
                  </button>
                </div>
                {locationError && (
                  <p className="text-xs text-red-500 mt-1">{locationError}</p>
                )}
                {location && (
                  <p className="text-xs text-green-600 mt-1">
                    Position enregistrée: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Ticket de caisse */}
          {!receiptUploaded ? (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Ticket de caisse</label>
              <p className="text-sm text-gray-600 mb-3">
                Pour valider votre avis, veuillez télécharger une photo de votre ticket de caisse montrant l'achat du produit.
              </p>
              <ReceiptUploadEnhanced 
                onUploadComplete={handleReceiptUpload} 
                productCode={product.code}
              />
            </div>
          ) : (
            <div className="mb-6 p-3 bg-green-50 rounded-md">
              <p className="text-green-700 flex items-center mb-3">
                <CheckCircle size={16} className="mr-2" />
                Ticket de caisse validé
              </p>
              
              {/* Option pour autoriser le partage du ticket */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="authorizeSharing"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={authorizeReceiptSharing}
                  onChange={(e) => setAuthorizeReceiptSharing(e.target.checked)}
                />
                <label htmlFor="authorizeSharing" className="text-sm text-gray-700">
                  J'autorise le partage de mon ticket de caisse avec les autres utilisateurs
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cette option permet aux autres utilisateurs de voir votre ticket pour vérifier l'authenticité de l'avis.
                Votre ticket sera anonymisé avant d'être partagé.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : 'Publier mon avis'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;