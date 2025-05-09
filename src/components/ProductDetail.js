// src/components/ProductDetail.js - Mise à jour avec syncProductWithDatabase
import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import PageNutri from './PageNutri';
import PageEnvir from './PageEnvir';
import PageAvis from './PageAvisEnhanced';
import FavoriteButton from './FavoriteButton';
import { findProductInDatabase, saveProductToDatabase } from '../services/productDatabaseService'; // Ajout de l'import

const ProductDetail = ({ product }) => {
  // État des onglets et langues
  const [activeTab, setActiveTab] = useState('avis');
  const [categoryLanguage, setCategoryLanguage] = useState('fr');
  // Ajout d'un état pour la langue des ingrédients
  const [ingredientsLanguage, setIngredientsLanguage] = useState('fr');
  
  // Ajout des états pour la synchronisation BDD
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState(null);
  
  // Effet pour synchroniser le produit avec la base de données
  useEffect(() => {
// Dans ProductDetail.js
const syncProductWithDatabase = async () => {
  if (!product || !product.code) return;
  
  try {
    console.log(`Tentative de synchronisation du produit ${product.code} avec la base de données`);
    
    // Vérifier si le produit existe déjà en base
    const { success, exists, error: findError } = await findProductInDatabase(product.code);
    
    if (findError) {
      console.error(`Erreur lors de la vérification du produit ${product.code}:`, findError);
      setSyncError(`Erreur de vérification: ${findError}`);
      return;
    }
    
    if (success) {
      if (!exists) {
        console.log(`Produit ${product.code} non trouvé en base, sauvegarde en cours...`);
        
        // Journaliser les propriétés importantes du produit avant sauvegarde
        console.log("Données clés avant sauvegarde:", {
          code: product.code,
          nutriscore: product.nutriscore_grade,
          ecoscore: product.ecoscore_grade
        });
        
        const saveResult = await saveProductToDatabase(product);
        
        if (saveResult.success) {
          console.log(`Produit ${product.code} sauvegardé avec succès (${saveResult.action})`);
          setIsSynced(true);
        } else {
          const errorMsg = saveResult.error || "Erreur inconnue";
          console.error(`Erreur lors de la sauvegarde du produit ${product.code}:`, errorMsg);
          setSyncError(errorMsg);
        }
      } else {
        console.log(`Produit ${product.code} déjà en base, pas besoin de sauvegarde`);
        setIsSynced(true);
      }
    } else {
      console.error("Erreur inattendue lors de la vérification en base:", findError);
      setSyncError("Erreur de communication avec la base de données");
    }
  } catch (error) {
    console.error("Exception lors de la synchronisation:", error);
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
  
  // Fonction pour traduire les catégories en français
  const translateCategory = (category) => {
    const translations = {
      'en:condiments': 'Condiments',
      'en:sauces': 'Sauces',
      'en:pasta-sauces': 'Sauces pour pâtes',
      'en:pestos': 'Pestos',
      'en:green-pestos': 'Pestos verts',
      'en:groceries': 'Épicerie',
      'en:breakfasts': 'Petit-déjeuners',
      'en:spreads': 'Tartinables',
      'en:sweet-spreads': 'Tartinables sucrés',
      'en:plant-based-foods': 'Aliments d\'origine végétale',
      'en:cereals-and-potatoes': 'Céréales et pommes de terre',
      'en:cereals-and-their-products': 'Céréales et dérivés',
      'en:breads': 'Pains',
      'en:fruits-and-vegetables': 'Fruits et légumes',
      'en:frozen-foods': 'Surgelés',
      'en:desserts': 'Desserts',
      'en:dairy': 'Produits laitiers',
      'en:dairies': 'Produits laitiers',
      'en:meals': 'Plats',
      'en:snacks': 'Snacks',
      'en:beverages': 'Boissons'
    };
    return translations[category.toLowerCase()] || category.replace('en:', '');
  };

  // Fonction pour afficher la catégorie selon la langue choisie
  const renderCategory = () => {
    if (categoryLanguage === 'fr' && product.category_properties && product.category_properties["ciqual_food_name:fr"]) {
      return product.category_properties["ciqual_food_name:fr"];
    } else if (categoryLanguage === 'en' && product.category_properties && product.category_properties["ciqual_food_name:en"]) {
      return product.category_properties["ciqual_food_name:en"];
    } else if (categoryLanguage === 'origin' && product.categories_hierarchy && product.categories_hierarchy.length > 0) {
      return product.categories || product.categories_hierarchy.map(cat => cat.replace('en:', '')).join(', ');
    } else {
      // Fallback
      if (product.category_properties && product.category_properties["ciqual_food_name:fr"]) {
        return product.category_properties["ciqual_food_name:fr"];
      } else if (product.category_properties && product.category_properties["ciqual_food_name:en"]) {
        return product.category_properties["ciqual_food_name:en"];
      } else if (product.categories_hierarchy && product.categories_hierarchy.length > 0) {
        return product.categories || product.categories_hierarchy.map(cat => cat.replace('en:', '')).join(', ');
      }
      return "Non disponible";
    }
  };

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
      {/* Message de synchronisation uniquement en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`mb-2 text-xs p-1 rounded ${isSynced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {isSynced 
            ? `Produit ${product.code} synchronisé avec la base de données` 
            : `Synchronisation du produit ${product.code} en cours...`}
          {syncError && <span className="text-red-600 ml-2">Erreur: {syncError}</span>}
        </div>
      )}
      
      {/* Hiérarchie des catégories avec sélecteur de langue */}
      {product.categories_hierarchy && product.categories_hierarchy.length > 0 && (
        <div className="mb-4 flex items-center text-xs">
          <div className="flex space-x-1 mr-2">
            <button 
              onClick={() => setCategoryLanguage('fr')}
              className={languageButtonStyle(categoryLanguage, 'fr')}
            >
              FR
            </button>
            <button 
              onClick={() => setCategoryLanguage('en')}
              className={languageButtonStyle(categoryLanguage, 'en')}
            >
              EN
            </button>
            <button 
              onClick={() => setCategoryLanguage('origin')}
              className={languageButtonStyle(categoryLanguage, 'origin')}
            >
              Origine
            </button>
          </div>
          <p className="text-gray-500">
            {product.categories_hierarchy.map((category, index) => (
              <React.Fragment key={category}>
                {index > 0 && " > "}
                <span>{translateCategory(category)}</span>
              </React.Fragment>
            ))}
          </p>
        </div>
      )}
      
      {/* En-tête du produit avec les informations principales */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 mb-4 md:mb-0 flex flex-col justify-center items-center">
          {/* Image principale du produit */}
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.product_name || 'Produit'} 
              className="max-h-64 object-contain mb-2"
            />
          ) : (
            <div className="h-64 w-64 bg-gray-200 flex items-center justify-center mb-2">
              <span className="text-gray-500">Image non disponible</span>
            </div>
          )}
          
          {/* Code-barres */}
          <div className="text-center mt-2">
            <p className="text-sm font-medium text-gray-700">Code EAN: {product.code}</p>
          </div>
          
          {/* Images supplémentaires en miniatures si disponibles */}
          {(product.images && Object.keys(product.images).length > 1) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Images supplémentaires:</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.keys(product.images).slice(0, 4).map((key, index) => {
                  if (key !== 'front' && product.images[key] && product.images[key].display_url) {
                    return (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
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
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 md:pl-6">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-2">{product.product_name || 'Nom non disponible'}</h2>
            
            {/* Ajout du bouton favori */}
            <FavoriteButton 
              productCode={product.code}
              productData={product}
              size="lg"
            />
          </div>
          
          {/* Catégorie avec la langue sélectionnée */}
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Catégorie:</span> {renderCategory()}
          </p>
          
          {product.brands && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Marque:</span> {product.brands}
            </p>
          )}
          
          {product.quantity && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Quantité:</span> {product.quantity}
            </p>
          )}
          
          {/* Commerces où on trouve le produit */}
          {product.stores && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Disponible chez:</span> {product.stores}
            </p>
          )}
          
          {/* Labels et indications sur l'étiquette */}
          {product.labels && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Labels:</span> {product.labels}
            </p>
          )}
          
          {/* Lieu de production séparé */}
          {product.manufacturing_places && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Lieu de production:</span> {product.manufacturing_places}
            </p>
          )}
          
          {/* Pays de distribution séparé */}
          {product.countries && product.countries !== 'en:unknown' && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Pays de distribution:</span> 
              {Array.isArray(product.countries_hierarchy) 
              ? product.countries_hierarchy.map(country => country.replace("en:", "")).join(", ")
              : product.countries}
            </p>
          )}
        </div>
      </div>
      
      {/* Navigation entre les onglets - Ordre conservé mais l'onglet Avis est sélectionné par défaut */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nutrition'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations nutritionnelles
          </button>
          <button
            onClick={() => setActiveTab('environnement')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'environnement'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Impact environnemental
          </button>
          <button
            onClick={() => setActiveTab('avis')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'avis'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Avis
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
      </div>
    </div>
  );
};

export default ProductDetail;