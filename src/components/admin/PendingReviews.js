// src/components/admin/PendingReviews.js - Version responsive améliorée
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Check, 
  X, 
  AlertCircle, 
  Loader, 
  Search,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  ShoppingBag,
  Filter,
  ExternalLink,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import ProfileLayout from '../profile/ProfileLayout';
import { formatDate } from '../../utils/formatters';

const PendingReviews = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'rejected', 'approved'
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false); // État pour contrôler l'affichage des filtres sur mobile
  
  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (userDetails && userDetails.userType !== 'Admin') {
      navigate('/profile');
    }
  }, [userDetails, navigate]);
  
  // Charger les avis selon l'onglet actif
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser || !userDetails) return;
      
      try {
        setLoading(true);
        
        // Construire la requête de base
        let query = supabase
          .from('product_reviews')
          .select(`
            *,
            users!inner (id, display_name, email),
            review_ratings (id, criteria_id, rating),
            review_criterias:review_ratings(criteria_id) (id, name, display_name, weight),
            products (product_name, brands, image_url, firebase_image_path)
          `, { count: 'exact' });
        
        // Filtrer selon l'onglet actif
        if (activeTab === 'pending') {
          query = query.eq('status', 'pending');
        } else if (activeTab === 'rejected') {
          query = query.eq('status', 'rejected');
        } else if (activeTab === 'approved') {
          query = query.in('status', ['approved', 'approved_auto']);
        }
        
        // Appliquer le tri
        if (sortOrder === 'newest') {
          query = query.order('creation_date', { ascending: false });
        } else {
          query = query.order('creation_date', { ascending: true });
        }
        
        // Exécuter la requête
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Stocker tous les résultats pour les filtrer côté client
        setAllReviews(data || []);
        setTotalCount(count || 0);
        
      } catch (err) {
        console.error("Erreur lors de la récupération des avis:", err);
        setError(`Impossible de charger les avis ${activeTab === 'pending' ? 'en attente' : activeTab === 'rejected' ? 'rejetés' : 'approuvés'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [currentUser, userDetails, sortOrder, activeTab]);
  
  // Filtrer les avis côté client
  useEffect(() => {
    if (!allReviews.length) return;
    
    // Appliquer les filtres côté client
    let filteredData = [...allReviews];
    
    // Filtre par vérification
    if (filter === 'verified') {
      filteredData = filteredData.filter(review => review.is_verified === true);
    } else if (filter === 'unverified') {
      filteredData = filteredData.filter(review => review.is_verified === false);
    }
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(review => 
        review.product_code.includes(lowerSearchTerm) ||
        review.users.display_name.toLowerCase().includes(lowerSearchTerm) ||
        review.users.email.toLowerCase().includes(lowerSearchTerm) ||
        review.comment.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setReviews(filteredData);
    
  }, [allReviews, filter, searchTerm]);
  
  // Fonction pour approuver un avis
  const handleApproveReview = async (reviewId) => {
    setProcessingIds(prev => ({ ...prev, [reviewId]: 'approving' }));
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          status: 'approved',
          modification_date: new Date().toISOString()
        })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Mettre à jour l'état des avis
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setTotalCount(prev => prev - 1);
      
    } catch (err) {
      console.error("Erreur lors de l'approbation de l'avis:", err);
      setError("Erreur lors de l'approbation de l'avis. Veuillez réessayer.");
    } finally {
      setProcessingIds(prev => ({ ...prev, [reviewId]: null }));
    }
  };
  
  // Fonction pour rejeter un avis
  const handleRejectReview = async (reviewId) => {
    setProcessingIds(prev => ({ ...prev, [reviewId]: 'rejecting' }));
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          status: 'rejected',
          modification_date: new Date().toISOString()
        })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Mettre à jour l'état des avis
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setTotalCount(prev => prev - 1);
      
    } catch (err) {
      console.error("Erreur lors du rejet de l'avis:", err);
      setError("Erreur lors du rejet de l'avis. Veuillez réessayer.");
    } finally {
      setProcessingIds(prev => ({ ...prev, [reviewId]: null }));
    }
  };
  
  // Fonction pour annuler un avis (remettre en attente)
  const handlePendingReview = async (reviewId) => {
    setProcessingIds(prev => ({ ...prev, [reviewId]: 'pending' }));
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          status: 'pending',
          modification_date: new Date().toISOString()
        })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Mettre à jour l'état des avis
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setTotalCount(prev => prev - 1);
      
    } catch (err) {
      console.error("Erreur lors de la remise en attente de l'avis:", err);
      setError("Erreur lors de la remise en attente de l'avis. Veuillez réessayer.");
    } finally {
      setProcessingIds(prev => ({ ...prev, [reviewId]: null }));
    }
  };
  
  // Fonction pour afficher l'image du ticket de caisse
  const handleViewReceipt = async (reviewId) => {
    try {
      // Récupérer l'ID du ticket de l'avis
      const { data: reviewData, error: reviewError } = await supabase
        .from('product_reviews')
        .select('receipt_id')
        .eq('id', reviewId)
        .single();
        
      if (reviewError) throw reviewError;
      
      if (!reviewData.receipt_id) {
        setError("Cet avis n'a pas de ticket de caisse associé");
        return;
      }
      
      // Récupérer l'URL du ticket
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .select('firebase_url')
        .eq('id', reviewData.receipt_id)
        .single();
        
      if (receiptError) throw receiptError;
      
      // Ouvrir la modal avec l'image
      setReceiptModalData(receiptData.firebase_url);
      
    } catch (err) {
      console.error("Erreur lors de la récupération du ticket:", err);
      setError("Impossible d'afficher le ticket de caisse");
    }
  };
  
  // Fonction pour formater les notes par critère
  const formatRatings = (review) => {
    if (!review.review_ratings || !review.review_criterias) return null;
    
    // Grouper les notes par critère
    const ratingsMap = {};
    review.review_ratings.forEach(rating => {
      const criteria = review.review_criterias.find(c => c.id === rating.criteria_id);
      if (criteria) {
        ratingsMap[criteria.name] = {
          rating: rating.rating,
          display_name: criteria.display_name,
          weight: criteria.weight
        };
      }
    });
    
    return ratingsMap;
  };
  
  // Fonction pour afficher les étoiles
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
  
  // Fonction pour obtenir le texte du titre en fonction de l'onglet actif
  const getTabTitle = () => {
    switch(activeTab) {
      case 'pending': return 'Avis en attente';
      case 'rejected': return 'Avis rejetés';
      case 'approved': return 'Avis approuvés';
      case 'approved_auto': return 'Avis approuvés auto';
      default: return 'Gestion des avis';
    }
  };
  
  // Fonction pour basculer l'affichage des filtres sur mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <ProfileLayout title={getTabTitle()}>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-center">
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
      ) : (
        <div>
          {/* Navigation entre les pages d'administration - Adapté mobile */}
          <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Link to="/admin" className="whitespace-nowrap px-3 md:px-4 py-2 text-gray-600 hover:text-green-600 text-sm md:text-base">
              <Users className="inline-block mr-1 md:mr-2" size={16} />
              <span className="hidden sm:inline">Utilisateurs</span>
              <span className="inline sm:hidden">Users</span>
            </Link>
            
            <div className="whitespace-nowrap px-3 md:px-4 py-2 text-green-600 border-b-2 border-green-600 text-sm md:text-base">
              <MessageSquare className="inline-block mr-1 md:mr-2" size={16} />
              <span className="hidden sm:inline">Avis à valider</span>
              <span className="inline sm:hidden">Avis</span>
            </div>
          </div>
          
          {/* Onglets pour filtrer par statut d'avis - Design responsive */}
          <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 md:space-x-4">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${activeTab === 'pending' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-600 hover:text-green-600'}`}
              >
                En attente
              </button>
              <button 
                onClick={() => setActiveTab('rejected')}
                className={`px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${activeTab === 'rejected' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-600 hover:text-green-600'}`}
              >
                Rejetés
              </button>
              <button 
                onClick={() => setActiveTab('approved')}
                className={`px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${activeTab === 'approved' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-600 hover:text-green-600'}`}
              >
                Approuvés
              </button>
            </div>
            
            {/* Bouton pour afficher/masquer les filtres sur mobile */}
            <button 
              onClick={toggleFilters}
              className="md:hidden px-2 py-1 text-gray-600 hover:text-green-600 border border-gray-300 rounded-md"
            >
              <Filter size={16} />
            </button>
          </div>
          
          {/* Filtres et recherche - Design responsive */}
          <div className={`mb-4 md:mb-6 ${showFilters || window.innerWidth >= 768 ? 'block' : 'hidden'}`}>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Rechercher dans les avis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center bg-white rounded-md border border-gray-300 px-2 md:px-3">
                  <select 
                    className="bg-transparent border-0 focus:outline-none py-2 text-xs md:text-sm text-gray-700 w-full"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Tous les avis</option>
                    <option value="verified">Vérifiés uniquement</option>
                    <option value="unverified">Non vérifiés uniquement</option>
                  </select>
                </div>
                
                <div className="flex items-center bg-white rounded-md border border-gray-300 px-2 md:px-3">
                  <select 
                    className="bg-transparent border-0 focus:outline-none py-2 text-xs md:text-sm text-gray-700 w-full"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Plus récents d'abord</option>
                    <option value="oldest">Plus anciens d'abord</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Compteur - Responsive */}
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <p className="text-xs md:text-sm text-gray-600">
              {totalCount} {totalCount > 1 ? `avis ${activeTab === 'pending' ? 'en attente' : activeTab === 'rejected' ? 'rejetés' : 'approuvés'}` : `avis ${activeTab === 'pending' ? 'en attente' : activeTab === 'rejected' ? 'rejeté' : 'approuvé'}`}
              {searchTerm && ` • ${reviews.length} résultat${reviews.length > 1 ? 's' : ''}`}
            </p>
          </div>
          
          {/* Liste des avis - Design responsive */}
          {reviews.length === 0 ? (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
                {activeTab === 'pending' && "Aucun avis en attente"}
                {activeTab === 'rejected' && "Aucun avis rejeté"}
                {activeTab === 'approved' && "Aucun avis approuvé"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchTerm || filter !== 'all' 
                  ? "Aucun avis ne correspond à vos critères." 
                  : activeTab === 'pending'
                    ? "Tous les avis ont été traités. Revenez plus tard !"
                    : activeTab === 'rejected'
                      ? "Aucun avis n'a été rejeté pour le moment."
                      : "Aucun avis n'a été approuvé pour le moment."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {reviews.map((review) => {
                const ratingsMap = formatRatings(review);
                const isExpanded = expandedId === review.id;
                
                return (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 md:p-4">
                      {/* En-tête avec informations sur l'utilisateur et le produit - Version responsive */}
                      <div className="flex flex-col md:flex-row md:justify-between mb-3 md:mb-4">
                        <div className="mb-2 md:mb-0">
                          <h3 className="font-medium text-sm md:text-base">
                            <span className="text-green-600">{review.users.display_name}</span> 
                            <span className="text-xs text-gray-500 ml-1">{review.users.email}</span>
                          </h3>
                          
                          {/* Ajout des informations produit avec image */}
                          <div className="flex items-center mt-2 space-x-2">
                            {(review.products?.image_url || review.products?.firebase_image_path) && (
                              <img 
                                src={review.products?.image_url || review.products?.firebase_image_path}
                                alt={review.products?.product_name || "Produit"}
                                className="w-10 h-10 object-contain border border-gray-200 rounded bg-white"
                              />
                            )}
                            <div>
                              <p className="text-xs md:text-sm font-medium">
                                {review.products?.product_name || "Nom du produit non disponible"}
                              </p>
                              <div className="flex flex-wrap items-center text-xs">
                                <span className="text-gray-600 mr-2">{review.products?.brands || ""}</span>
                                <span className="text-xs font-mono text-gray-500">{review.product_code}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2">
                            <span className="flex items-center mr-2">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(review.creation_date)}
                            </span>
                            {review.is_verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                                <CheckCircle size={10} className="mr-0.5" />
                                Vérifié
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Boutons d'action - Disposition verticale sur mobile */}
                        <div className="flex flex-wrap gap-1 md:gap-2 mt-2 md:mt-0">
                          {activeTab === 'pending' && (
                            <>
                              {/* Bouton pour approuver */}
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'approving' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <Check size={12} className="mr-1" />
                                )}
                                Approuver
                              </button>
                              
                              {/* Bouton pour rejeter */}
                              <button
                                onClick={() => handleRejectReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'rejecting' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <X size={12} className="mr-1" />
                                )}
                                Rejeter
                              </button>
                            </>
                          )}
                          
                          {activeTab === 'rejected' && (
                            <>
                              {/* Bouton pour approuver un avis rejeté */}
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'approving' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <Check size={12} className="mr-1" />
                                )}
                                Approuver
                              </button>
                              
                              {/* Bouton pour remettre en attente */}
                              <button
                                onClick={() => handlePendingReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'pending' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <MessageSquare size={12} className="mr-1" />
                                )}
                                En attente
                              </button>
                            </>
                          )}
                          
                          {activeTab === 'approved' && (
                            <>
                              {/* Bouton pour rejeter un avis approuvé */}
                              <button
                                onClick={() => handleRejectReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'rejecting' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <X size={12} className="mr-1" />
                                )}
                                Rejeter
                              </button>
                              
                              {/* Bouton pour remettre en attente */}
                              <button
                                onClick={() => handlePendingReview(review.id)}
                                className="px-2 md:px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-xs md:text-sm"
                                disabled={processingIds[review.id]}
                              >
                                {processingIds[review.id] === 'pending' ? (
                                  <Loader size={12} className="animate-spin mr-1" />
                                ) : (
                                  <MessageSquare size={12} className="mr-1" />
                                )}
                                En attente
                              </button>
                            </>
                          )}
                          
                          {/* Bouton pour développer/réduire */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : review.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                            aria-label={isExpanded ? "Réduire" : "Développer"}
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenu de l'avis (visible par défaut) - Responsive */}
                      <div>
                        <div className="flex items-center mb-2">
                          {renderStars(review.average_rating)}
                          <span className="ml-2 font-medium text-sm">{review.average_rating?.toFixed(1) || '0.0'}/5</span>
                        </div>
                        
                        <p className="bg-gray-50 p-2 md:p-3 rounded-md text-gray-700 text-sm md:text-base">{review.comment}</p>
                      </div>
                      
                      {/* Détails de l'avis (visibles uniquement si développé) - Design responsive */}
                      {isExpanded && ratingsMap && (
                        <div className="mt-3 md:mt-4 border-t border-gray-100 pt-3 md:pt-4">
                          <h4 className="font-medium mb-2 text-sm md:text-base">Détails des notes</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 md:mb-4">
                            {Object.entries(ratingsMap).map(([key, value]) => (
                              <div key={key} className="flex items-center">
                                <span className="text-xs md:text-sm text-gray-600 w-20 md:w-24">{value.display_name}:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={12} 
                                      className={`${star <= value.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                                    />
                                  ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-500">({value.weight})</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Informations d'achat - Version responsive */}
                          {(review.purchase_date || review.purchase_price || review.store_name) && (
                            <div className="mb-3 md:mb-4">
                              <h4 className="font-medium mb-2 text-sm md:text-base">Informations d'achat</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {review.purchase_date && (
                                  <div className="text-xs md:text-sm">
                                    <span className="text-gray-600">Date:</span> {formatDate(review.purchase_date)}
                                  </div>
                                )}
                                {review.purchase_price && (
                                  <div className="text-xs md:text-sm">
                                    <span className="text-gray-600">Prix:</span> {review.purchase_price}€
                                  </div>
                                )}
                                {review.store_name && (
                                  <div className="text-xs md:text-sm">
                                    <span className="text-gray-600">Magasin:</span> {review.store_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Actions - Version mobile */}
                          <div className="flex flex-wrap gap-3 mt-3">
                            {/* Bouton pour voir le ticket de caisse */}
                            {review.receipt_id && (
                              <button
                                onClick={() => handleViewReceipt(review.id)}
                                className="text-xs md:text-sm text-green-600 hover:text-green-800 flex items-center"
                              >
                                <ShoppingBag size={14} className="mr-1" />
                                Voir le ticket
                              </button>
                            )}
                            
                          {/* Bouton pour voir le produit avec plus d'infos */}
                            <Link
                              to={`/recherche-filtre?barcode=${review.product_code}`}
                              className="inline-flex items-center px-2 py-1 text-xs md:text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                              target="_blank"
                            >
                              Consulter la fiche produit <ExternalLink size={12} className="ml-1" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Modal pour afficher l'image du ticket de caisse - Version responsive */}
          {receiptModalData && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-2 md:p-4">
              <div className="bg-white rounded-lg max-w-xl w-full p-3 md:p-4 mx-auto">
                <div className="flex justify-between items-center mb-2 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold">Ticket de caisse</h3>
                  <button
                    onClick={() => setReceiptModalData(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>
                <div className="bg-gray-100 rounded-lg p-1 md:p-2 flex justify-center">
                  <img
                    src={receiptModalData}
                    alt="Ticket de caisse"
                    className="max-h-[70vh] object-contain"
                  />
                </div>
                <div className="mt-3 md:mt-4 text-center">
                  <button
                    onClick={() => setReceiptModalData(null)}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  );
};

export default PendingReviews;