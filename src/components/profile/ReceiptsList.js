// src/components/profile/ReceiptsList.js - Version complète avec design amélioré
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserReceipts, deleteReceipt } from '../../services/storageService';
import ProfileLayout from './ProfileLayout';
import { Receipt, Calendar, AlertCircle, Trash2, ExternalLink, Loader, Image, ShoppingBag, Search, AlertTriangle, DollarSign, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

/**
 * Composant pour afficher et gérer les tickets de caisse de l'utilisateur
 * @returns {JSX.Element}
 */
const ReceiptsList = () => {
  const { currentUser, userDetails } = useAuth();
  
  // États pour gérer les tickets et l'interface
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [deletingReceipt, setDeletingReceipt] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [expandedReceipt, setExpandedReceipt] = useState({});
  const [loadingReviewCheck, setLoadingReviewCheck] = useState({});
  const [receiptReviewStatus, setReceiptReviewStatus] = useState({});
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'used', 'unused'
  
  // Chargement des tickets de l'utilisateur
  useEffect(() => {
    if (!currentUser || !userDetails) return;
    
    const fetchUserReceipts = async () => {
      setLoading(true);
      
      try {
        const { success, receipts: fetchedReceipts, total, error: fetchError } = 
          await getUserReceipts(userDetails.id, 10, offset);
        
        if (success) {
          setReceipts(prev => offset === 0 ? fetchedReceipts : [...prev, ...fetchedReceipts]);
          setTotalReceipts(total);
          setHasMore(offset + fetchedReceipts.length < total);
          
          // Pour chaque ticket, vérifier s'il est associé à un avis
          fetchedReceipts.forEach(receipt => {
            checkReceiptHasReviews(receipt.id);
          });
        } else {
          setError(fetchError || "Impossible de récupérer vos tickets");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets:", err);
        setError("Une erreur est survenue lors du chargement de vos tickets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserReceipts();
  }, [currentUser, userDetails, offset]);
  
  // Vérifier si un ticket est associé à un avis
  const checkReceiptHasReviews = async (receiptId) => {
    if (loadingReviewCheck[receiptId] || receiptReviewStatus[receiptId] !== undefined) return;
    
    setLoadingReviewCheck(prev => ({ ...prev, [receiptId]: true }));
    
    try {
      // Vérifier si le ticket est lié à un avis via Supabase
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('receipt_id', receiptId)
        .limit(1);
      
      if (!error) {
        // Mettre à jour le statut (true si au moins un avis existe)
        setReceiptReviewStatus(prev => ({ 
          ...prev, 
          [receiptId]: data && data.length > 0 
        }));
      }
    } catch (err) {
      console.error("Erreur lors de la vérification des avis pour le ticket:", err);
    } finally {
      setLoadingReviewCheck(prev => ({ ...prev, [receiptId]: false }));
    }
  };
  
  // Filtrer les tickets selon le mode sélectionné
  const filteredReceipts = receipts.filter(receipt => {
    if (filterMode === 'all') return true;
    const hasReview = receiptReviewStatus[receipt.id];
    return filterMode === 'used' ? hasReview : !hasReview;
  });
  
  // Charger plus de tickets
  const loadMoreReceipts = () => {
    if (hasMore && !loading) {
      setOffset(prev => prev + 10);
    }
  };
  
  // Supprimer un ticket
  const handleDeleteReceipt = async (receipt) => {
    if (!receipt || !receipt.id) return;
    
    // Vérifier d'abord si ce ticket a des avis associés
    if (receiptReviewStatus[receipt.id]) {
      alert("Ce ticket est associé à un ou plusieurs avis et ne peut pas être supprimé.");
      return;
    }
    
    // Configurer la confirmation de suppression
    setReceiptToDelete(receipt);
    setShowConfirmModal(true);
  };
  
  // Confirmer la suppression du ticket
  const confirmDeleteReceipt = async () => {
    if (!receiptToDelete) return;
    
    setDeletingReceipt(prev => ({ ...prev, [receiptToDelete.id]: true }));
    
    try {
      const { success, error: deleteError } = await deleteReceipt(receiptToDelete.id, userDetails.id);
      
      if (success) {
        // Mettre à jour la liste locale après suppression
        setReceipts(prev => prev.filter(r => r.id !== receiptToDelete.id));
        setTotalReceipts(prev => prev - 1);
      } else {
        alert("Erreur lors de la suppression: " + (deleteError || "Une erreur est survenue"));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du ticket:", err);
      alert("Erreur lors de la suppression du ticket");
    } finally {
      setDeletingReceipt(prev => ({ ...prev, [receiptToDelete.id]: false }));
      setShowConfirmModal(false);
      setReceiptToDelete(null);
    }
  };
  
  // Annuler la suppression
  const cancelDeleteReceipt = () => {
    setShowConfirmModal(false);
    setReceiptToDelete(null);
  };
  
  // Basculer l'affichage complet d'un ticket
  const toggleReceiptExpand = (receiptId) => {
    setExpandedReceipt(prev => ({
      ...prev,
      [receiptId]: !prev[receiptId]
    }));
  };

  return (
    <ProfileLayout title="Mes tickets de caisse">
      {/* Contenu principal */}
      {loading && receipts.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader size={40} className="animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos tickets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center my-6">
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
      ) : receipts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center my-6">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun ticket de caisse</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Vous n'avez pas encore téléchargé de tickets de caisse. Les tickets vous permettent de valider vos avis sur les produits.
          </p>
          <Link 
            to="/recherche-filtre" 
            className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
          >
            <Search size={18} className="mr-2" />
            Scanner un produit
          </Link>
        </div>
      ) : (
        <div>
          {/* En-tête avec statistiques et filtres */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-green-800 text-lg flex items-center">
                  <Receipt size={18} className="mr-2 text-green-600" />
                  Mes tickets de caisse
                </h3>
                <p className="text-gray-600 mt-1 text-sm">
                  {totalReceipts} ticket{totalReceipts > 1 ? 's' : ''} enregistré{totalReceipts > 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Filtres */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-gray-500 text-sm">Filtrer:</span>
                </div>
                <div className="flex rounded-md overflow-hidden border border-gray-200">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 text-sm ${
                      filterMode === 'all' 
                        ? 'bg-green-50 text-green-700 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterMode('used')}
                    className={`px-3 py-1.5 text-sm ${
                      filterMode === 'used' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Avec avis
                  </button>
                  <button
                    onClick={() => setFilterMode('unused')}
                    className={`px-3 py-1.5 text-sm ${
                      filterMode === 'unused' 
                        ? 'bg-orange-50 text-orange-700 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Sans avis
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Liste des tickets */}
          {filteredReceipts.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center my-6 border border-gray-200">
              <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Aucun ticket ne correspond aux filtres sélectionnés</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredReceipts.map((receipt) => (
                <div key={receipt.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
                  {/* En-tête du ticket */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full mr-3">
                          <Receipt size={20} strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Ticket #{receipt.id.substring(0, 8)}
                          </h3>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(receipt.upload_date, true)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge de statut */}
                      {loadingReviewCheck[receipt.id] ? (
                        <div className="flex items-center text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-full">
                          <Loader size={10} className="animate-spin mr-1" />
                          Vérification...
                        </div>
                      ) : receiptReviewStatus[receipt.id] ? (
                        <div className="flex items-center text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                          <AlertCircle size={10} className="mr-1" />
                          Avis associé
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-700 text-xs bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                          <AlertTriangle size={10} className="mr-1" />
                          Sans avis
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Contenu principal */}
                  <div className="p-4">
                    {/* Informations détaillées */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {receipt.receipt_date && (
                        <div className="flex items-start">
                          <Calendar size={16} className="text-gray-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Date du ticket</p>
                            <p className="text-sm font-medium">{formatDate(receipt.receipt_date)}</p>
                          </div>
                        </div>
                      )}
                      
                      {receipt.total_ttc && (
                        <div className="flex items-start">
                          <DollarSign size={16} className="text-gray-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Montant total</p>
                            <p className="text-sm font-medium">{receipt.total_ttc.toFixed(2)} €</p>
                          </div>
                        </div>
                      )}
                      
                      {receipt.enseigne_id && (
                        <div className="flex items-start">
                          <ShoppingBag size={16} className="text-gray-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Magasin</p>
                            <p className="text-sm font-medium">{receipt.enseigne_name || "Non spécifié"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aperçu de l'image du ticket - Design amélioré */}
                    <div 
                      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                        expandedReceipt[receipt.id] ? 'shadow-lg' : 'shadow-sm border border-gray-200'
                      }`}
                      onClick={() => toggleReceiptExpand(receipt.id)}
                    >
                      {receipt.firebase_url ? (
                        <div className="relative">
                          {/* Image du ticket */}
                          <div className={`w-full ${expandedReceipt[receipt.id] ? 'max-h-80' : 'h-40'} bg-gradient-to-tr from-gray-50 to-white`}>
                            <img 
                              src={receipt.firebase_url} 
                              alt="Ticket de caisse" 
                              className={`w-full h-full object-contain ${expandedReceipt[receipt.id] ? '' : 'p-2'}`}
                            />
                          </div>
                          
                          {/* Overlay avec indication */}
                          <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent ${
                            expandedReceipt[receipt.id] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                          } transition-opacity duration-300`}>
                            <div className="flex justify-center items-center text-white text-sm">
                              <Image size={14} className="mr-1" strokeWidth={2.5} />
                              <span>Cliquez pour {expandedReceipt[receipt.id] ? 'réduire' : 'agrandir'}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 bg-gray-100 p-4">
                          <Receipt size={32} className="mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500 text-center">
                            Aperçu du ticket non disponible
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions - Section des boutons */}
                    <div className="flex justify-end space-x-3 mt-4">
                      {!receiptReviewStatus[receipt.id] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteReceipt(receipt); }}
                          disabled={deletingReceipt[receipt.id]}
                          className="flex items-center px-3 py-2 text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors text-sm"
                        >
                          {deletingReceipt[receipt.id] ? (
                            <Loader size={16} className="animate-spin mr-2" />
                          ) : (
                            <Trash2 size={16} className="mr-2" />
                          )}
                          Supprimer
                        </button>
                      )}
                      
                      <Link
                        to={`/recherche-filtre?receipt=${receipt.id}`}
                        className="flex items-center px-3 py-2 text-green-700 bg-green-50 border border-green-100 rounded-md hover:bg-green-100 transition-colors text-sm"
                      >
                        <ShoppingBag size={16} className="mr-2" />
                        Utiliser pour un avis
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Chargement de plus de résultats */}
          {hasMore && (
            <div className="flex justify-center mb-6">
              <button
                onClick={loadMoreReceipts}
                className="flex items-center px-5 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors border border-green-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Charger plus de tickets
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-700">
              Êtes-vous sûr de vouloir supprimer ce ticket de caisse ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteReceipt}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteReceipt}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                {deletingReceipt[receiptToDelete?.id] && (
                  <Loader size={16} className="animate-spin mr-2" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default ReceiptsList;