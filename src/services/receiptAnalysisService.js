// src/services/receiptAnalysisService.js - Version corrigée
import { supabase } from '../supabaseClient';

/**
 * Récupère les articles d'un ticket de caisse depuis la base de données
 * @param {string} receiptId - ID du ticket de caisse
 * @returns {Promise<Object>} - Liste des articles avec informations de succès/erreur
 */
export const getReceiptItems = async (receiptId) => {
  try {
    console.log("🔍 Chargement des articles pour le ticket ID:", receiptId);
    
    if (!receiptId) {
      console.error("❌ Erreur: ID de ticket manquant");
      throw new Error("L'ID du ticket est requis pour charger les articles");
    }

    // Récupérer les articles depuis Supabase
    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId)
      .order('ordre', { ascending: true });
      
    if (error) {
      console.error("❌ Erreur Supabase:", error);
      throw error;
    }
    
    console.log(`✅ ${data.length} articles chargés avec succès`);
    
    // Ajouter un ID temporaire si besoin pour la gestion dans le composant
    const itemsWithIds = data.map(item => ({
      ...item,
      id: item.id || `db-item-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    return {
      success: true,
      items: itemsWithIds
    };
  } catch (error) {
    console.error("❌ Erreur lors du chargement des articles:", error);
    return {
      success: false,
      error: error.message,
      items: []
    };
  }
};

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
    
    // Vérifier d'abord si l'image est un ticket de caisse
    if (analysisResult.is_receipt === false) {
      console.error("⚠️ L'image n'est pas un ticket de caisse:", analysisResult.detection_reason);
      
      // Mettre à jour le statut du ticket dans la base de données pour indiquer que ce n'est pas un ticket valide
      try {
        await supabase
          .from('receipts')
          .update({ status: 'invalid_receipt' })
          .eq('id', receiptId);
      } catch (updateError) {
        console.error("⚠️ Erreur lors de la mise à jour du statut du ticket:", updateError);
      }
      
      // Retourner un résultat qui indique que ce n'est pas un ticket
      return {
        success: false,
        error: "L'image n'est pas un ticket de caisse",
        data: analysisResult,
        receiptId: receiptId
      };
    }
    
    // S'assurer que la structure est complète, créer une structure vide si nécessaire
    if (!analysisResult.receipt) {
      console.error("⚠️ Structure incomplète dans la réponse API - Création d'un objet receipt vide");
      analysisResult.receipt = {
        enseigne: {
          nom: "Enseigne inconnue",
          adresse1: "",
          adresse2: "",
          code_postal: "",
          ville: "",
          siret: ""
        },
        date: null,
        totalHt: null,
        total: null
      };
    }
    
    if (!analysisResult.articles) {
      console.error("⚠️ Structure incomplète dans la réponse API - Création d'un tableau articles vide");
      analysisResult.articles = [];
    }

    // 2. Traiter et enregistrer les données du ticket dans la base de données
    const { receipt, articles } = analysisResult;
    const { enseigne } = receipt;

    // NOUVELLE PARTIE: Vérification de duplicata
    // Vérifier si un ticket similaire existe déjà pour cet utilisateur
// Vérifier si un ticket similaire existe déjà pour cet utilisateur
if (receipt.total || receipt.date || (enseigne && enseigne.nom)) {
  console.log("🔍 Vérification si un ticket similaire existe déjà...");
  
  try {
    // Construire une requête qui joint la table receipts avec la table enseignes
    let query = supabase
      .from('receipts')
      .select('*, enseignes(nom, id)')
      .eq('user_id', userId)
      .neq('id', receiptId); // Exclure le ticket actuel
    
    // Ajouter les critères de recherche disponibles
    if (receipt.total) {
      // S'assurer que le total est un nombre valide
      let totalAmount = 0;
      
      try {
        // Gérer différents formats possibles (points ou virgules)
        const cleanTotal = String(receipt.total).replace(',', '.').replace(/\s/g, '');
        totalAmount = parseFloat(cleanTotal);
        
        if (!isNaN(totalAmount)) {
          const minAmount = totalAmount - 0.5;
          const maxAmount = totalAmount + 0.5;
          
          console.log(`💰 Recherche par montant: ${minAmount} - ${maxAmount}`);
          
          // S'assurer que les montants sont des nombres valides pour la requête
          query = query.gte('total_ttc', minAmount).lte('total_ttc', maxAmount);
        } else {
          console.warn("⚠️ Montant du ticket invalide pour la recherche:", receipt.total);
        }
      } catch (numberError) {
        console.warn("⚠️ Erreur lors du traitement du montant:", numberError);
      }
    }
    
    if (receipt.date) {
      try {
        // S'assurer que la date est valide
        const dateObj = new Date(receipt.date);
        
        if (!isNaN(dateObj.getTime())) {
          // Ajouter une tolérance d'un jour
          const prevDay = new Date(dateObj);
          prevDay.setDate(dateObj.getDate() - 1);
          const nextDay = new Date(dateObj);
          nextDay.setDate(dateObj.getDate() + 1);
          
          const prevDayStr = prevDay.toISOString().split('T')[0];
          const nextDayStr = nextDay.toISOString().split('T')[0];
          
          console.log(`📅 Recherche par date: ${prevDayStr} - ${nextDayStr}`);
          
          query = query.gte('receipt_date', prevDayStr).lte('receipt_date', nextDayStr);
        } else {
          console.warn("⚠️ Date du ticket invalide pour la recherche:", receipt.date);
        }
      } catch (dateError) {
        console.warn("⚠️ Erreur lors du traitement de la date:", dateError);
      }
    }
    
    // Recherche par nom d'enseigne au lieu de l'ID
    if (enseigne && enseigne.nom) {
      try {
        // Nettoyer le nom de l'enseigne pour la recherche
        const cleanEnseigneName = enseigne.nom.trim();
        
        if (cleanEnseigneName) {
          // Exécuter d'abord une requête pour trouver les ID d'enseignes avec ce nom
          const { data: enseignesData, error: enseignesError } = await supabase
            .from('enseignes')
            .select('id')
            .ilike('nom', `%${cleanEnseigneName}%`);
          
          if (!enseignesError && enseignesData && enseignesData.length > 0) {
            // Extraire les IDs des enseignes correspondantes
            const enseigneIds = enseignesData.map(e => e.id);
            
            if (enseigneIds.length > 0) {
              // Rechercher les tickets avec l'un de ces IDs d'enseigne
              query = query.in('enseigne_id', enseigneIds);
              console.log(`🏬 Recherche par noms d'enseignes similaires: ${cleanEnseigneName}, IDs:`, enseigneIds);
            }
          }
        }
      } catch (enseigneError) {
        console.warn("⚠️ Erreur lors de la recherche par enseigne:", enseigneError);
      }
    }
    
    // Exécuter la requête de recherche de tickets similaires
    const { data: existingReceipts, error: queryError } = await query;
    
    if (queryError) {
      console.error("❌ Erreur lors de la vérification des duplicatas:", queryError);
    } else if (existingReceipts && existingReceipts.length > 0) {
      // Ticket similaire trouvé!
      const existingReceipt = existingReceipts[0];
      console.log("🔄 Ticket similaire trouvé:", existingReceipt.id);
      
      // Télécharger les articles du ticket existant
      let existingItems = [];
      try {
        const { success, items } = await getReceiptItems(existingReceipt.id);
        if (success && items) {
          existingItems = items;
          console.log(`✅ ${items.length} articles chargés depuis le ticket existant`);
        }
      } catch (itemsError) {
        console.warn("⚠️ Impossible de charger les articles du ticket existant:", itemsError);
      }
      
      // Supprimer le ticket actuel qui est un duplicata
      try {
        await supabase
          .from('receipts')
          .delete()
          .eq('id', receiptId);
        
        console.log("🗑️ Ticket dupliqué supprimé avec succès");
        
        // Retourner un résultat spécial indiquant un duplicata
        return {
          success: true,
          isDuplicate: true,
          existingReceiptId: existingReceipt.id,
          receipt: existingReceipt,
          createdItems: existingItems,
          data: {
            is_receipt: true,
            date: existingReceipt.receipt_date,
            store: existingReceipt.enseignes?.nom || enseigne.nom || "Enseigne inconnue",
            price: existingReceipt.total_ttc,
            items: existingItems.length
          }
        };
      } catch (deleteError) {
        console.error("❌ Erreur lors de la suppression du ticket dupliqué:", deleteError);
      }
    }
  } catch (duplError) {
    // Gérer l'erreur et continuer l'exécution normale
    console.error("❌ Erreur lors de la vérification des duplicatas:", duplError);
  }
}
    
    // Continuer le traitement normal si aucun duplicata n'est trouvé
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
    let createdItems = [];
    if (articles && articles.length > 0) {
      console.log("🛒 Étape 4: Création des articles du ticket...", articles.length, "articles");
      try {
        createdItems = await createReceiptItems(receiptId, articles);
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
      receiptId: receiptId, // Toujours retourner l'ID du ticket même si la mise à jour a échoué
      createdItems: createdItems, // Retourner les articles créés pour utilisation immédiate
      data: {
        is_receipt: true,
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
      error: error.message,
      receiptId: receiptId // Retourner l'ID même en cas d'erreur pour permettre d'autres opérations
    };
  }
}

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
    console.log("📊 Résultat de l'analyse API reçu");
    
    return result;
  } catch (err) {
    console.error("❌❌ Erreur critique lors de l'appel à l'API d'analyse:", err);
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
    if (!enseigneData || !enseigneData.nom) {
      return null;
    }

    // Vérifier si l'enseigne existe déjà (basé sur le nom et le code postal)
    const { data: existingEnseigne, error: searchError } = await supabase
      .from('enseignes')
      .select('id')
      .eq('nom', enseigneData.nom)
      .eq('code_postal', enseigneData.code_postal || '00000')
      .single();
    
    if (!searchError && existingEnseigne) {
      return existingEnseigne.id;
    }
    
    // Si pas trouvée, créer une nouvelle enseigne
    const { data: newEnseigne, error: createError } = await supabase
      .from('enseignes')
      .insert([{
        nom: enseigneData.nom,
        adresse1: enseigneData.adresse1 || 'Adresse inconnue',
        adresse2: enseigneData.adresse2 || null,
        code_postal: enseigneData.code_postal || '00000',
        ville: enseigneData.ville || 'Ville inconnue',
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
    // Préparer les données pour la mise à jour
    const updateData = {
      status: 'analyzed' // Mettre à jour le statut
    };
    
    // Ajouter les champs qui existent
    if (enseigneId) {
      updateData.enseigne_id = enseigneId;
    }
    
    if (receiptData.date) {
      updateData.receipt_date = receiptData.date;
    }
    
    if (receiptData.totalHt !== undefined) {
      updateData.total_ht = receiptData.totalHt;
    }
    
    if (receiptData.total !== undefined) {
      updateData.total_ttc = receiptData.total;
    }

    const { data: updatedReceipt, error } = await supabase
      .from('receipts')
      .update(updateData)
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
    console.log(`🛒 Création de ${items.length} articles pour le ticket ${receiptId}`);
    
    if (!items || items.length === 0) {
      return [];
    }
    
    // Préparer les données pour l'insertion
    const itemsToInsert = items.map((item, index) => ({
      receipt_id: receiptId,
      designation: item.designation || 'Article sans nom',
      product_code: item.product_code || null, // Peut être null initialement
      quantite: parseFloat(item.quantite) || 1,
      prix_unitaire: parseFloat(item.prix_unitaire) || 0,
      prix_total: parseFloat(item.prix_total) || 0,
      ordre: index + 1
    }));
    
    const { data: createdItems, error } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert)
      .select();
    
    if (error) {
      console.error("❌ Erreur lors de l'insertion des articles:", error);
      throw error;
    }
    
    console.log(`✅ ${createdItems.length} articles créés avec succès`);
    return createdItems;
  } catch (error) {
    console.error("❌ Erreur lors de la création des articles du ticket:", error);
    throw error;
  }
};

/**
 * Met à jour un article de ticket dans la base de données
 * @param {string} itemId - ID de l'article à mettre à jour
 * @param {Object} updatedData - Nouvelles données pour l'article
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export const updateReceiptItem = async (itemId, updatedData) => {
  try {
    console.log("🔄 Mise à jour de l'article ID:", itemId, "avec données:", updatedData);
    
    if (!itemId) {
      console.error("❌ Erreur: ID d'article manquant");
      throw new Error("L'ID de l'article est requis pour la mise à jour");
    }

    // Si l'ID commence par "ai-item-" ou "temp-", c'est un ID temporaire 
    // et l'article doit être inséré plutôt que mis à jour
    if (itemId.startsWith('ai-item-') || itemId.startsWith('temp-')) {
      console.log("⚠️ ID temporaire détecté, insertion d'un nouvel article");
      
      const { data: insertedItem, error: insertError } = await supabase
        .from('receipt_items')
        .insert([{
          receipt_id: updatedData.receipt_id,
          designation: updatedData.designation,
          product_code: updatedData.product_code || null,
          quantite: updatedData.quantite,
          prix_unitaire: updatedData.prix_unitaire,
          prix_total: updatedData.prix_total,
          ordre: updatedData.ordre || 0
        }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return {
        success: true,
        item: insertedItem,
        action: 'inserted'
      };
    }
    
    // Mise à jour de l'article existant
    const { data: updatedItem, error } = await supabase
      .from('receipt_items')
      .update({
        designation: updatedData.designation,
        product_code: updatedData.product_code,
        quantite: updatedData.quantite,
        prix_unitaire: updatedData.prix_unitaire,
        prix_total: updatedData.prix_total
      })
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) throw error;
    
    console.log("✅ Article mis à jour avec succès:", updatedItem);
    
    return {
      success: true,
      item: updatedItem,
      action: 'updated'
    };
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'article:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprime un article de ticket dans la base de données
 * @param {string} itemId - ID de l'article à supprimer
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteReceiptItem = async (itemId) => {
  try {
    console.log("🗑️ Suppression de l'article ID:", itemId);
    
    // Si l'ID commence par "ai-item-" ou "temp-", c'est un ID temporaire 
    // et l'article n'existe pas en base de données
    if (itemId.startsWith('ai-item-') || itemId.startsWith('temp-')) {
      console.log("⚠️ ID temporaire détecté, aucune suppression nécessaire en base de données");
      return {
        success: true,
        action: 'ignored'
      };
    }
    
    const { error } = await supabase
      .from('receipt_items')
      .delete()
      .eq('id', itemId);
      
    if (error) throw error;
    
    console.log("✅ Article supprimé avec succès");
    
    return {
      success: true,
      action: 'deleted'
    };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'article:", error);
    return {
      success: false,
      error: error.message
    };
  }
}; 

export default {
  getReceiptItems,
  analyzeAndProcessReceipt,
  updateReceiptItem,
  deleteReceiptItem
};