// src/components/product/SearchTabs.js
import React from 'react';
import { Barcode, Search } from 'lucide-react';

/**
 * Composant pour afficher les onglets de recherche
 */
const SearchTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="flex">
        <button
          onClick={() => onTabChange('barcode')}
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
            activeTab === 'barcode' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Barcode size={20} />
          <span>Recherche par code-barres</span>
        </button>
        <button
          onClick={() => onTabChange('name')}
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
            activeTab === 'name' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search size={20} />
          <span>Recherche par nom</span>
        </button>
      </div>
    </div>
  );
};

export default SearchTabs;