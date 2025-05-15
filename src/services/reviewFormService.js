// src/services/reviewFormService.js
import { supabase } from '../supabaseClient';
import { findBestMatchingItem } from '../utils/textSimilarityUtils';
import { getReceiptDetails } from './receiptService';

/**
 * Service contenant la logique métier pour le formulaire d'avis
 */

/**
 * Charge les détails d'un ticket existant avec ses articles
 * @param {string} receiptId - ID du ticket
 * @param {string} userId - ID de l'utilisateur
 * @param {object} product - Données du produit pour trouver la meilleure correspondance
 * @returns {Promise<Object>} - Les données du ticket et l'article sélectionné
 */
export const loadExistingReceiptData = async (receiptId, userId, product) => {
  try {
    // Charger les détails complets du ticket
    const receiptDetails = await getReceiptDetails(receiptId, userId);
    
    if (!receiptDetails.success) {
      throw new Error(receiptDetails.error || "Impossible de charger les détails du ticket");
    }
    
    const receipt = receiptDetails.receipt;
    const receiptItems = receipt.receipt_items || [];
    
    // Formater les articles pour le sélecteur
    const formattedItems = receiptItems.map(item => ({
      ...item,
      // Assurer que les valeurs numériques sont bien des nombres
      quantite: typeof item.quantite === 'string' ? parseFloat(item.quantite) : (item.quantite || 1),
      prix_unitaire: typeof item.prix_unitaire === 'string' ? parseFloat(item.prix_unitaire) : (item.prix_unitaire || 0),
      prix_total: typeof item.prix_total === 'string' ? parseFloat(item.prix_total) : (item.prix_total || 0)
    }));
    
    // Informations supplémentaires
    let storeName = '';
    let purchaseDate = receipt.receipt_date || null;
    let purchasePrice = receipt.total_ttc ? receipt.total_ttc.toString() : '';
    
    // Récupérer le nom du magasin si disponible
    if (receipt.enseigne_id) {
      const { data: enseigneData, error } = await supabase
        .from('enseignes')
        .select('nom')
        .eq('id', receipt.enseigne_id)
        .single();
        
      if (!error && enseigneData) {
        storeName = enseigneData.nom;
      }
    }
    
    // Trouver le meilleur article correspondant au produit
    let selectedItem = null;
    let matchScore = 0;
    
    if (product && product.product_name && formattedItems.length > 0) {
      const matchResult = findBestMatchingItem(formattedItems, product);
      selectedItem = matchResult.item;
      matchScore = matchResult.score;
      
      // Si un article est sélectionné, utiliser son prix
      if (selectedItem && selectedItem.prix_total) {
        purchasePrice = selectedItem.prix_total.toString();
      }
    }
    
    return {
      success: true,
      receipt,
      receiptItems: formattedItems,
      selectedItem,
      matchScore,
      purchaseDate,
      storeName,
      purchasePrice
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données du ticket:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Traite les données extraites par IA pour un nouveau ticket
 * @param {object} extractedData - Données extraites par l'IA
 * @param {object} product - Données du produit pour trouver la meilleure correspondance
 * @returns {Object} - Les informations formatées pour le formulaire
 */
export const processExtractedReceiptData = (extractedData, product) => {
  try {
    if (!extractedData) {
      return {
        success: false,
        error: "Aucune donnée extraite"
      };
    }
    
    let purchaseDate = null;
    let storeName = '';
    let purchasePrice = '';
    let receiptItems = [];
    let selectedItem = null;
    let matchScore = 0;
    
    // Extraire les informations de base
    if (extractedData.date) {
      purchaseDate = extractedData.date;
    }
    
    if (extractedData.store) {
      storeName = extractedData.store;
    }
    
    if (extractedData.price) {
      purchasePrice = extractedData.price.toString();
    }
    
    // Traiter les articles
    if (extractedData.articles && Array.isArray(extractedData.articles)) {
      // Ajouter un ID temporaire à chaque article
      receiptItems = extractedData.articles.map((item, index) => ({
        ...item,
        id: `ai-item-${index}`,
        // Convertir les chaînes en nombres si nécessaire
        quantite: typeof item.quantite === 'string' ? parseFloat(item.quantite) : item.quantite,
        prix_unitaire: typeof item.prix_unitaire === 'string' ? parseFloat(item.prix_unitaire) : item.prix_unitaire,
        prix_total: typeof item.prix_total === 'string' ? parseFloat(item.prix_total) : item.prix_total
      }));
      
      // Trouver le meilleur article correspondant
      if (product && product.product_name) {
        const matchResult = findBestMatchingItem(receiptItems, product);
        selectedItem = matchResult.item;
        matchScore = matchResult.score;
        
        // Si un article est sélectionné, utiliser son prix
        if (selectedItem && selectedItem.prix_total) {
          purchasePrice = selectedItem.prix_total.toString();
        }
      }
    }
    
    return {
      success: true,
      receiptItems,
      selectedItem,
      matchScore,
      purchaseDate,
      storeName,
      purchasePrice
    };
  } catch (error) {
    console.error("Erreur lors du traitement des données extraites:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Valide les données du formulaire d'avis
 * @param {object} formData - Données du formulaire à valider
 * @returns {Object} - Résultat de la validation avec les erreurs éventuelles
 */
export const validateReviewForm = (formData) => {
  const { comment, selectedItem, receiptItems, ratings } = formData;
  const errors = {};
  
  // Vérifier si le commentaire est vide
  if (!comment || !comment.trim()) {
    errors.comment = "Le commentaire est obligatoire";
  }
  
  // Vérifier si un article est sélectionné quand des articles existent
  if (!selectedItem && receiptItems && receiptItems.length > 0) {
    errors.selectedItem = "Vous devez sélectionner un article du ticket";
  }
  
  // Vérifier qu'au moins une note est donnée
  if (ratings) {
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      errors.ratings = "Veuillez attribuer au moins une note";
    }
  } else {
    errors.ratings = "Les critères d'évaluation sont obligatoires";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Prépare les informations d'achat pour l'envoi de l'avis
 * @param {object} data - Données du formulaire
 * @returns {Object} - Informations d'achat formatées
 */
export const preparePurchaseInfo = (data) => {
  const { 
    purchasePrice, 
    purchaseDate, 
    location, 
    storeName, 
    authorizeReceiptSharing,
    receiptItems,
    selectedItem,
    matchScore,
    isExistingReceipt
  } = data;
  
  return {
    price: purchasePrice ? parseFloat(purchasePrice) : null,
    date: purchaseDate || null,
    location: location,
    storeName: storeName || null,
    authorizeSharing: authorizeReceiptSharing,
    // Transmettre les articles du ticket
    receiptItems: receiptItems,
    // Transmettre l'ID de l'article sélectionné
    selectedItemId: selectedItem ? selectedItem.id : null,
    // Transmettre le score de correspondance pour la logique de status
    matchScore: matchScore,
    // Indiquer si c'est un ticket existant
    isExistingReceipt: isExistingReceipt
  };
};