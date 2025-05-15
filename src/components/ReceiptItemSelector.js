// src/components/ReceiptItemSelector.js
import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Trash, ShoppingCart, Plus } from 'lucide-react';

/**
 * Composant permettant d'afficher et de sélectionner les articles du ticket de caisse
 * avec possibilité d'édition des informations détectées par l'IA
 */
const ReceiptItemSelector = ({ items = [], onChange, selectedItem, onSelect }) => {
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
    </div>
  );
};

export default ReceiptItemSelector;