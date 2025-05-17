// src/components/ReceiptItemSelector.js
import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Trash, ShoppingCart, Plus, Star } from 'lucide-react';
import { calculateMatchScore } from '../utils/textSimilarityUtils';
import { updateReceiptItem, deleteReceiptItem } from '../services/receiptAnalysisService';
import { supabase } from '../supabaseClient';

/**
 * Composant permettant d'afficher et de sélectionner les articles du ticket de caisse
 * avec possibilité d'édition des informations détectées
 * @param {Array} items - Liste des articles du ticket
 * @param {Function} onChange - Fonction appelée lorsque les articles sont modifiés
 * @param {Object} selectedItem - Article actuellement sélectionné
 * @param {Function} onSelect - Fonction appelée lorsqu'un article est sélectionné
 * @param {string} productName - Nom du produit pour calculer le taux de correspondance
 */
const ReceiptItemSelector = ({ items = [], onChange, selectedItem, onSelect, productName }) => {
  // État local pour gérer l'article en cours d'édition
  const [editingItemId, setEditingItemId] = useState(null);
  // État local pour stocker les valeurs modifiées pendant l'édition
  const [editValues, setEditValues] = useState({});
  // État local pour gérer les articles
  const [receiptItems, setReceiptItems] = useState([]);
  // Nouvel état pour désactiver temporairement la sélection
  const [selectionDisabled, setSelectionDisabled] = useState(false);
  // Nouvel état pour suivre les articles déjà liés à des avis
  const [linkedItems, setLinkedItems] = useState({});

  // Mettre à jour les articles quand ils changent via les props
  useEffect(() => {
    console.log("📥 Mise à jour des articles dans ReceiptItemSelector:", items.length);
    
    // Ajouter les scores de correspondance à chaque article si un nom de produit est fourni
    if (productName) {
      const itemsWithScores = items.map(item => ({
        ...item,
        matchScore: item.matchScore || calculateMatchScore(item.designation || '', productName)
      }));
      
      // Trier par score de correspondance décroissant
      itemsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setReceiptItems(itemsWithScores);
    } else {
      setReceiptItems(items);
    }

    // Vérifier si des articles sont déjà liés à des avis
    if (items.length > 0 && items[0].receipt_id) {
      fetchLinkedItems(items[0].receipt_id);
    }
  }, [items, productName]);

  // Fonction pour récupérer les articles déjà liés à des avis
  const fetchLinkedItems = async (receiptId) => {
    try {
      // Récupérer les avis qui référencent ce ticket
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('receipt_item_id')
        .eq('receipt_id', receiptId);
      
      if (error) throw error;
      
      // Créer un objet indexé par ID d'article
      const linkedItemsMap = {};
      reviews.forEach(review => {
        if (review.receipt_item_id) {
          linkedItemsMap[review.receipt_item_id] = true;
        }
      });
      
      setLinkedItems(linkedItemsMap);
      console.log("🔗 Articles liés récupérés:", linkedItemsMap);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des articles liés:", err);
    }
  };

  // Sélection automatique du meilleur article
  useEffect(() => {
    // Ne faire la sélection automatique que si:
    // 1. Il y a des articles
    // 2. Un nom de produit est fourni (pour calculer les scores)
    // 3. Aucun article n'est déjà sélectionné
    // 4. Aucune édition n'est en cours
    if (receiptItems.length > 0 && productName && !selectedItem && !editingItemId) {
      console.log("🔍 Recherche de l'article avec la meilleure correspondance...");
      
      // Les articles sont déjà triés par score dans l'useEffect précédent
      // Donc le premier article a le meilleur score
      const bestMatch = receiptItems[0];
      
      // Vérifier si le score est suffisant (par exemple > 0.2 soit 20%)
      if (bestMatch && bestMatch.matchScore > 0.2) {
        console.log(`✅ Sélection automatique: ${bestMatch.designation} (${Math.round(bestMatch.matchScore * 100)}%)`);
        // Sélectionner cet article
        if (onSelect) {
          onSelect(bestMatch);
        }
      } else {
        console.log("⚠️ Aucun article n'a un score suffisant pour la sélection automatique");
      }
    } 
  }, [receiptItems, productName, selectedItem, onSelect, editingItemId]);

  // Démarrer l'édition d'un article
  const startEditing = (item) => {
    // Désactiver la sélection pendant l'édition
    setSelectionDisabled(true);
    setEditingItemId(item.id);
    setEditValues({
      designation: item.designation,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      prix_total: item.prix_total,
      receipt_id: item.receipt_id // Important pour les nouvelles insertions
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditValues({});
    // Réactiver la sélection après l'édition
    setTimeout(() => setSelectionDisabled(false), 100);
  };

  // Sauvegarder les modifications
  const saveEditing = async (itemId) => {
    const updatedItems = receiptItems.map(item => {
      if (item.id === itemId) {
        // Calculer automatiquement le prix total si nécessaire
        const quantite = parseFloat(editValues.quantite) || item.quantite;
        const prixUnitaire = parseFloat(editValues.prix_unitaire) || item.prix_unitaire;
        const prixTotal = parseFloat(editValues.prix_total) || (quantite * prixUnitaire);
        
        const updatedItem = {
          ...item,
          designation: editValues.designation || item.designation,
          quantite: quantite,
          prix_unitaire: prixUnitaire,
          prix_total: prixTotal
        };
        
        // Mettre à jour le score de correspondance si productName est disponible
        if (productName) {
          updatedItem.matchScore = calculateMatchScore(updatedItem.designation, productName);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setReceiptItems(updatedItems);
    setEditingItemId(null);
    setEditValues({});
    
    // Persister les modifications dans la base de données
    if (itemId) {
      try {
        console.log("💾 Enregistrement des modifications pour l'article:", itemId);
        const result = await updateReceiptItem(itemId, {
          ...editValues,
          receipt_id: editValues.receipt_id // Nécessaire pour les nouvelles insertions
        });
        
        if (result.success) {
          console.log("✅ Article mis à jour avec succès:", result.item);
          
          // Si c'est un nouvel article inséré, mettre à jour l'ID dans le tableau local
          if (result.action === 'inserted' && result.item.id) {
            const finalUpdatedItems = updatedItems.map(item => 
              item.id === itemId ? { ...item, id: result.item.id } : item
            );
            setReceiptItems(finalUpdatedItems);
            
            // Notifier le parent des changements
            if (onChange) {
              onChange(finalUpdatedItems);
            }
            
            // Réactiver la sélection après l'édition
            setTimeout(() => setSelectionDisabled(false), 100);
            return;
          }
        } else {
          console.error("❌ Erreur lors de la mise à jour de l'article:", result.error);
        }
      } catch (error) {
        console.error("❌ Erreur critique lors de la mise à jour:", error);
      }
    }
    
    // Notifier le parent des changements
    if (onChange) {
      onChange(updatedItems);
    }
    
    // Réactiver la sélection après l'édition
    setTimeout(() => setSelectionDisabled(false), 100);
  };

  // Gérer les changements dans les champs d'édition
  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mise à jour automatique du prix total si quantité ou prix unitaire changent
    if (field === 'quantite' || field === 'prix_unitaire') {
      const quantite = field === 'quantite' 
        ? parseFloat(value) || 0 
        : parseFloat(editValues.quantite) || 0;
        
      const prixUnitaire = field === 'prix_unitaire' 
        ? parseFloat(value) || 0 
        : parseFloat(editValues.prix_unitaire) || 0;
        
      const prixTotal = (quantite * prixUnitaire).toFixed(2);
      
      setEditValues(prev => ({
        ...prev,
        prix_total: prixTotal
      }));
    }
  };

  // Supprimer un article
  const deleteItem = async (itemId) => {
    // Désactiver la sélection pendant la suppression
    setSelectionDisabled(true);
    
    try {
      console.log("🗑️ Suppression de l'article:", itemId);
      
      // Supprimer l'article de la base de données
      const result = await deleteReceiptItem(itemId);
      
      if (!result.success) {
        console.error("❌ Erreur lors de la suppression de l'article:", result.error);
      }
    } catch (error) {
      console.error("❌ Erreur critique lors de la suppression:", error);
    }
    
    // Mettre à jour l'état local, même en cas d'erreur de la base de données
    const updatedItems = receiptItems.filter(item => item.id !== itemId);
    setReceiptItems(updatedItems);
    
    // Notifier le parent des changements
    if (onChange) {
      onChange(updatedItems);
    }
    
    // Réactiver la sélection après la suppression
    setTimeout(() => setSelectionDisabled(false), 100);
  };

  // Ajouter un nouvel article
  const addNewItem = () => {
    // Désactiver la sélection avant d'ajouter un nouvel article
    setSelectionDisabled(true);
    
    // Trouver l'ID du ticket à partir des articles existants
    const receiptId = receiptItems.length > 0 ? receiptItems[0].receipt_id : null;
    
    if (!receiptId) {
      console.error("❌ Impossible d'ajouter un article: ID de ticket introuvable");
      setSelectionDisabled(false);
      return;
    }
    
    const newItemId = `temp-${Date.now()}`;
    const newItem = {
      id: newItemId,
      receipt_id: receiptId, // Important pour l'insertion en base de données
      designation: "Nouvel article",
      quantite: 1,
      prix_unitaire: 0,
      prix_total: 0,
      matchScore: productName ? calculateMatchScore("Nouvel article", productName) : 0
    };
    
    const updatedItems = [...receiptItems, newItem];
    setReceiptItems(updatedItems);
    
    // Commencer l'édition du nouvel article
    startEditing(newItem);
    
    // Notifier le parent des changements
    if (onChange) {
      onChange(updatedItems);
    }
  };

  // Sélectionner un article (seulement s'il n'est pas déjà lié)
  const handleSelectItem = (item) => {
    // Ne sélectionner que si la sélection n'est pas désactivée, 
    // qu'aucune édition n'est en cours, et que l'article n'est pas déjà lié
    if (!selectionDisabled && editingItemId === null && onSelect && !linkedItems[item.id]) {
      onSelect(item);
    }
  };

  // Obtenir la classe CSS pour le badge du taux de correspondance
  const getMatchScoreClass = (score) => {
    if (score >= 0.7) return "bg-green-100 text-green-800";
    if (score >= 0.5) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Obtenir le style de la ligne en fonction de l'état de sélection et de liaison
  const getRowStyle = (item) => {
    if (linkedItems[item.id]) {
      return "bg-gray-100 opacity-70"; // Article déjà lié - non sélectionnable
    }
    
    if (selectedItem && selectedItem.id === item.id) {
      return "bg-green-50 hover:bg-green-100 cursor-pointer"; // Article sélectionné
    }
    
    return "hover:bg-gray-50 cursor-pointer"; // Article normal
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-800">
          Articles du ticket ({receiptItems.length})
          {receiptItems.length > 7 && 
            <span className="text-xs text-gray-500 ml-2">
              (Faites défiler pour voir tous les articles)
            </span>
          }
        </h4>
        <button
          type="button"
          onClick={addNewItem}
          className="flex items-center text-sm text-green-600 hover:text-green-800"
          disabled={!receiptItems.some(item => item.receipt_id)}
        >
          <Plus size={16} className="mr-1" />
          Ajouter un article
        </button>
      </div>
      
      {receiptItems.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Aucun article détecté sur ce ticket</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[600px] border border-gray-200 rounded-md" style={{ scrollbarWidth: 'none' }}>
          <style jsx="true">{`
            /* Masquer la barre de défilement pour tous les navigateurs */
            div::-webkit-scrollbar {
              display: none;
            }
            div {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-7/12">
                  Désignation
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Prix
                </th>
                {productName && (
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Match
                  </th>
                )}
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptItems.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={`${getRowStyle(item)} transition-colors`}
                  onClick={() => handleSelectItem(item)}
                >
                  {editingItemId === item.id ? (
                    // Mode édition
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editValues.designation || ''}
                          onChange={(e) => handleEditChange('designation', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">Qté:</span>
                            <input
                              type="number"
                              value={editValues.quantite || ''}
                              onChange={(e) => handleEditChange('quantite', e.target.value)}
                              className="w-12 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                              step="0.01"
                              min="0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">Prix:</span>
                            <input
                              type="number"
                              value={editValues.prix_unitaire || ''}
                              onChange={(e) => handleEditChange('prix_unitaire', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                              step="0.01"
                              min="0"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="ml-1">€</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">Total:</span>
                            <input
                              type="number"
                              value={editValues.prix_total || ''}
                              onChange={(e) => handleEditChange('prix_total', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                              step="0.01"
                              min="0"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="ml-1">€</span>
                          </div>
                        </div>
                      </td>
                      {productName && <td className="px-3 py-2"></td>}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              saveEditing(item.id); 
                            }}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              cancelEditing(); 
                            }}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Mode affichage
                   <>
                    <td className="px-3 py-2 text-sm text-gray-800 flex items-center">
                      {linkedItems[item.id] && (
                        <div className="mr-2 bg-blue-100 text-blue-800 rounded-full p-1" title="Article déjà associé à un avis">
                          <Star size={12} className="fill-blue-800" />
                        </div>
                      )}
                      <span className={linkedItems[item.id] ? "line-through text-gray-500" : ""}>
                        {item.designation || 'Sans nom'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-center text-gray-800 font-medium">
                      {(item.prix_unitaire || 0).toFixed(2)} €
                    </td>
                    {productName && (
                      <td className="px-3 py-2 text-sm text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getMatchScoreClass(item.matchScore || 0)}`}>
                          {Math.round((item.matchScore || 0) * 100)}%
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(item);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          disabled={linkedItems[item.id]}
                          title={linkedItems[item.id] ? "Cet article est déjà associé à un avis" : "Modifier"}
                        >
                          <Edit size={16} className={linkedItems[item.id] ? "opacity-50" : ""} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          disabled={linkedItems[item.id]}
                          title={linkedItems[item.id] ? "Cet article est déjà associé à un avis" : "Supprimer"}
                        >
                          <Trash size={16} className={linkedItems[item.id] ? "opacity-50" : ""} />
                        </button>
                      </div>
                    </td>
                  </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-2 text-right text-xs text-gray-500 italic">
        Cliquez sur un article pour le sélectionner, ou sur les icônes pour modifier ou supprimer
      </div>
    </div>
  );
};

export default ReceiptItemSelector;