// src/components/ReceiptItemSelector.js
import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Trash, ShoppingCart, Plus } from 'lucide-react';
import { calculateMatchScore } from '../utils/textSimilarityUtils';

/**
 * Composant permettant d'afficher et de sélectionner les articles du ticket de caisse
 * avec possibilité d'édition des informations détectées par l'IA
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
  const [receiptItems, setReceiptItems] = useState(items);

  // Mettre à jour les articles quand ils changent via les props
  useEffect(() => {
    setReceiptItems(items);
  }, [items]);

  // Ajoutez ce useEffect dans le composant ReceiptItemSelector
  useEffect(() => {
    // S'assurer qu'il y a des articles et un nom de produit à comparer
    if (receiptItems.length > 0 && productName) {
      // Trouver l'article avec le meilleur taux de correspondance
      let bestMatchItem = null;
      let bestMatchScore = 0;
      
      receiptItems.forEach(item => {
        const score = getMatchScore(item.designation);
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchItem = item;
        }
      });
      
      // Sélectionner automatiquement l'article si le score est suffisamment élevé (ex: >40%)
      if (bestMatchItem && bestMatchScore > 0.1 && onSelect) {
        onSelect(bestMatchItem);
      }
    }
  }, [receiptItems, productName]); // Dépendances du useEffect

  // Ajoutez ce code dans le composant ReceiptItemSelector.js après les autres hooks
useEffect(() => {
  // S'exécuter uniquement au chargement initial des articles ou si la sélection est perdue
  if (items.length > 0 && productName && !selectedItem) {
    // Trouver l'article avec le meilleur taux de correspondance
    let bestItem = null;
    let bestScore = 0;
    
    items.forEach(item => {
      const score = calculateMatchScore(item.designation, productName);
      // Ajouter le score comme propriété de l'élément pour référence future
      item.matchScore = score;
      
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    });
    
    
    // Sélectionner automatiquement si le score est suffisant (0.2 = 20%)
    if (bestItem && bestScore > 0.2) {
      onSelect(bestItem);
      console.log(`Sélection automatique: ${bestItem.designation} (score: ${bestScore})`);
    }
  }
}, [items, productName, selectedItem, onSelect]);


  // Démarrer l'édition d'un article
  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditValues({
      designation: item.designation,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      prix_total: item.prix_total
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditValues({});
  };

  // Sauvegarder les modifications
  const saveEditing = (itemId) => {
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
        return updatedItem;
      }
      return item;
    });
    
    setReceiptItems(updatedItems);
    setEditingItemId(null);
    setEditValues({});
    
    // Notifier le parent des changements
    if (onChange) {
      onChange(updatedItems);
    }
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
  const deleteItem = (itemId) => {
    const updatedItems = receiptItems.filter(item => item.id !== itemId);
    setReceiptItems(updatedItems);
    
    // Notifier le parent des changements
    if (onChange) {
      onChange(updatedItems);
    }
  };

  // Ajouter un nouvel article
  const addNewItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`, // ID temporaire jusqu'à la sauvegarde en BDD
      designation: "Nouvel article",
      quantite: 1,
      prix_unitaire: 0,
      prix_total: 0
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
    if (onSelect) {
      onSelect(item);
    }
  };

  // Calculer le taux de correspondance entre la désignation de l'article et le nom du produit
  const getMatchScore = (designation) => {
    if (!productName || !designation) return 0;
    return calculateMatchScore(designation, productName);
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
        <h4 className="font-medium text-gray-800">Articles du ticket</h4>
        <button
          type="button"
          onClick={addNewItem}
          className="flex items-center text-sm text-green-600 hover:text-green-800"
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
        <div className="overflow-x-auto">
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
                  className={`hover:bg-gray-50 ${selectedItem && selectedItem.id === item.id ? 'bg-green-50' : ''}`}
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
                        />
                      </td>
                      {productName && <td className="px-3 py-2"></td>}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => saveEditing(item.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-900"
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
                            const score = getMatchScore(item.designation);
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
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startEditing(item); }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                            className="text-red-600 hover:text-red-900"
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