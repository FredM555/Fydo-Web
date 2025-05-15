// src/components/ReviewForm.js
import React, { useState, useEffect, useMemo } from 'react';
import { Star, AlertCircle, CheckCircle, Loader, Calendar, DollarSign, ShoppingBag, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReceiptUploadEnhanced from './ReceiptUploadEnhanced';
import ReceiptItemSelector from './ReceiptItemSelector';
import { 
  getReviewCriterias, 
  addProductReview
} from '../services/reviewService';
import { formatDate, formatPrice } from '../utils/formatters';
import { findBestMatchingItem } from '../utils/textSimilarityUtils';

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
  
  // Nouveaux états pour les validations et alertes
  const [validationErrors, setValidationErrors] = useState({});
  const [matchScore, setMatchScore] = useState(0);
  const [showLowMatchAlert, setShowLowMatchAlert] = useState(false);
  const [showZeroRatingAlert, setShowZeroRatingAlert] = useState(false);
  
  // États pour les critères d'évaluation
  const [criterias, setCriterias] = useState([]);
  
  // États pour les informations d'achat
  const [authorizeReceiptSharing, setAuthorizeReceiptSharing] = useState(true);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState(null);
  
  // État pour les données extraites par Claude AI
  const [aiData, setAiData] = useState(null);
  const [aiDataAvailable, setAiDataAvailable] = useState(false);
  
  // État pour les articles du ticket
  const [receiptItems, setReceiptItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
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
    
    if (totalWeight === 0) return 0;
    
    return Math.round((totalWeightedRating / totalWeight) * 100) / 100;
  }, [ratings, criterias]);
  
  // Vérifier si des notes sont à zéro
  useEffect(() => {
    if (criterias.length > 0) {
      const hasZeroRating = criterias.some(criteria => ratings[criteria.id] === 0);
      setShowZeroRatingAlert(hasZeroRating);
    }
  }, [ratings, criterias]);
  
  // Gestion de la notation par critère
  const handleRatingChange = (criteriaId, value) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
    
    // Effacer l'erreur de validation liée aux notes
    setValidationErrors(prev => ({
      ...prev,
      ratings: null
    }));
  };
  
  // Gestion du hover sur les étoiles
  const handleRatingHover = (criteriaId, value) => {
    setHoverRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };
  
  // Gestion du changement de commentaire
  const handleCommentChange = (e) => {
    setComment(e.target.value);
    
    // Effacer l'erreur de validation liée au commentaire
    if (e.target.value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        comment: null
      }));
    }
  };
  
  // Gestion du upload du ticket de caisse
  const handleReceiptUpload = (receipt, url, extractedData) => {
    setReceiptUploaded(true);
    setReceiptId(receipt.id);
    
    // Stocker les données extraites par Claude AI localement
    if (extractedData) {
      console.log("Données extraites par Claude AI:", extractedData);
      setAiData(extractedData);
      
      // Mettre à jour les champs du formulaire avec les données extraites
      if (extractedData.date) {
        setPurchaseDate(extractedData.date);
      }
      
      if (extractedData.store) {
        setStoreName(extractedData.store);
      }
      
      if (extractedData.price) {
        setPurchasePrice(extractedData.price.toString());
      }
      
      // Gérer les articles extraits du ticket
      if (extractedData.articles && Array.isArray(extractedData.articles)) {
        // Ajouter un ID temporaire à chaque article pour la gestion dans le composant
        const itemsWithIds = extractedData.articles.map((item, index) => ({
          ...item,
          id: `ai-item-${index}`,
          // Convertir les chaînes en nombres si nécessaire
          quantite: typeof item.quantite === 'string' ? parseFloat(item.quantite) : item.quantite,
          prix_unitaire: typeof item.prix_unitaire === 'string' ? parseFloat(item.prix_unitaire) : item.prix_unitaire,
          prix_total: typeof item.prix_total === 'string' ? parseFloat(item.prix_total) : item.prix_total
        }));
        
        setReceiptItems(itemsWithIds);
        
        // Utiliser findBestMatchingItem pour identifier l'article le plus probable
        if (product && product.product_name) {
          const { item, score } = findBestMatchingItem(itemsWithIds, product);
          console.log(`Meilleure correspondance: ${item?.designation || 'Aucune'} (score: ${score})`);
          
          // Enregistrer le score pour la logique de validation et d'alerte
          setMatchScore(score);
          
          // Afficher une alerte si le score est faible
          setShowLowMatchAlert(score < 0.8);
          
          // Sélectionner automatiquement l'article avec la correspondance la plus élevée
          if (item) {
            setSelectedItem(item);
            
            // Mettre à jour le prix d'achat avec le prix de l'article le plus probable
            if (item.prix_total) {
              setPurchasePrice(item.prix_total.toString());
            }
            
            // Effacer l'erreur de validation liée à la sélection d'article
            setValidationErrors(prev => ({
              ...prev,
              selectedItem: null
            }));
          }
        }
      }
      
      // Indiquer que les données AI sont disponibles
      setAiDataAvailable(true);
    }
  };
  
  // Gestion des mises à jour des articles du ticket
  const handleReceiptItemsChange = (updatedItems) => {
    setReceiptItems(updatedItems);
    
    // Si l'article sélectionné a été modifié, mettre à jour la sélection
    if (selectedItem) {
      const updatedSelectedItem = updatedItems.find(item => item.id === selectedItem.id);
      if (updatedSelectedItem) {
        setSelectedItem(updatedSelectedItem);
      } else {
        // L'article sélectionné a été supprimé
        setSelectedItem(null);
        setValidationErrors(prev => ({
          ...prev,
          selectedItem: "Vous devez sélectionner un article du ticket"
        }));
      }
    }
    
    // Mettre à jour le prix d'achat en fonction de l'article sélectionné
    if (selectedItem) {
      setPurchasePrice(selectedItem.prix_total.toString());
    }
  };
  
  // Gestion de la sélection d'un article
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    
    // Mettre à jour le prix d'achat avec le prix de l'article sélectionné
    if (item && item.prix_total) {
      setPurchasePrice(item.prix_total.toString());
    }
    
    // Effacer l'erreur de validation liée à la sélection d'article
    setValidationErrors(prev => ({
      ...prev,
      selectedItem: null
    }));
    
    // Mise à jour du score de correspondance
    if (item && product && product.product_name) {
      const score = item.matchScore || findBestMatchingItem([item], product).score;
      setMatchScore(score);
      setShowLowMatchAlert(score < 0.8);
    }
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    // Vérifier si le commentaire est vide
    if (!comment.trim()) {
      errors.comment = "Le commentaire est obligatoire";
    }
    
    // Vérifier si un article est sélectionné
    if (!selectedItem && receiptItems.length > 0) {
      errors.selectedItem = "Vous devez sélectionner un article du ticket";
    }
    
    // Vérifier qu'au moins une note est donnée
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      errors.ratings = "Veuillez attribuer au moins une note";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Gestion de l'envoi de l'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Vérifier que l'utilisateur est connecté
    if (!currentUser || !userDetails) {
      setError("Vous devez être connecté pour laisser un avis");
      return;
    }
    
    // Valider le formulaire
    if (!validateForm()) {
      // Le formulaire contient des erreurs, ne pas soumettre
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
        authorizeSharing: authorizeReceiptSharing,
        // Transmettre les articles du ticket
        receiptItems: receiptItems,
        // Transmettre l'ID de l'article sélectionné
        selectedItemId: selectedItem ? selectedItem.id : null,
        // Transmettre le score de correspondance pour la logique de status
        matchScore: matchScore
      };
      
      console.log("Envoi de l'avis avec les infos d'achat:", purchaseInfo);
      
      // Envoyer l'avis et les informations extraites
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
          <span>Votre avis a été envoyé avec succès et sera {matchScore >= 0.75 ? "publié immédiatement" : "publié après modération"}. Merci !</span>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview}>
          {/* Affichage de la note moyenne calculée en temps réel */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Note moyenne</h4>
            <div className="flex items-center">
              {renderAverageStars(averageRating)}
              <span className="ml-3 text-lg font-bold text-green-700">
                {averageRating > 0 ? averageRating.toFixed(2) : '0.0'}/5
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cette note est calculée automatiquement en fonction de vos évaluations et du poids de chaque critère.
            </p>
          </div>
          
          {/* Alerte si une note est à zéro */}
          {showZeroRatingAlert && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>Certains critères n'ont pas été notés. Veuillez attribuer une note pour tous les critères.</span>
            </div>
          )}
          
          {validationErrors.ratings && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{validationErrors.ratings}</span>
            </div>
          )}
          
          {/* Notes par critère */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Notation <span className="text-red-500">*</span></label>
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
            <label className="block text-gray-700 font-medium mb-2">
              Commentaire <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-3 py-2 border ${validationErrors.comment ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              rows="4"
              placeholder="Partagez votre expérience avec ce produit..."
              value={comment}
              onChange={handleCommentChange}
              required
            ></textarea>
            {validationErrors.comment && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.comment}</p>
            )}
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
                productName={product.product_name}
              />
            </div>
          ) : (
            <div className="mb-6 p-3 bg-green-50 rounded-md">
              <p className="text-green-700 flex items-center mb-3">
                <CheckCircle size={16} className="mr-2" />
                Ticket de caisse validé
              </p>
              
              {/* Option pour autoriser le partage du ticket - cochée par défaut */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="authorizeSharing"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={authorizeReceiptSharing}
                  onChange={(e) => setAuthorizeReceiptSharing(e.target.checked)}
                />
                <label htmlFor="authorizeSharing" className="text-sm text-gray-700">
                  J'autorise le partage anonymisé de mon ticket de caisse
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cette option permet aux autres utilisateurs de voir votre ticket pour vérifier l'authenticité de l'avis.
                Votre ticket sera anonymisé avant d'être partagé.
              </p>
            </div>
          )}
          
          {/* Sélection et édition des articles du ticket avec taux de correspondance */}
          {receiptUploaded && receiptItems.length > 0 && (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Articles détectés sur votre ticket <span className="text-red-500">*</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Vous devez sélectionner l'article correspondant à ce produit, ou modifier les informations détectées si nécessaire.
                Le taux de correspondance vous aide à identifier l'article correspondant au produit <strong>{product.product_name}</strong>.
              </p>
              
              {/* Alerte si le taux de correspondance est faible */}
              {showLowMatchAlert && (
                <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
                  <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Faible taux de correspondance détecté</p>
                    <p className="text-sm">Le taux de correspondance de l'article sélectionné est inférieur à 80%. 
                    Votre avis sera soumis à modération avant publication.</p>
                  </div>
                </div>
              )}
              
              {validationErrors.selectedItem && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>{validationErrors.selectedItem}</span>
                </div>
              )}
              
              <ReceiptItemSelector 
                items={receiptItems}
                onChange={handleReceiptItemsChange}
                selectedItem={selectedItem}
                onSelect={handleSelectItem}
                productName={product.product_name} // Passer le nom du produit pour le calcul de correspondance
              />
              
              {selectedItem && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-blue-700 text-sm font-medium">Article sélectionné : <strong>{selectedItem.designation}</strong></p>
                  <p className="text-xs text-blue-600 mt-1">
                    Le prix d'achat de cet article ({formatPrice(selectedItem.prix_total)}) sera utilisé pour votre avis.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Informations d'achat extraites */}
          {aiDataAvailable && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Informations d'achat extraites</h4>
              
              <div className="space-y-4">
                {/* Date d'achat */}
                {purchaseDate && (
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-green-600" />
                    <span className="text-gray-700">Date d'achat : <strong>{formatDate(purchaseDate)}</strong></span>
                  </div>
                )}
                
                {/* Prix d'achat */}
                {purchasePrice && (
                  <div className="flex items-center">
                    <DollarSign size={16} className="mr-2 text-green-600" />
                    <span className="text-gray-700">Prix d'achat : <strong>{formatPrice(parseFloat(purchasePrice))}</strong></span>
                  </div>
                )}
                
                {/* Nom du magasin */}
                {storeName && (
                  <div className="flex items-center">
                    <ShoppingBag size={16} className="mr-2 text-green-600" />
                    <span className="text-gray-700">Magasin : <strong>{storeName}</strong></span>
                  </div>
                )}
                
                {/* Message informatif */}
                <p className="text-xs text-gray-500 italic mt-1">
                  Ces informations ont été extraites automatiquement de votre ticket de caisse par IA.
                </p>
              </div>
            </div>
          )}
          
          {/* Ces champs sont masqués car nous utilisons maintenant les informations extraites */}
          <input type="hidden" name="purchaseDate" value={purchaseDate} />
          <input type="hidden" name="purchasePrice" value={purchasePrice} />
          <input type="hidden" name="storeName" value={storeName} />
          
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
              disabled={loading || !receiptUploaded}
            >
              {loading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : !receiptUploaded ? (
                'Téléchargez un ticket de caisse pour continuer'
              ) : (
                'Publier mon avis'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;