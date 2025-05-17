// src/services/productDatabaseService.js - Version corrigée
import { supabase } from '../supabaseClient';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Recherche un produit dans la base de données locale
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat de la recherche
 */
export const findProductInDatabase = async (productCode) => {
  try {
    if (!productCode) {
      throw new Error("Code produit requis");
    }
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('code', productCode)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows returned"
      throw error;
    }
    
    return { 
      success: true, 
      exists: !!data,
      product: data 
    };
  } catch (error) {
    console.error("Erreur lors de la recherche du produit:", error.message);
    return { success: false, error: error.message };
  }
};



/**
 * Traite et formate les données brutes d'OpenFoodFacts pour notre schéma de base de données
 * @param {object} apiProduct - Données brutes du produit depuis l'API OpenFoodFacts
 * @returns {object} - Données formatées pour insertion dans la base de données
 */
const formatProductDataForDatabase = (apiProduct) => {
  // Extraction de valeurs avec sécurité pour éviter les erreurs sur les champs manquants
  const getValue = (obj, path, defaultValue = null) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };

  // Vérifier les valeurs booléennes
  const getBooleanValue = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'boolean') return value;
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return null;
  };

  return {
    code: apiProduct.code,
    product_name: getValue(apiProduct, 'product_name'),
    product_name_fr: getValue(apiProduct, 'product_name_fr'),
    product_name_en: getValue(apiProduct, 'product_name_en'),
    brands: getValue(apiProduct, 'brands'),
    quantity: getValue(apiProduct, 'quantity'),
    image_url: getValue(apiProduct, 'image_url'),
    nutriscore_grade: getValue(apiProduct, 'nutriscore_grade'),
    nova_group: getValue(apiProduct, 'nova_group'),
    
    // Données nutritionnelles
    energy_100g: getValue(apiProduct, 'nutriments.energy_100g'),
    energy_unit: getValue(apiProduct, 'nutriments.energy_unit'),
    fat_100g: getValue(apiProduct, 'nutriments.fat_100g'),
    saturated_fat_100g: getValue(apiProduct, 'nutriments.saturated-fat_100g'),
    carbohydrates_100g: getValue(apiProduct, 'nutriments.carbohydrates_100g'),
    sugars_100g: getValue(apiProduct, 'nutriments.sugars_100g'),
    proteins_100g: getValue(apiProduct, 'nutriments.proteins_100g'),
    salt_100g: getValue(apiProduct, 'nutriments.salt_100g'),
    fiber_100g: getValue(apiProduct, 'nutriments.fiber_100g'),
    
    // Données environnementales
    ecoscore_grade: getValue(apiProduct, 'ecoscore_grade'),
    ecoscore_score: getValue(apiProduct, 'ecoscore_score'),
    co2_total: getValue(apiProduct, 'environmental_impact.carbon_footprint.value'),
    co2_agriculture: getValue(apiProduct, 'environmental_impact.carbon_footprint_stages.agriculture.value'),
    co2_processing: getValue(apiProduct, 'environmental_impact.carbon_footprint_stages.processing.value'),
    co2_packaging: getValue(apiProduct, 'environmental_impact.carbon_footprint_stages.packaging.value'),
    co2_distribution: getValue(apiProduct, 'environmental_impact.carbon_footprint_stages.distribution.value'),
    co2_consumption: getValue(apiProduct, 'environmental_impact.carbon_footprint_stages.consumption.value'),
    
    // Ingrédients
    ingredients_text: getValue(apiProduct, 'ingredients_text'),
    ingredients_text_fr: getValue(apiProduct, 'ingredients_text_fr'),
    ingredients_text_en: getValue(apiProduct, 'ingredients_text_en'),
    ingredients_n: getValue(apiProduct, 'ingredients_n'),
    allergens: getValue(apiProduct, 'allergens'),
    traces: getValue(apiProduct, 'traces'),
    additives_n: getValue(apiProduct, 'additives_n'),
    
    // Informations sur le produit
    categories: getValue(apiProduct, 'categories'),
    stores: getValue(apiProduct, 'stores'),
    countries: getValue(apiProduct, 'countries'),
    labels: getValue(apiProduct, 'labels'),
    packaging: getValue(apiProduct, 'packaging'),
    packaging_text: getValue(apiProduct, 'packaging_text'),
    manufacturing_places: getValue(apiProduct, 'manufacturing_places'),
    
    // Analyses
    contains_palm_oil: getBooleanValue(getValue(apiProduct, 'ingredients_analysis.palm_oil')),
    may_contain_palm_oil: getBooleanValue(getValue(apiProduct, 'ingredients_analysis.may_contain_palm_oil')),
    is_vegetarian: getBooleanValue(getValue(apiProduct, 'ingredients_analysis.vegetarian')),
    vegetarian_status: getValue(apiProduct, 'ingredients_analysis.vegetarian'),
    is_vegan: getBooleanValue(getValue(apiProduct, 'ingredients_analysis.vegan')),
    vegan_status: getValue(apiProduct, 'ingredients_analysis.vegan')
  };
};

/**
 * Télécharge une image depuis une URL vers Firebase Storage
 * @param {string} imageUrl - URL de l'image à télécharger
 * @param {string} productCode - Code-barres du produit
 * @param {string} imageType - Type d'image ('front', 'ingredients', etc.)
 * @returns {Promise<object>} - Résultat du téléchargement
 */
const downloadImageToFirebase = async (imageUrl, productCode, imageType = 'front') => {
  try {
    if (!imageUrl) return { success: false, message: "URL d'image non fournie" };
    
    // Télécharger l'image depuis l'URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Erreur lors du téléchargement de l'image: ${response.statusText}`);
    
    const blob = await response.blob();
    
    // Créer un nom de fichier unique pour Firebase
    const fileName = `products/openfoodfacts/${productCode}/${imageType}_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, fileName);
    
    // Télécharger vers Firebase Storage
    const uploadTask = await uploadBytesResumable(storageRef, blob);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    return {
      success: true,
      firebase_path: fileName,
      firebase_url: downloadURL
    };
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image vers Firebase:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sauvegarde les images du produit dans la base de données
 * @param {string} productCode - Code-barres du produit
 * @param {object} apiProduct - Données brutes du produit depuis l'API OpenFoodFacts
 * @returns {Promise<object>} - Résultat de l'opération
 */
const saveProductImages = async (productCode, apiProduct) => {
  try {
    const imagesToSave = [];
    
    // Image principale
    if (apiProduct.image_url) {
      const mainImageResult = await downloadImageToFirebase(apiProduct.image_url, productCode, 'front');
      if (mainImageResult.success) {
        imagesToSave.push({
          product_code: productCode,
          image_type: 'front',
          image_url: apiProduct.image_url,
          firebase_path: mainImageResult.firebase_path,
          display_order: 1
        });
        
        // Mettre à jour le produit avec le chemin Firebase de l'image principale
        await supabase
          .from('products')
          .update({ firebase_image_path: mainImageResult.firebase_path })
          .eq('code', productCode);
      }
    }
    
    // Images supplémentaires si disponibles
    if (apiProduct.images) {
      let displayOrder = 2;
      
      // Traiter les images par type
      const imageTypes = ['ingredients', 'nutrition', 'packaging'];
      
      for (const type of imageTypes) {
        if (apiProduct.images[type] && apiProduct.images[type].display && apiProduct.images[type].display.url) {
          const imageUrl = apiProduct.images[type].display.url;
          const imageResult = await downloadImageToFirebase(imageUrl, productCode, type);
          
          if (imageResult.success) {
            imagesToSave.push({
              product_code: productCode,
              image_type: type,
              image_url: imageUrl,
              firebase_path: imageResult.firebase_path,
              display_order: displayOrder++
            });
          }
        }
      }
      
      // Ajouter d'autres images si disponibles (limité à 3 images supplémentaires)
      let otherImagesCount = 0;
      for (const key in apiProduct.images) {
        if (otherImagesCount >= 3) break;
        if (!['front', 'ingredients', 'nutrition', 'packaging'].includes(key) && 
            apiProduct.images[key] && apiProduct.images[key].display && apiProduct.images[key].display.url) {
          
          const imageUrl = apiProduct.images[key].display.url;
          const imageResult = await downloadImageToFirebase(imageUrl, productCode, key);
          
          if (imageResult.success) {
            imagesToSave.push({
              product_code: productCode,
              image_type: key,
              image_url: imageUrl,
              firebase_path: imageResult.firebase_path,
              display_order: displayOrder++
            });
            otherImagesCount++;
          }
        }
      }
    }
    
    // Enregistrer les images dans la base de données
    if (imagesToSave.length > 0) {
      const { error } = await supabase
        .from('product_images')
        .insert(imagesToSave);
        
      if (error) throw error;
    }
    
    return { success: true, count: imagesToSave.length };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des images:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sauvegarde ou met à jour un produit dans la base de données locale à partir des données OpenFoodFacts
 * @param {object} apiProduct - Données brutes du produit depuis l'API OpenFoodFacts
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const saveProductToDatabase = async (apiProduct) => {
  try {
    if (!apiProduct || !apiProduct.code) {
      throw new Error("Données de produit invalides");
    }
    
    // Formater les données pour notre schéma
    const formattedProduct = formatProductDataForDatabase(apiProduct);
    
    // Vérifier si le produit existe déjà
    const { exists } = await findProductInDatabase(apiProduct.code);
    
    if (exists) {
      // Mettre à jour le produit existant
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...formattedProduct,
          last_fetch_from_api: new Date().toISOString()
        })
        .eq('code', apiProduct.code);
        
      if (updateError) throw updateError;
      
      // Vérifier si la table product_raw_data existe avant d'essayer d'y insérer des données
// Remplacer ce bloc de code dans saveProductToDatabase :
try {
  // Vérifier si la table product_raw_data existe en essayant de l'utiliser directement
  const { data: testData, error: testError } = await supabase
    .from('product_raw_data')
    .select('product_code')
    .limit(1);
  
  // Si pas d'erreur, la table existe et on peut l'utiliser
  if (!testError) {
    console.log("Table product_raw_data trouvée, tentative d'insertion des données brutes");
    
    // Insérer les données brutes
    const { error: rawDataError } = await supabase
      .from('product_raw_data')
      .upsert({
        product_code: apiProduct.code,
        raw_data: apiProduct,
        fetched_at: new Date().toISOString()
      });
    
    if (rawDataError) {
      console.warn("Détails de l'erreur lors de l'insertion des données brutes:", rawDataError);
      
      // Vérifier si l'erreur est liée à la taille du JSON
      if (rawDataError.message && rawDataError.message.includes("value too long")) {
        console.warn("Le JSON est probablement trop volumineux, tentative de réduction...");
        
        // Simplifier le JSON pour réduire sa taille
        const simplifiedProduct = {
          code: apiProduct.code,
          product_name: apiProduct.product_name,
          brands: apiProduct.brands,
          // Inclure seulement les champs essentiels
        };
        
        // Nouvelle tentative avec les données simplifiées
        const { error: retryError } = await supabase
          .from('product_raw_data')
          .upsert({
            product_code: apiProduct.code,
            raw_data: simplifiedProduct,
            fetched_at: new Date().toISOString()
          });
        
        if (retryError) {
          console.warn("Échec même avec JSON simplifié:", retryError);
        } else {
          console.log("Insertion réussie avec JSON simplifié");
        }
      }
    } else {
      console.log("Données brutes insérées avec succès dans product_raw_data");
    }
  }
} catch (e) {
  console.warn("Erreur lors de l'accès à product_raw_data:", e);
}
      
      return { success: true, action: 'updated' };
    } else {
      // Insérer le nouveau produit
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          ...formattedProduct,
          created_at: new Date().toISOString(),
          last_fetch_from_api: new Date().toISOString()
        }]);
        
      if (insertError) throw insertError;
      
      // Vérifier si la table product_raw_data existe
// Remplacer ce bloc de code dans saveProductToDatabase :
try {
    // Vérifier si la table product_raw_data existe en essayant de l'utiliser directement
    const { data: testData, error: testError } = await supabase
      .from('product_raw_data')
      .select('product_code')
      .limit(1);
    
    // Si pas d'erreur, la table existe et on peut l'utiliser
    if (!testError) {
      console.log("Table product_raw_data trouvée, tentative d'insertion des données brutes");
      
      // Insérer les données brutes
      const { error: rawDataError } = await supabase
        .from('product_raw_data')
        .upsert({
          product_code: apiProduct.code,
          raw_data: apiProduct,
          fetched_at: new Date().toISOString()
        });
      
      if (rawDataError) {
        console.warn("Détails de l'erreur lors de l'insertion des données brutes:", rawDataError);
        
        // Vérifier si l'erreur est liée à la taille du JSON
        if (rawDataError.message && rawDataError.message.includes("value too long")) {
          console.warn("Le JSON est probablement trop volumineux, tentative de réduction...");
          
          // Simplifier le JSON pour réduire sa taille
          const simplifiedProduct = {
            code: apiProduct.code,
            product_name: apiProduct.product_name,
            brands: apiProduct.brands,
            // Inclure seulement les champs essentiels
          };
          
          // Nouvelle tentative avec les données simplifiées
          const { error: retryError } = await supabase
            .from('product_raw_data')
            .upsert({
              product_code: apiProduct.code,
              raw_data: simplifiedProduct,
              fetched_at: new Date().toISOString()
            });
          
          if (retryError) {
            console.warn("Échec même avec JSON simplifié:", retryError);
          } else {
            console.log("Insertion réussie avec JSON simplifié");
          }
        }
      } else {
        console.log("Données brutes insérées avec succès dans product_raw_data");
      }
    }
  } catch (e) {
    console.warn("Erreur lors de l'accès à product_raw_data:", e);
  }
      
      // Télécharger et sauvegarder les images
      await saveProductImages(apiProduct.code, apiProduct);
      
      return { success: true, action: 'inserted' };
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du produit:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour les notes moyennes d'un produit depuis les avis
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const updateProductRatings = async (productCode) => {
  try {
    // Vérifier si la fonction RPC calculate_product_ratings existe
    try {
      // Calculer les notes moyennes depuis les avis
      const { data, error } = await supabase.rpc('calculate_product_ratings', {
        product_code_param: productCode
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const ratings = data[0];
        
        // Mettre à jour les notes dans la table products
        const { error: updateError } = await supabase
          .from('products')
          .update({
            average_rating: ratings.average_rating,
            taste_rating: ratings.taste_rating,
            quantity_rating: ratings.quantity_rating,
            price_rating: ratings.price_rating,
            total_reviews: ratings.total_reviews
          })
          .eq('code', productCode);
          
        if (updateError) throw updateError;
        
        return { success: true, ratings };
      }
    } catch (e) {
      console.warn("La fonction calculate_product_ratings n'existe probablement pas, utilisation d'une méthode alternative:", e);
      
      // Méthode alternative si la fonction RPC n'existe pas
      // Calculer la note moyenne directement à partir des avis
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('average_rating')
        .eq('product_code', productCode)
        .in('status', ['approved', 'approved_auto']);
        
      if (reviewsError) throw reviewsError;
      
      if (reviews && reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + (review.average_rating || 0), 0) / reviews.length;
        
        // Mettre à jour uniquement la note moyenne
        const { error: updateError } = await supabase
          .from('products')
          .update({
            average_rating: parseFloat(averageRating.toFixed(1)),
            total_reviews: reviews.length
          })
          .eq('code', productCode);
          
        if (updateError) throw updateError;
        
        return { 
          success: true, 
          ratings: { 
            average_rating: parseFloat(averageRating.toFixed(1)),
            total_reviews: reviews.length
          } 
        };
      }
    }
    
    return { success: true, message: "Aucun avis trouvé pour ce produit" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notes:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les données complètes d'un produit depuis la base de données locale
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat de la recherche
 */
export const getProductWithDetails = async (productCode) => {
  try {
    if (!productCode) {
      throw new Error("Code produit requis");
    }
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('code', productCode)
      .single();
      
    if (error) throw error;
    
    // Récupérer également les données brutes si la table existe
    try {
      const { data: rawData, error: rawDataError } = await supabase
        .from('product_raw_data')
        .select('raw_data')
        .eq('product_code', productCode)
        .single();
        
      if (!rawDataError) {
        // Combiner les données
        return { 
          success: true, 
          product: {
            ...data,
            raw_data: rawData?.raw_data || null
          }
        };
      }
    } catch (e) {
      console.warn("Impossible de récupérer les données brutes, retour des données standards uniquement:", e);
    }
    
    return { success: true, product: data };
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour la date de dernière récupération d'un produit
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<object>} - Résultat de l'opération
 */
export const updateProductFetchDate = async (productCode) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        last_fetch_from_api: new Date().toISOString()
      })
      .eq('code', productCode);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la date de récupération:", error);
    return { success: false, error: error.message };
  }
};