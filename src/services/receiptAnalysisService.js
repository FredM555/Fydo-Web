// src/services/receiptAnalysisService.js
import { supabase } from '../supabaseClient';

/**
 * Service d'analyse et de stockage des tickets de caisse
 */

/**
 * Envoie une image de ticket à l'API d'analyse et traite le résultat
 * @param {string} imageUrl - URL de l'image de ticket téléchargée
 * @param {string} userId - ID de l'utilisateur
 * @param {string} receiptId - ID du ticket déjà créé dans la table receipts
 * @returns {Promise<Object>} - Résultat avec les données analysées et l'état de l'opération
 */
export const analyzeAndProcessReceipt = async (imageUrl, userId, receiptId) => {
  try {
    console.log("🧩 Début du processus d'analyse et traitement du ticket", { imageUrl, userId, receiptId });
    
    if (!imageUrl || !userId || !receiptId) {
      console.error("❌ Paramètres manquants pour l'analyse", { imageUrl, userId, receiptId });
      throw new Error("Paramètres manquants pour l'analyse du ticket");
    }

    // 1. Appel de l'API d'analyse de ticket
    console.log("🔍 Étape 1: Appel de l'API d'analyse...");
    const analysisResult = await callReceiptAnalysisAPI(imageUrl);
    
    if (!analysisResult) {
      console.error("❌ L'API n'a pas retourné de résultat");
      throw new Error("L'API d'analyse n'a pas retourné de résultat");
    }
    
    console.log("✅ Réponse API reçue:", analysisResult);
    
    if (!analysisResult.receipt) {
      console.error("❌ Structure incorrecte dans la réponse API - Pas de section 'receipt'");
      // Retourner un résultat simple pour que le processus puisse continuer
      return {
        success: false,
        error: "L'analyse du ticket n'a pas produit de résultats valides",
        data: null
      };
    }

    // 2. Traiter et enregistrer les données du ticket dans la base de données
    const { receipt, articles } = analysisResult;
    const { enseigne } = receipt;
    
    console.log("🏬 Étape 2: Traitement de l'enseigne...", enseigne);
    
    // 2.1 Rechercher ou créer l'enseigne
    let enseigneId;
    try {
      enseigneId = await findOrCreateEnseigne(enseigne);
      console.log("✅ Enseigne traitée, ID:", enseigneId);
    } catch (enseigneError) {
      console.error("⚠️ Erreur lors du traitement de l'enseigne:", enseigneError);
      // Continuer sans enseigneId
    }
    
    // 2.2 Mettre à jour le ticket existant avec les nouvelles informations
    console.log("🧾 Étape 3: Mise à jour du ticket...", receipt);
    let updatedReceipt;
    try {
      updatedReceipt = await updateReceiptWithAnalysis(receiptId, receipt, enseigneId);
      console.log("✅ Ticket mis à jour:", updatedReceipt);
    } catch (updateError) {
      console.error("⚠️ Erreur lors de la mise à jour du ticket:", updateError);
      // Continuer sans mise à jour du ticket
    }
    
    // 2.3 Créer les articles du ticket
    if (articles && articles.length > 0) {
      console.log("🛒 Étape 4: Création des articles du ticket...", articles.length, "articles");
      try {
        await createReceiptItems(receiptId, articles);
        console.log("✅ Articles créés avec succès");
      } catch (itemsError) {
        console.error("⚠️ Erreur lors de la création des articles:", itemsError);
        // Continuer sans les articles
      }
    } else {
      console.log("ℹ️ Aucun article trouvé dans l'analyse");
    }
    
    // 3. Retourner les données structurées pour utilisation par le client
    console.log("🏁 Fin du processus d'analyse et traitement");
    return {
    success: true,
    receipt: updatedReceipt || null,
    data: {
        date: receipt.date,
        store: enseigne.nom,
        price: receipt.total,
        items: articles ? articles.length : 0,
        articles: articles // Ajout des articles complets ici
    }
    };
  } catch (error) {
    console.error("❌❌ Erreur critique lors de l'analyse et du traitement du ticket:", error);
    console.error("Stack trace:", error.stack);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Appelle l'API d'analyse de ticket
 * @param {string} imageUrl - URL de l'image à analyser
 * @returns {Promise<Object>} - Résultat de l'analyse
 */
const callReceiptAnalysisAPI = async (imageUrl) => {
  try {
    console.log("🔍 Début d'appel à l'API d'analyse avec URL:", imageUrl);
    
    // Debug: afficher les paramètres de la requête
    const requestBody = JSON.stringify({ imageUrl });
    console.log("📤 Corps de la requête API:", requestBody);
    
    // Appel à l'API
    console.log("⏳ Envoi de la requête à l'API...");
    const response = await fetch('https://gwjkbtbtqntwaqtrflnq.supabase.co/functions/v1/rapid-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });
    
    // Log des informations de la réponse
    console.log("✅ Réponse reçue de l'API - Status:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error("❌ Erreur API:", response.status, response.statusText);
      // Essayer de lire le corps de la réponse même en cas d'erreur
      const errorText = await response.text();
      console.error("❌ Corps de la réponse d'erreur:", errorText);
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }
    
    // Parser la réponse JSON
    console.log("🔄 Conversion de la réponse en JSON...");
    const result = await response.json();
    console.log("📊 Résultat complet de l'analyse API:", JSON.stringify(result, null, 2));
    
    return result;
  } catch (err) {
    console.error("❌❌ Erreur critique lors de l'appel à l'API d'analyse:", err);
    // Afficher la stack trace pour un meilleur débogage
    console.error("Stack trace:", err.stack);
    throw err;
  }
};

/**
 * Recherche ou crée une enseigne dans la base de données
 * @param {Object} enseigneData - Données de l'enseigne
 * @returns {Promise<string>} - ID de l'enseigne
 */
const findOrCreateEnseigne = async (enseigneData) => {
  try {
    // Vérifier si l'enseigne existe déjà (basé sur le nom et le code postal)
    const { data: existingEnseigne, error: searchError } = await supabase
      .from('enseignes')
      .select('id')
      .eq('nom', enseigneData.nom)
      .eq('code_postal', enseigneData.code_postal)
      .single();
    
    if (!searchError && existingEnseigne) {
      return existingEnseigne.id;
    }
    
    // Si pas trouvée, créer une nouvelle enseigne
    const { data: newEnseigne, error: createError } = await supabase
      .from('enseignes')
      .insert([{
        nom: enseigneData.nom,
        adresse1: enseigneData.adresse1,
        adresse2: enseigneData.adresse2 || null,
        code_postal: enseigneData.code_postal,
        ville: enseigneData.ville,
        siret: enseigneData.siret || null
      }])
      .select()
      .single();
    
    if (createError) throw createError;
    
    return newEnseigne.id;
  } catch (error) {
    console.error("Erreur lors de la recherche ou création d'enseigne:", error);
    throw error;
  }
};

/**
 * Met à jour un ticket existant avec les données d'analyse
 * @param {string} receiptId - ID du ticket à mettre à jour
 * @param {Object} receiptData - Données du ticket analysé
 * @param {string} enseigneId - ID de l'enseigne associée
 * @returns {Promise<Object>} - Ticket mis à jour
 */
const updateReceiptWithAnalysis = async (receiptId, receiptData, enseigneId) => {
  try {
    const { data: updatedReceipt, error } = await supabase
      .from('receipts')
      .update({
        enseigne_id: enseigneId,
        receipt_date: receiptData.date,
        total_ht: receiptData.totalHt,
        total_ttc: receiptData.total,
        status: 'analyzed' // Mettre à jour le statut
      })
      .eq('id', receiptId)
      .select()
      .single();
    
    if (error) throw error;
    
    return updatedReceipt;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket:", error);
    throw error;
  }
};

/**
 * Crée les articles liés à un ticket
 * @param {string} receiptId - ID du ticket parent
 * @param {Array} items - Liste des articles à créer
 * @returns {Promise<Array>} - Articles créés
 */
const createReceiptItems = async (receiptId, items) => {
  try {
    // Préparer les données pour l'insertion
    const itemsToInsert = items.map((item, index) => ({
      receipt_id: receiptId,
      designation: item.designation,
      product_code: null, // À remplir ultérieurement par un autre processus
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      prix_total: item.prix_total,
      ordre: index + 1
    }));
    
    const { data: createdItems, error } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert)
      .select();
    
    if (error) throw error;
    
    return createdItems;
  } catch (error) {
    console.error("Erreur lors de la création des articles du ticket:", error);
    throw error;
  }
};

/**
 * Recherche un produit par sa désignation
 * Ce service peut être utilisé pour compléter les codes-barres manquants 
 * dans les articles du ticket
 * @param {string} designation - Désignation du produit
 * @returns {Promise<Object|null>} - Produit trouvé ou null
 */
export const findProductByDesignation = async (designation) => {
  try {
    if (!designation) return null;
    
    // Nettoyer la désignation pour la recherche
    const cleanDesignation = designation.trim().toLowerCase();
    
    // Rechercher dans la table des produits
    const { data, error } = await supabase
      .from('products')
      .select('code, product_name, brands')
      .ilike('product_name', `%${cleanDesignation}%`)
      .limit(1)
      .single();
    
    if (error || !data) return null;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la recherche de produit:", error);
    return null;
  }
};

/**
 * Met à jour les codes-barres des articles du ticket
 * Cette fonction peut être appelée après l'analyse initiale pour enrichir les données
 * @param {string} receiptId - ID du ticket
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const enrichReceiptItemsWithProductCodes = async (receiptId) => {
  try {
    // 1. Récupérer tous les articles du ticket
    const { data: items, error: fetchError } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId);
    
    if (fetchError) throw fetchError;
    
    if (!items || items.length === 0) {
      return { success: true, message: "Aucun article à enrichir" };
    }
    
    // 2. Pour chaque article, tenter de trouver un produit correspondant
    let updatedCount = 0;
    
    for (const item of items) {
      if (!item.product_code && item.designation) {
        const product = await findProductByDesignation(item.designation);
        
        if (product && product.code) {
          // Mettre à jour l'article avec le code-barres trouvé
          const { error: updateError } = await supabase
            .from('receipt_items')
            .update({ product_code: product.code })
            .eq('id', item.id);
          
          if (!updateError) updatedCount++;
        }
      }
    }
    
    return {
      success: true,
      updatedCount,
      totalItems: items.length
    };
  } catch (error) {
    console.error("Erreur lors de l'enrichissement des articles:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  analyzeAndProcessReceipt,
  findProductByDesignation,
  enrichReceiptItemsWithProductCodes
};