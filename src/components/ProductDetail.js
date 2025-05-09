// src/components/ProductDetail.js - Version avec l'onglet Avis en plus gros
import React, { useState, useEffect } from 'react';
import PageNutri from './PageNutri';
import PageEnvir from './PageEnvir';
import PageAvis from './PageAvisEnhanced';
import PageInfos from './PageInfos';
import FavoriteButton from './FavoriteButton';
import { findProductInDatabase, saveProductToDatabase } from '../services/productDatabaseService';

const ProductDetail = ({ product }) => {
  // État des onglets et langues
  const [activeTab, setActiveTab] = useState('avis');
  const [ingredientsLanguage, setIngredientsLanguage] = useState('fr');
  
  // États pour la synchronisation BDD
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState(null);
  
  // Effet pour synchroniser le produit avec la base de données
  useEffect(() => {
    const syncProductWithDatabase = async () => {
      if (!product || !product.code) return;
      
      try {
        // Vérifier si le produit existe déjà en base
        const { success, exists, error: findError } = await findProductInDatabase(product.code);
        
        if (findError) {
          setSyncError(`Erreur de vérification: ${findError}`);
          return;
        }
        
        if (success) {
          if (!exists) {
            const saveResult = await saveProductToDatabase(product);
            
            if (saveResult.success) {
              setIsSynced(true);
            } else {
              const errorMsg = saveResult.error || "Erreur inconnue";
              setSyncError(errorMsg);
            }
          } else {
            setIsSynced(true);
          }
        } else {
          setSyncError("Erreur de communication avec la base de données");
        }
      } catch (error) {
        setSyncError(error.message || "Exception non identifiée");
      }
    };
    
    syncProductWithDatabase();
  }, [product]);

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun produit sélectionné</p>
      </div>
    );
  }

  // Fonction pour afficher les ingrédients selon la langue choisie
  const renderIngredients = () => {
    if (ingredientsLanguage === 'fr' && product.ingredients_text_fr) {
      return product.ingredients_text_fr;
    } else if (ingredientsLanguage === 'en' && product.ingredients_text_en) {
      return product.ingredients_text_en;
    } else if (ingredientsLanguage === 'origin' && product.ingredients_text) {
      return product.ingredients_text;
    } else {
      // Fallback
      if (product.ingredients_text_fr) {
        return product.ingredients_text_fr;
      } else if (product.ingredients_text_en) {
        return product.ingredients_text_en;
      } else if (product.ingredients_text) {
        return product.ingredients_text;
      }
      return "Ingrédients non disponibles";
    }
  };

  // Style commun pour les boutons de langue
  const languageButtonStyle = (activeLanguage, currentLanguage) => 
    `px-2 py-1 rounded text-xs ${activeLanguage === currentLanguage ? 'bg-green-500 text-white' : 'bg-gray-200'}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* En-tête du produit avec les informations principales */}
      <div className="flex items-start">
        {/* Image principale du produit avec hauteur réduite */}
        <div className="mr-6 flex-shrink-0">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.product_name || 'Produit'} 
              className="max-h-32 max-w-32 object-contain" 
            />
          ) : (
            <div className="h-32 w-32 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image non disponible</span>
            </div>
          )}
          
          {/* Images supplémentaires en miniatures si disponibles */}
          {(product.images && Object.keys(product.images).length > 1) && (
            <div className="mt-2 flex flex-wrap gap-1 max-w-32 justify-center">
              {Object.keys(product.images).slice(0, 3).map((key, index) => {
                if (key !== 'front' && product.images[key] && product.images[key].display_url) {
                  return (
                    <div key={index} className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={product.images[key].display_url} 
                        alt={`Vue ${key}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
        
        {/* Informations textuelles du produit */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-2">{product.product_name || 'Nom non disponible'}</h2>
            
            {/* Bouton favori */}
            <FavoriteButton 
              productCode={product.code}
              productData={product}
              size="lg"
            />
          </div>
          
          {/* INFORMATIONS ÉPURÉES : uniquement marque et quantité */}
          <div className="space-y-1">
            {product.brands && (
              <p className="text-gray-600">
                <span className="font-semibold">Marque:</span> {product.brands}
              </p>
            )}
            
            {product.quantity && (
              <p className="text-gray-600">
                <span className="font-semibold">Quantité:</span> {product.quantity}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation entre les onglets - AVIS avec une taille de police plus grande */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex items-center">
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`py-4 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'nutrition'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations nutritionnelles
          </button>
          <button
            onClick={() => setActiveTab('environnement')}
            className={`py-4 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'environnement'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Impact environnemental
          </button>
          <button
            onClick={() => setActiveTab('avis')}
            className={`py-4 px-3 border-b-2 font-medium ${
              activeTab === 'avis'
                ? 'border-green-500 text-green-600 text-lg' // Taille de police plus grande pour l'onglet Avis
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm'
            }`}
          >
            AVIS
          </button>
          <button
            onClick={() => setActiveTab('infos')}
            className={`py-4 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'infos'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations produit
          </button>
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === 'nutrition' && <PageNutri 
          product={product} 
          renderIngredients={renderIngredients}
          ingredientsLanguage={ingredientsLanguage}
          setIngredientsLanguage={setIngredientsLanguage}
          languageButtonStyle={languageButtonStyle}
        />}
        {activeTab === 'environnement' && <PageEnvir product={product} />}
        {activeTab === 'avis' && <PageAvis product={product} />}
        {activeTab === 'infos' && <PageInfos product={product} />}
      </div>
    </div>
  );
};

export default ProductDetail;