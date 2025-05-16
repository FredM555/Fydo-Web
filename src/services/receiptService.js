// src/services/receiptService.js
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
    
    return {
      success: true,
      items: data
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
 * Vérifie si un ticket existe déjà pour cet utilisateur
 * @param {string} userId - ID de l'utilisateur 
 * @param {File} file - Fichier du ticket
 * @param {string} storeName - Nom du magasin (optionnel, pour recherche plus précise)
 * @param {string} receiptDate - Date du ticket (optionnel, pour recherche plus précise)
 * @param {number} totalAmount - Montant total du ticket (optionnel, pour recherche plus précise)
 * @returns {Promise<Object>} - Résultat avec les informations du ticket s'il existe
 */
export const checkReceiptExists = async (userId, file, storeName = null, receiptDate = null, totalAmount = null) => {
  try {
    if (!userId) {
      throw new Error("ID utilisateur requis");
    }
    
    // Stratégie à deux niveaux pour la recherche:
    // 1. D'abord vérifier s'il existe un ticket avec la même enseigne, date et montant (très fiable)
    // 2. Ensuite, si ce n'est pas le cas, vérifier les tickets avec un nom de fichier similaire
    
    // Première étape: recherche exacte par enseigne, date et montant
    if (storeName || receiptDate || totalAmount) {
      let exactQuery = supabase
        .from('receipts')
        .select(`
          *,
          receipt_items(*),
          enseignes(nom)
        `)
        .eq('user_id', userId);
      
      if (storeName) {
        exactQuery = exactQuery.eq('enseignes.nom', storeName);
      }
      
      if (receiptDate) {
        // Ajouter une tolérance d'un jour pour les différences de fuseau horaire
        const dateObj = new Date(receiptDate);
        const nextDay = new Date(dateObj);
        nextDay.setDate(dateObj.getDate() + 1);
        
        exactQuery = exactQuery.gte('receipt_date', dateObj.toISOString().split('T')[0])
                              .lte('receipt_date', nextDay.toISOString().split('T')[0]);
      }
      
      if (totalAmount) {
        // Tolérance de 0.5€ pour les arrondis potentiels
        const minAmount = totalAmount - 0.5;
        const maxAmount = totalAmount + 0.5;
        
        exactQuery = exactQuery.gte('total_ttc', minAmount)
                              .lte('total_ttc', maxAmount);
      }
      
      const { data: exactMatches, error: exactError } = await exactQuery;
      
      if (!exactError && exactMatches && exactMatches.length > 0) {
        // Trouvé une correspondance exacte!
        console.log("Correspondance exacte trouvée par enseigne/date/montant:", exactMatches[0].id);
        
        const exactMatch = exactMatches[0];
        
        // Vérifier les items liés à des avis
        const linkedItems = await getLinkedItemsForReceipt(exactMatch.id);
        
        return {
          exists: true,
          receipt: exactMatch,
          linkedItems,
          confidence: 1.0, // Confiance maximale car critères exacts
          matchType: 'exact'
        };
      }
    }
    
    // Deuxième étape: recherche par nom de fichier similaire (moins fiable)
    let query = supabase
      .from('receipts')
      .select(`
        *,
        receipt_items(*),
        enseignes(nom)
      `)
      .eq('user_id', userId);
    
    // Chercher des correspondances basées sur le nom du fichier
    if (file && file.name) {
      // Essayer de trouver un motif dans le nom du fichier (date, nom de magasin, etc.)
      const fileName = file.name.toLowerCase();
      
      // Rechercher des mots-clés dans le nom de fichier
      // Par exemple "ticket_carrefour_20231205.jpg"
      const fileNameParts = fileName.split(/[-_. ]/);
      
      if (fileNameParts.length > 1) {
        // Construire une requête OR pour chaque partie significative du nom
        const significantParts = fileNameParts.filter(part => part.length > 3);
        
        if (significantParts.length > 0) {
          let likeFilter = significantParts.map(part => 
            `firebase_storage_path.ilike.%${part}%`
          ).join(',');
          
          query = query.or(likeFilter);
        } else {
          // Si pas de partie significative, recherche basique sur le nom de fichier
          query = query.ilike('firebase_storage_path', `%${file.name}%`);
        }
      } else {
        // Nom de fichier simple, recherche directe
        query = query.ilike('firebase_storage_path', `%${file.name}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // S'il y a des tickets qui correspondent potentiellement
    if (data && data.length > 0) {
      // Trier pour trouver le plus pertinent (ici on prend le plus récent)
      const sortedMatches = [...data].sort((a, b) => 
        new Date(b.upload_date) - new Date(a.upload_date)
      );
      
      const potentialMatch = sortedMatches[0];
      
      // Vérifier les items liés à des avis
      const linkedItems = await getLinkedItemsForReceipt(potentialMatch.id);
      
      return {
        exists: true,
        receipt: potentialMatch,
        linkedItems,
        confidence: 0.8, // Confiance moins élevée car basée sur le nom de fichier
        matchType: 'filename'
      };
    }
    
    return { exists: false };
  } catch (error) {
    console.error("Erreur lors de la vérification du ticket:", error);
    return { 
      exists: false, 
      error: error.message 
    };
  }
};

/**
 * Fonction auxiliaire pour récupérer les items déjà liés à des avis pour un ticket
 * @param {string} receiptId - ID du ticket
 * @returns {Promise<Array>} - Liste des IDs des items liés
 */
const getLinkedItemsForReceipt = async (receiptId) => {
  const linkedItems = [];
  
  // Récupérer les avis liés à ce ticket
  const { data: linkedReviews, error: reviewsError } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('receipt_id', receiptId);
    
  if (!reviewsError && linkedReviews && linkedReviews.length > 0) {
    // Récupérer les items du ticket
    const { data: receiptItems, error: itemsError } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId);
      
    if (!itemsError && receiptItems && receiptItems.length > 0) {
      // Marquer les items qui sont liés à des avis
      receiptItems.forEach(item => {
        const isLinked = linkedReviews.some(review => 
          review.receipt_item_id === item.id || 
          (review.product_code === item.product_code && item.product_code)
        );
        
        if (isLinked) {
          linkedItems.push(item.id);
        }
      });
    }
  }
  
  return linkedItems;
};

/**
 * Récupère les détails complets d'un ticket avec ses items et les avis liés
 * @param {string} receiptId - ID du ticket
 * @param {string} userId - ID de l'utilisateur (pour vérification de sécurité)
 * @returns {Promise<Object>} - Détails complets du ticket
 */
export const getReceiptDetails = async (receiptId, userId) => {
  try {
    if (!receiptId || !userId) {
      throw new Error("ID du ticket et ID utilisateur requis");
    }
    
    // Récupérer le ticket avec ses items
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_items(*)
      `)
      .eq('id', receiptId)
      .eq('user_id', userId) // Sécurité: vérifier que l'utilisateur est propriétaire
      .single();
      
    if (error) throw error;
    
    if (!receipt) {
      throw new Error("Ticket non trouvé");
    }
    
    // Récupérer les avis liés à ce ticket
    const { data: linkedReviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select(`
        *,
        products(product_name, brands)
      `)
      .eq('receipt_id', receiptId);
      
    if (reviewsError) throw reviewsError;
    
    // Marquer les items liés à des avis
    if (receipt.receipt_items && receipt.receipt_items.length > 0 && linkedReviews && linkedReviews.length > 0) {
      receipt.receipt_items = receipt.receipt_items.map(item => {
        const linkedReview = linkedReviews.find(review => 
          review.receipt_item_id === item.id || 
          (review.product_code === item.product_code && item.product_code)
        );
        
        return {
          ...item,
          is_linked: !!linkedReview,
          linked_review: linkedReview || null,
          linked_product: linkedReview ? {
            code: linkedReview.product_code,
            name: linkedReview.products?.product_name || "Produit inconnu",
            brand: linkedReview.products?.brands || ""
          } : null
        };
      });
    }
    
    return {
      success: true,
      receipt: receipt,
      linkedReviews: linkedReviews || []
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du ticket:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Met à jour ou crée les items d'un ticket
 * @param {string} receiptId - ID du ticket
 * @param {Array} items - Liste des items à sauvegarder
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const saveReceiptItems = async (receiptId, items) => {
  try {
    if (!receiptId || !items || !Array.isArray(items)) {
      throw new Error("ID du ticket et liste d'items requis");
    }
    
    // Traiter chaque item individuellement
    const results = await Promise.all(items.map(async (item) => {
      // Si l'item a un ID temporaire ou n'existe pas encore
      if (!item.id || item.id.startsWith('temp-') || item.id.startsWith('ai-item-')) {
        // Créer un nouvel item
        const { data, error } = await supabase
          .from('receipt_items')
          .insert([{
            receipt_id: receiptId,
            designation: item.designation,
            product_code: item.product_code || null,
            quantite: item.quantite || 1,
            prix_unitaire: item.prix_unitaire || 0,
            prix_total: item.prix_total || 0,
            is_selected: item.is_selected || false
          }])
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Mettre à jour un item existant
        const { data, error } = await supabase
          .from('receipt_items')
          .update({
            designation: item.designation,
            product_code: item.product_code || null,
            quantite: item.quantite || 1,
            prix_unitaire: item.prix_unitaire || 0,
            prix_total: item.prix_total || 0,
            is_selected: item.is_selected || false
          })
          .eq('id', item.id)
          .eq('receipt_id', receiptId) // Sécurité: vérifier que l'item appartient bien à ce ticket
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    }));
    
    return {
      success: true,
      items: results
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des items:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Associe un item du ticket à un avis produit
 * @param {string} reviewId - ID de l'avis
 * @param {string} itemId - ID de l'item du ticket
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const linkReceiptItemToReview = async (reviewId, itemId) => {
  try {
    if (!reviewId || !itemId) {
      throw new Error("ID de l'avis et ID de l'item requis");
    }
    
    // Mettre à jour l'avis pour y associer l'item
    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        receipt_item_id: itemId
      })
      .eq('id', reviewId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Marquer l'item comme sélectionné
    const { error: itemError } = await supabase
      .from('receipt_items')
      .update({
        is_selected: true
      })
      .eq('id', itemId);
      
    if (itemError) throw itemError;
    
    return {
      success: true,
      review: data
    };
  } catch (error) {
    console.error("Erreur lors de l'association item-avis:", error);
    return {
      success: false,
      error: error.message
    };
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