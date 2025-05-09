// src/components/PageInfos.js - Version corrigée pour gérer les longs textes
import React from 'react';

const PageInfos = ({ product }) => {
  if (!product) return null;

  // Fonction pour formatter les longues listes en ajoutant des espaces après les virgules
  const formatLongList = (text) => {
    if (!text) return "";
    
    // Si c'est déjà une liste d'éléments, la retourner telle quelle
    if (Array.isArray(text)) {
      return text.join(", ");
    }
    
    // Remplacer les virgules par des virgules suivies d'un espace pour améliorer la lisibilité
    return text.replace(/,/g, ', ');
  };

  // Fonction pour formater le texte des catégories avec des retours à la ligne
  const formatCategories = (text) => {
    if (!text) return "";
    
    // Ajouter des séparateurs visuels pour segmenter la catégorie
    return text.replace(/,/g, ' | ');
  };

  return (
    <div>
      {/* En-tête avec Code EAN en haut à droite et catégorie */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4 overflow-hidden">
          {product.categories && (
            <h2 className="text-xl font-medium text-green-800 break-words">
              {formatCategories(product.categories)}
            </h2>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg whitespace-nowrap">
            {product.code}
          </span>
        </div>
      </div>

      {/* Carte d'informations avec les détails du produit */}
      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origine */}
          {product.manufacturing_places && (
            <div className="bg-white rounded-md p-3 border border-gray-100 overflow-hidden">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Lieu de production</p>
                  <p className="text-gray-700 break-words">{formatLongList(product.manufacturing_places)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Labels */}
          {product.labels && (
            <div className="bg-white rounded-md p-3 border border-gray-100 overflow-hidden">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Labels</p>
                  <p className="text-gray-700 break-words">{formatLongList(product.labels)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pays de distribution */}
          {product.countries && product.countries !== 'en:unknown' && (
            <div className="bg-white rounded-md p-3 border border-gray-100 overflow-hidden md:col-span-2">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 font-medium">Pays de distribution</p>
                  <p className="text-gray-700 break-words">
                    {Array.isArray(product.countries_hierarchy) 
                      ? formatLongList(product.countries_hierarchy.map(country => country.replace("en:", "")))
                      : formatLongList(product.countries)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Commerces où on trouve le produit */}
          {product.stores && (
            <div className="bg-white rounded-md p-3 border border-gray-100 overflow-hidden">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Disponible chez</p>
                  <p className="text-gray-700 break-words">{formatLongList(product.stores)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Si le produit a des données supplémentaires */}
        {product.serving_size || product.serving_quantity || product.net_weight || (product.product_quantity && product.product_quantity !== product.quantity) ? (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Informations complémentaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {product.serving_size && (
                <div className="bg-white p-2 rounded-md border border-gray-100 overflow-hidden">
                  <p className="text-xs text-gray-500">Portion recommandée</p>
                  <p className="font-medium truncate" title={product.serving_size}>{product.serving_size}</p>
                </div>
              )}
              
              {product.serving_quantity && (
                <div className="bg-white p-2 rounded-md border border-gray-100 overflow-hidden">
                  <p className="text-xs text-gray-500">Portion en quantité</p>
                  <p className="font-medium truncate">{product.serving_quantity} g</p>
                </div>
              )}
              
              {product.net_weight && (
                <div className="bg-white p-2 rounded-md border border-gray-100 overflow-hidden">
                  <p className="text-xs text-gray-500">Poids net</p>
                  <p className="font-medium truncate">{product.net_weight} g</p>
                </div>
              )}
              
              {product.product_quantity && product.product_quantity !== product.quantity && (
                <div className="bg-white p-2 rounded-md border border-gray-100 overflow-hidden">
                  <p className="text-xs text-gray-500">Quantité du produit</p>
                  <p className="font-medium truncate">{product.product_quantity} g</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PageInfos;