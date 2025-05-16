// src/components/ReceiptItemSelector.js
import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Trash, ShoppingCart, Plus } from 'lucide-react';
import { calculateMatchScore } from '../utils/textSimilarityUtils';
import { updateReceiptItem, deleteReceiptItem } from '../services/receiptAnalysisService';

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
  }, [items, productName]);

  // Sélection automatique du meilleur article
  useEffect(() => {
    // Ne faire la sélection automatique que si:
    // 1. Il y a des articles
    // 2. Un nom de produit est fourni (pour calculer les scores)
    // 3. Aucun article n'est déjà sélectionné
    // 4. Aucune édition n'est en cours (nouvel état)
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

  // Sélectionner un article
  const handleSelectItem = (item) => {
    // Ne sélectionner que si la sélection n'est pas désactivée et qu'aucune édition n'est en cours
    if (!selectionDisabled && editingItemId === null && onSelect) {
      onSelect(item);
    }
  };

  // Obtenir la classe CSS pour le badge du taux de correspondance
  const getMatchScoreClass = (score) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.5) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
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
        <div className="overflow-x-auto overflow-y-auto max-h-none" style={{ minHeight: '600px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Désignation
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix total
                </th>
                {productName && (
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correspondance
                  </th>
                )}
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptItems.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={`${selectedItem && selectedItem.id === item.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
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
                        <input
                          type="number"
                          value={editValues.quantite || ''}
                          onChange={(e) => handleEditChange('quantite', e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                          step="0.01"
                          min="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={editValues.prix_unitaire || ''}
                          onChange={(e) => handleEditChange('prix_unitaire', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                          step="0.01"
                          min="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={editValues.prix_total || ''}
                          onChange={(e) => handleEditChange('prix_total', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                          step="0.01"
                          min="0"
                          onClick={(e) => e.stopPropagation()}
                        />
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
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {item.designation || 'Sans nom'}
                    </td>
                    <td className="px-3 py-2 text-sm text-center text-gray-800">
                      {item.quantite || '1'}
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-800">
                      {(item.prix_unitaire || 0).toFixed(2)} €
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-800 font-medium">
                      {(item.prix_total || 0).toFixed(2)} €
                    </td>
                    {productName && (
                      <td className="px-3 py-2 text-sm text-center">
                        {(() => {
                          const score = item.matchScore || 0;
                          const scoreClass = getMatchScoreClass(score);
                          const percentage = Math.round(score * 100);
                          return (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${scoreClass}`}>
                              {percentage}%
                            </span>
                          );
                        })()}
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
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash size={16} />
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
      {productName && (
        <div className="mt-3 text-xs text-gray-600">
          <p className="font-medium">Aide sur le taux de correspondance :</p>
          <div className="flex items-center space-x-4 mt-1">
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-green-100 mr-1"></span>
              <span>Forte (≥80%)</span>
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-yellow-100 mr-1"></span>
              <span>Moyenne (50-79%)</span>
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-gray-100 mr-1"></span>
              <span>Faible (≤49%)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptItemSelector;