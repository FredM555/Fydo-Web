// src/components/AdvancedSearchFilters.js
import React, { useState } from 'react';
import { X, Plus, Filter } from 'lucide-react';

const AdvancedSearchFilters = ({ onApplyFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [withIngredients, setWithIngredients] = useState([]);
  const [withoutIngredients, setWithoutIngredients] = useState([]);
  const [newWithIngredient, setNewWithIngredient] = useState('');
  const [newWithoutIngredient, setNewWithoutIngredient] = useState('');

  // Gestion des ingrédients à inclure
  const addWithIngredient = () => {
    if (newWithIngredient.trim() !== '' && !withIngredients.includes(newWithIngredient.trim().toLowerCase())) {
      setWithIngredients([...withIngredients, newWithIngredient.trim().toLowerCase()]);
      setNewWithIngredient('');
    }
  };

  const removeWithIngredient = (ingredient) => {
    setWithIngredients(withIngredients.filter(item => item !== ingredient));
  };

  // Gestion des ingrédients à exclure
  const addWithoutIngredient = () => {
    if (newWithoutIngredient.trim() !== '' && !withoutIngredients.includes(newWithoutIngredient.trim().toLowerCase())) {
      setWithoutIngredients([...withoutIngredients, newWithoutIngredient.trim().toLowerCase()]);
      setNewWithoutIngredient('');
    }
  };

  const removeWithoutIngredient = (ingredient) => {
    setWithoutIngredients(withoutIngredients.filter(item => item !== ingredient));
  };

  // Gestion de l'appui sur Entrée dans les champs de texte
  const handleKeyDown = (e, addFunction) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFunction();
    }
  };

// Fonction d'application des filtres
const applyFilters = () => {
  // Débogage pour vérifier les valeurs avant envoi
  console.log("applyFilters: Application des filtres:", {
    withIngredients,
    withoutIngredients
  });
  
  // Faire une copie des tableaux pour éviter les problèmes de référence
  onApplyFilters({
    withIngredients: [...withIngredients],
    withoutIngredients: [...withoutIngredients]
  });
};

  const resetFilters = () => {
    setWithIngredients([]);
    setWithoutIngredients([]);
    onApplyFilters({
      withIngredients: [],
      withoutIngredients: []
    });
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center text-green-700 mb-2 hover:text-green-800"
      >
        <Filter size={16} className="mr-1" />
        <span>{showFilters ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}</span>
      </button>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-green-800">Filtres avancés</h3>

          {/* Ingrédients à inclure */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">AVEC ces ingrédients :</label>
            <div className="flex mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: céleri, tomate, etc."
                value={newWithIngredient}
                onChange={(e) => setNewWithIngredient(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addWithIngredient)}
              />
              <button
                onClick={addWithIngredient}
                className="bg-green-600 text-white rounded-r-md px-3 hover:bg-green-700 focus:outline-none"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {withIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {withIngredients.map((ingredient) => (
                  <div key={ingredient} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                    <span>{ingredient}</span>
                    <button onClick={() => removeWithIngredient(ingredient)} className="ml-2 focus:outline-none">
                      <X size={14} className="text-green-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ingrédients à exclure */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">SANS ces ingrédients :</label>
            <div className="flex mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: gluten, lactose, etc."
                value={newWithoutIngredient}
                onChange={(e) => setNewWithoutIngredient(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addWithoutIngredient)}
              />
              <button
                onClick={addWithoutIngredient}
                className="bg-red-600 text-white rounded-r-md px-3 hover:bg-red-700 focus:outline-none"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {withoutIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {withoutIngredients.map((ingredient) => (
                  <div key={ingredient} className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center">
                    <span>{ingredient}</span>
                    <button onClick={() => removeWithoutIngredient(ingredient)} className="ml-2 focus:outline-none">
                      <X size={14} className="text-red-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'application */}
          <div className="flex space-x-2 justify-end">
            <button
              onClick={resetFilters}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Réinitialiser
            </button>
            <button
              onClick={applyFilters}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;