// src/components/ProductDetail.js - Version améliorée avec onglet Avis en premier et menu responsive
import React, { useState, useEffect, useRef } from 'react';
import PageNutri from './PageNutri';
import PageEnvir from './PageEnvir';
import PageAvis from './PageAvisEnhanced';
import PageInfos from './PageInfos';
import FavoriteButton from './FavoriteButton';
import { findProductInDatabase, saveProductToDatabase } from '../services/productDatabaseService';
import { ChevronDown } from 'lucide-react';


const ProductDetail = ({ product }) => {
  // État des onglets et langues
  const [activeTab, setActiveTab] = useState('avis');
  const [ingredientsLanguage, setIngredientsLanguage] = useState('fr');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // États pour la synchronisation BDD
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Défini les onglets avec leurs libellés
  const tabs = [
    { id: 'avis', label: 'AVIS', priority: 1 },
    { id: 'nutrition', label: 'Informations nutritionnelles', priority: 2 },
    { id: 'environnement', label: 'Impact environnemental', priority: 3 },
    { id: 'infos', label: 'Informations produit', priority: 4 }
  ];
  
  // Référence pour détecter les clics à l'extérieur du menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
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
      
      {/* Navigation entre les onglets - Responsive avec AVIS en premier */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex items-center">
          {/* Onglet AVIS avec fond vert uniquement quand il est sélectionné */}
          <button
            onClick={() => {
              setActiveTab('avis');
              setMenuOpen(false);
            }}
            className={`py-4 px-6 font-medium text-lg rounded-t-lg ${
              activeTab === 'avis'
                ? 'bg-green-600 text-white border-b-0'
                : 'border-b-2 border-transparent text-green-700 hover:bg-green-50 hover:text-green-800'
            }`}
          >
            Avis
          </button>
          
          {/* Onglets visibles sur grand écran, masqués sur petit écran */}
          <div className="hidden md:flex">
            {tabs.filter(tab => tab.id !== 'avis').map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Menu déroulant pour les petits écrans */}
          <div className="md:hidden relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-3 py-2 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md"
            >
              <span className="mr-1">{activeTab !== 'avis' ? tabs.find(t => t.id === activeTab)?.label : 'Plus'}</span>
              <ChevronDown size={16} className={`transform transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                {tabs.filter(tab => tab.id !== 'avis').map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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