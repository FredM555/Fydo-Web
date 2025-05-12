// src/utils/searchUtils.js

// src/utils/searchUtils.js - Modified version with database integration
import { 
  findProductInDatabase, 
  saveProductToDatabase, 
  updateProductFetchDate 
} from '../services/productDatabaseService';

// Configuration de base pour les appels à l'API OpenFoodFacts
const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'FydoApp/1.0 (fydo.app)';
/**
 * Recherche des produits par nom avec possibilité de filtrer par ingrédients
 * 
/**
 * Recherche des produits par nom avec possibilité de filtrer par ingrédients
 * Continue à chercher jusqu'à trouver un nombre minimum de résultats correspondants
 * 
 * @param {string} productName - Nom du produit à rechercher
 * @param {Object} filters - Filtres à appliquer
 * @param {Array} filters.withIngredients - Éléments qui doivent être présents
 * @param {Array} filters.withoutIngredients - Éléments qui ne doivent pas être présents
 * @param {number} page - Numéro de page pour la pagination
 * @param {number} pageSize - Nombre de résultats par page
 * @param {number} minResults - Nombre minimum de résultats filtrés souhaités (défaut: 5)
 * @param {number} maxPages - Nombre maximum de pages à parcourir (défaut: 5)
 * @returns {Promise} - Promesse contenant les résultats de recherche
 */
export const searchProductsByName = async (
  productName, 
  filters = {}, 
  page = 1, 
  pageSize = 20, 
  minResults = 5,
  maxPages = 5
) => {
  if (!productName.trim()) {
    throw new Error('Veuillez saisir un nom de produit');
  }

  // Créer une copie des filtres pour éviter les modifications accidentelles
  const filtersCopy = {
    withIngredients: [...(filters.withIngredients || [])],
    withoutIngredients: [...(filters.withoutIngredients || [])]
  };
  
  // Vérifier si des filtres sont appliqués
  const hasFilters = 
    (filtersCopy.withIngredients.length > 0) || 
    (filtersCopy.withoutIngredients.length > 0);

  console.log(`Recherche de produits "${productName}" avec filtres:`, 
    hasFilters ? filtersCopy : "aucun filtre");

  // Résultats agrégés
  let allFilteredProducts = [];
  let totalResultsCount = 0;
  let currentPage = page;
  let isLastPage = false;
  
  // si on a un filtre on pren plus d'élement pour pouvoir les filtrer
  if (hasFilters) { pageSize = 800;}

  try {
    // Boucle jusqu'à obtenir assez de résultats ou atteindre la dernière page
    while (
      allFilteredProducts.length < minResults && 
      !isLastPage && 
      currentPage <= maxPages
    ) {
      console.log(`Recherche page ${currentPage}...`);
      
      // URL de la requête
      const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${
        encodeURIComponent(productName)
      }&search_simple=1&json=1&page=${currentPage}&page_size=${pageSize}`;
      
      // Timeout raisonnable (30 secondes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'ProductInfoApp/1.0' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour le compteur total si c'est la première page
      if (currentPage === page) {
        totalResultsCount = data.count;
      }
      
      // Vérifier si c'est la dernière page
      if (!data.products || data.products.length === 0) {
        isLastPage = true;
        break;
      }
      
      // Si des filtres sont appliqués, filtrer les résultats
      let pageFilteredProducts = data.products;
      
      if (hasFilters) {
        const beforeCount = pageFilteredProducts.length;
        pageFilteredProducts = data.products.filter(product => 
          filterProductByAllFields(product, filtersCopy)
        );
        
        console.log(`Page ${currentPage}: ${beforeCount} produits → ${
          pageFilteredProducts.length} après filtrage`);
        
        // Ajouter les produits filtrés aux résultats
        allFilteredProducts = [...allFilteredProducts, ...pageFilteredProducts];
        
        // Afficher les produits trouvés dans la console (pour déboguer)
        if (pageFilteredProducts.length > 0) {
          console.log("Produits trouvés sur cette page:", 
            pageFilteredProducts.map(p => p.product_name || p.code));
        }
      } else {
        // Sans filtre, ajouter tous les produits
        allFilteredProducts = [...allFilteredProducts, ...data.products];
      }
      
      // Vérifier si on a atteint la dernière page
      if (data.products.length < pageSize) {
        isLastPage = true;
      }
      
      // Passer à la page suivante
      currentPage++;
    }
    
    // Préparer la réponse
    if (allFilteredProducts.length === 0) {
      return {
        products: [],
        count: totalResultsCount,
        filteredCount: 0,
        status: 'filtered-empty',
        message: 'Aucun produit ne correspond aux filtres sélectionnés.'
      };
    }
    
    return {
      products: allFilteredProducts,
      count: totalResultsCount,
      filteredCount: allFilteredProducts.length,
      status: 'success',
      pagesSearched: currentPage - page,
      message: null
    };
    
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
    } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      throw new Error('Erreur réseau. Vérifiez votre connexion internet.');
    }
    throw err;
  }
};
  
  /**
   * Filtre un produit en cherchant dans TOUS les champs pertinents (ingrédients, allergènes, additifs, etc.)
   * 
   * @param {Object} product - Le produit à filtrer
   * @param {Object} filters - Les filtres à appliquer
   * @returns {boolean} - True si le produit correspond aux critères, false sinon
   */
// Fonction de filtrage améliorée
export const filterProductByAllFields = (product, filters) => {
  // Préparer tous les champs à rechercher dans un seul tableau
  const searchableFields = [];
  
  // Fonction pour normaliser un terme (supprimer accents, caractères spéciaux, etc.)
  const normalizeString = (str) => {
    return str.toLowerCase()
      .replace('en:', '')
      .replace('fr:', '')
      .trim();
  };
  
  // Fonction pour vérifier si un terme est présent dans un champ
  // Utilise une correspondance de mot entier ou de début de mot plutôt que partout
  const termMatchesField = (term, field) => {
    const normalizedTerm = normalizeString(term);
    const normalizedField = normalizeString(field);
    
    // Correspondance exacte
    if (normalizedField === normalizedTerm) return true;
    
    // Correspondance au début d'un mot
    if (normalizedField.startsWith(normalizedTerm + ' ')) return true;
    
    // Correspondance à l'intérieur d'un mot (après un espace)
    if (normalizedField.includes(' ' + normalizedTerm)) return true;
    
    // Pour les ingrédients composés avec un tiret ou une parenthèse
    if (normalizedField.includes('-' + normalizedTerm) || 
        normalizedField.includes('(' + normalizedTerm)) return true;
    
    return false;
  };
  
  // Ajouter les ingrédients
  if (product.ingredients_tags && product.ingredients_tags.length > 0) {
    searchableFields.push(...product.ingredients_tags);
  }
  
  // Ajouter les allergènes
  if (product.allergens_tags && product.allergens_tags.length > 0) {
    searchableFields.push(...product.allergens_tags);
  }
  
  // Ajouter la hiérarchie d'allergènes
  if (product.allergens_hierarchy && product.allergens_hierarchy.length > 0) {
    searchableFields.push(...product.allergens_hierarchy);
  }
  
  // Ajouter la liste brute d'allergènes
  if (product.allergens) {
    searchableFields.push(...product.allergens.toLowerCase().split(',').map(item => item.trim()));
  }
  
  // Ajouter les additifs
  if (product.additives_tags && product.additives_tags.length > 0) {
    searchableFields.push(...product.additives_tags);
  }
  
  // Ajouter la marque
  if (product.brands) {
    searchableFields.push(...product.brands.toLowerCase().split(',').map(item => item.trim()));
  }
  
  // Ajouter les lieux
  if (product.manufacturing_places) {
    searchableFields.push(...product.manufacturing_places.toLowerCase().split(',').map(item => item.trim()));
  }
  
  if (product.origins) {
    searchableFields.push(...product.origins.toLowerCase().split(',').map(item => item.trim()));
  }
  
  // Ajouter les catégories
  if (product.categories) {
    searchableFields.push(...product.categories.toLowerCase().split(',').map(item => item.trim()));
  }
  
  if (product.categories_tags && product.categories_tags.length > 0) {
    searchableFields.push(...product.categories_tags);
  }
  
  // Ajouter la liste d'ingrédients textuelle si disponible
  if (product.ingredients_text) {
    searchableFields.push(product.ingredients_text.toLowerCase());
  }
  
  // Vérifier les critères AVEC
  if (filters.withIngredients && filters.withIngredients.length > 0) {
    // Le produit doit contenir TOUS les termes AVEC
    for (const term of filters.withIngredients) {
      // Vérifier si au moins un champ contient ce terme
      const found = searchableFields.some(field => termMatchesField(term, field));
      
      if (!found) {
        // console.log(`Terme AVEC "${term}" non trouvé dans le produit ${product.product_name}`);
        return false; // Un terme AVEC n'est pas présent
      }
    }
  }
  
  // Vérifier les critères SANS
  if (filters.withoutIngredients && filters.withoutIngredients.length > 0) {
    // Le produit ne doit contenir AUCUN des termes SANS
    for (const term of filters.withoutIngredients) {
      // Vérifier si au moins un champ contient ce terme
      const found = searchableFields.some(field => termMatchesField(term, field));
      
      if (found) {
        // console.log(`Terme SANS "${term}" trouvé dans le produit ${product.product_name}`);
        return false; // Un terme SANS est présent
      }
    }
  }
  
  // Si toutes les vérifications sont passées, le produit correspond aux critères
  return true;
};
  
  /**
   * Récupère les détails d'un produit par son code-barres
  /**
   * Recherche un produit par code-barres
   * @param {string} barcode - Code-barres du produit à rechercher
   * @returns {Promise<object>} - Résultat de la recherche
   */
  export const fetchProductByBarcode = async (barcode) => {
    // Déclaration des variables hors du bloc try pour qu'elles soient accessibles dans le bloc catch
    let dbSuccess = false;
    let exists = false;
    let dbProduct = null;
    
    try {
      // 1. Vérifier d'abord si le produit est dans notre base de données
      const dbResult = await findProductInDatabase(barcode);
      dbSuccess = dbResult.success;
      exists = dbResult.exists;
      dbProduct = dbResult.product;
      const dbError = dbResult.error;
      
      if (dbSuccess && exists) {
        console.log(`Produit ${barcode} trouvé dans la base de données locale`);
        // Vérifier si les données ne sont pas trop anciennes (plus de 30 jours)
        const lastFetch = new Date(dbProduct.last_fetch_from_api);
        const now = new Date();
        const diffDays = Math.floor((now - lastFetch) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
          // Données récentes, utiliser la version locale
          return {
            status: 'success',
            product: dbProduct.raw_data || dbProduct, // Utiliser les données brutes si disponibles
            source: 'database'
          };
        }
        // Données anciennes, mettre à jour depuis l'API mais utiliser les données locales en cas d'échec
        console.log(`Données pour ${barcode} trop anciennes (${diffDays} jours), rafraîchissement depuis l'API`);
      }
      
      // 2. Si non trouvé en local ou données obsolètes, rechercher via l'API
      const apiUrl = `${API_BASE_URL}/product/${barcode}?fields=all`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': USER_AGENT
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API OpenFoodFacts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 0) {
        // Produit non trouvé dans l'API
        return {
          status: 'not-found',
          message: data.status_verbose || 'Produit non trouvé'
        };
      }
      
      // 3. Sauvegarder/mettre à jour les données dans notre base de données
      console.log(`Sauvegarde du produit ${barcode} dans la base de données`);
      const saveResult = await saveProductToDatabase(data.product);
      
      if (!saveResult.success) {
        console.error(`Erreur lors de la sauvegarde du produit ${barcode}:`, saveResult.error);
        // Si le produit existe déjà en base, mettre à jour la date de dernière récupération
        if (dbSuccess && exists) {
          await updateProductFetchDate(barcode);
        }
      }
      
      return {
        status: 'success',
        product: data.product,
        source: 'api'
      };
      
    } catch (error) {
      console.error(`Erreur lors de la recherche du produit ${barcode}:`, error);
      // Si une erreur survient mais que le produit est en base, utiliser la version locale
      if (exists && dbProduct) {
        return {
          status: 'success',
          product: dbProduct.raw_data || dbProduct,
          source: 'database-fallback'
        };
      }
      throw new Error(`Erreur lors de la recherche du code-barres: ${barcode}`);
    }
  };
  
  /**
   * Formate les ingrédients d'un produit pour l'affichage
   * 
   * @param {Object} product - Le produit dont on veut afficher les ingrédients
   * @param {number} limit - Nombre maximum d'ingrédients à afficher
   * @returns {string} - Chaîne formatée des ingrédients
   */
  export const formatIngredients = (product, limit = 5) => {
    if (!product.ingredients_tags || product.ingredients_tags.length === 0) {
      return 'Non disponible';
    }
    
    const ingredients = product.ingredients_tags
      .slice(0, limit)
      .map(ing => ing.replace('en:', ''));
      
    return ingredients.join(', ') + (product.ingredients_tags.length > limit ? '...' : '');
  };

  /**
   * Détermine si un produit contient du gluten
   * 
   * @param {Object} product - Le produit à analyser
   * @returns {boolean} - True si le produit contient du gluten, false sinon
   */
  export const containsGluten = (product) => {
    // Vérifier dans les allergènes
    if (product.allergens_tags && 
        product.allergens_tags.some(allergen => 
          allergen.toLowerCase().includes('gluten')
        )) {
      return true;
    }
    
    // Vérifier dans la hiérarchie des allergènes
    if (product.allergens_hierarchy && 
        product.allergens_hierarchy.some(allergen => 
          allergen.toLowerCase().includes('gluten')
        )) {
      return true;
    }
    
    // Vérifier dans la chaîne d'allergènes
    if (product.allergens && 
        product.allergens.toLowerCase().includes('gluten')) {
      return true;
    }
    
    // Vérifier dans les ingrédients (les céréales contenant du gluten)
    const glutenIngredients = ['blé', 'wheat', 'seigle', 'rye', 'orge', 'barley', 'avoine', 'oats', 'épeautre', 'spelt', 'kamut', 'triticale'];
    
    if (product.ingredients_tags) {
      const normalizedIngredients = product.ingredients_tags.map(ing => 
        ing.toLowerCase().replace('en:', '')
      );
      
      for (const glutenIng of glutenIngredients) {
        if (normalizedIngredients.some(ing => ing.includes(glutenIng))) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  /**
   * Détermine si un produit contient du lactose
   * 
   * @param {Object} product - Le produit à analyser
   * @returns {boolean} - True si le produit contient du lactose, false sinon
   */
  export const containsLactose = (product) => {
    // Vérifier dans les allergènes
    if (product.allergens_tags && 
        product.allergens_tags.some(allergen => 
          allergen.toLowerCase().includes('milk') || allergen.toLowerCase().includes('lait')
        )) {
      return true;
    }
    
    // Vérifier dans la hiérarchie des allergènes
    if (product.allergens_hierarchy && 
        product.allergens_hierarchy.some(allergen => 
          allergen.toLowerCase().includes('milk') || allergen.toLowerCase().includes('lait')
        )) {
      return true;
    }
    
    // Vérifier dans la chaîne d'allergènes
    if (product.allergens && 
        (product.allergens.toLowerCase().includes('lait') || 
         product.allergens.toLowerCase().includes('milk'))) {
      return true;
    }
    
    // Vérifier dans les ingrédients
    const lactoseIngredients = ['lait', 'milk', 'lactose', 'fromage', 'cheese', 'beurre', 'butter', 'crème', 'cream', 'yaourt', 'yogurt'];
    
    if (product.ingredients_tags) {
      const normalizedIngredients = product.ingredients_tags.map(ing => 
        ing.toLowerCase().replace('en:', '')
      );
      
      for (const lactoseIng of lactoseIngredients) {
        if (normalizedIngredients.some(ing => ing.includes(lactoseIng))) {
          return true;
        }
      }
    }
    
    return false;
  };
  

  // Fonction de débogage pour vérifier les données des produits
export const debugProductFields = (product) => {
  console.group(`Débogage du produit: ${product.product_name || product.code}`);
  console.log('Code:', product.code);
  
  // Informations de base
  console.log('Nom:', product.product_name || 'Non disponible');
  console.log('Marque:', product.brands || 'Non disponible');
  
  // Ingrédients
  console.log('Ingrédients tags:', product.ingredients_tags ? `${product.ingredients_tags.length} éléments` : 'Non disponible');
  if (product.ingredients_tags && product.ingredients_tags.length > 0) {
    console.log('Exemple d\'ingrédients:', product.ingredients_tags.slice(0, 5));
  }
  
  // Allergènes
  console.log('Allergènes tags:', product.allergens_tags ? `${product.allergens_tags.length} éléments` : 'Non disponible');
  console.log('Allergènes hiérarchie:', product.allergens_hierarchy ? `${product.allergens_hierarchy.length} éléments` : 'Non disponible');
  console.log('Allergènes (texte):', product.allergens || 'Non disponible');
  
  // Additifs
  console.log('Additifs tags:', product.additives_tags ? `${product.additives_tags.length} éléments` : 'Non disponible');
  
  // Lieux
  console.log('Lieux de fabrication:', product.manufacturing_places || 'Non disponible');
  console.log('Origines:', product.origins || 'Non disponible');
  
  // Catégories
  console.log('Catégories:', product.categories || 'Non disponible');
  console.log('Catégories tags:', product.categories_tags ? `${product.categories_tags.length} éléments` : 'Non disponible');
  
  // Texte des ingrédients
  console.log('Texte des ingrédients:', product.ingredients_text ? 'Disponible' : 'Non disponible');
  
  console.groupEnd();
  
  // Vérifier les champs manquants importants pour le filtrage
  const missingFields = [];
  
  if (!product.ingredients_tags || product.ingredients_tags.length === 0) {
    missingFields.push('ingredients_tags');
  }
  
  if (!product.allergens_tags || product.allergens_tags.length === 0) {
    missingFields.push('allergens_tags');
  }
  
  if (!product.additives_tags || product.additives_tags.length === 0) {
    missingFields.push('additives_tags');
  }
  
  if (!product.categories_tags || product.categories_tags.length === 0) {
    missingFields.push('categories_tags');
  }
  
  if (missingFields.length > 0) {
    console.warn(`Champs manquants pour le filtrage: ${missingFields.join(', ')}`);
  }
  
  return missingFields.length === 0;
};

  // Exporter toutes les fonctions
  const searchUtils = {
    searchProductsByName,
    fetchProductByBarcode,
    filterProductByAllFields,
    formatIngredients,
    containsGluten,
    containsLactose,
    debugProductFields
  };

export default searchUtils;