// src/services/topProductsService.js
import { supabase } from '../supabaseClient';

/**
 * Récupère les produits triés selon différents critères
 * @param {object} options - Options de recherche et de tri
 * @param {string} options.searchTerm - Terme de recherche pour le nom du produit
 * @param {string} options.sortBy - Champ à utiliser pour le tri ('average_rating', 'taste_rating', 'quantity_rating', 'total_reviews', 'total_favorites', 'average_price')
 * @param {boolean} options.sortAsc - Tri ascendant (true) ou descendant (false)
 * @param {number} options.limit - Nombre maximum de produits à récupérer
 * @param {number} options.offset - Décalage pour la pagination
 * @returns {Promise<object>} - Résultat de la requête
 */
export const getTopProducts = async (options = {}) => {
  const { 
    searchTerm = '',
    sortBy = 'average_rating',
    sortAsc = false,
    limit = 20,
    offset = 0
  } = options;

  try {
    // Valider les options de tri pour éviter les injections SQL
    const validSortFields = [
      'average_rating', 
      'taste_rating', 
      'quantity_rating', 
      'price_rating',
      'total_reviews', 
      'total_favorites', 
      'average_price'
    ];
    
    // Garantir que le champ de tri est valide
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'average_rating';
    
    // Construire la requête de base
    let query = supabase
      .from('products')
      .select(`
        id, 
        code, 
        product_name, 
        product_name_fr,
        product_name_en,
        brands,
        image_url,
        firebase_image_path,
        average_rating, 
        taste_rating, 
        quantity_rating, 
        price_rating,
        total_reviews, 
        total_favorites, 
        average_price,
        nutriscore_grade
      `, { count: 'exact' });
    
    // Ajouter la recherche textuelle si un terme est fourni
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      
      // Recherche sur plusieurs champs de nom
      query = query.or(`product_name.ilike.%${term}%,product_name_fr.ilike.%${term}%,product_name_en.ilike.%${term}%,ingredients_text.ilike.%${term}%,ingredients_text_fr.ilike.%${term}%,ingredients_text_en.ilike.%${term}%`);
    }
    
    // Filtrage: n'afficher que les produits qui ont au moins un avis
    query = query.gt('total_reviews', 0);
    
    // Trier les résultats
    query = query.order(sortField, { ascending: sortAsc });
    
    // Appliquer la pagination
    query = query.range(offset, offset + limit - 1);
    
    // Exécuter la requête
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { 
      success: true, 
      products: data,
      totalCount: count || 0
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Récupère les filtres disponibles pour la catégorisation des produits
 * @returns {Promise<object>} - Résultat de la requête avec les filtres
 */
export const getProductFilters = async () => {
  try {
    // Récupérer les marques les plus populaires
    const { data: brands, error: brandsError } = await supabase
      .from('products')
      .select('brands')
      .not('brands', 'is', null)
      .gt('total_reviews', 0)
      .order('total_reviews', { ascending: false })
      .limit(20);
      
    if (brandsError) throw brandsError;
    
    // Traiter les marques (certaines peuvent avoir plusieurs marques séparées par des virgules)
    const brandSet = new Set();
    brands.forEach(item => {
      if (item.brands) {
        const brandsList = item.brands.split(',');
        brandsList.forEach(brand => {
          const trimmedBrand = brand.trim();
          if (trimmedBrand) brandSet.add(trimmedBrand);
        });
      }
    });
    
    // Récupérer les catégories les plus populaires
    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('categories')
      .not('categories', 'is', null)
      .gt('total_reviews', 0)
      .order('total_reviews', { ascending: false })
      .limit(20);
      
    if (categoriesError) throw categoriesError;
    
    // Traiter les catégories
    const categorySet = new Set();
    categories.forEach(item => {
      if (item.categories) {
        const categoriesList = item.categories.split(',');
        categoriesList.forEach(category => {
          const trimmedCategory = category.trim();
          if (trimmedCategory) categorySet.add(trimmedCategory);
        });
      }
    });
    
    return {
      success: true,
      filters: {
        brands: Array.from(brandSet),
        categories: Array.from(categorySet)
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des filtres:", error);
    return {
      success: false,
      error: error.message
    };
  }
};