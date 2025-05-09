// src/services/storageService.js
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { storage } from '../firebase';
import { supabase } from '../supabaseClient';

/**
 * Télécharge un ticket de caisse vers Firebase Storage et enregistre le lien dans Supabase
 * @param {File} file - Le fichier à télécharger
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @returns {Promise<Object>} - Résultat du téléchargement
 */
export const uploadReceipt = async (file, userId, firebaseUid) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!firebaseUid) {
      console.error('Erreur: Utilisateur non authentifié');
      return {
        success: false,
        error: "Vous devez être connecté pour télécharger des fichiers."
      };
    }
    
    // Générer un nom de fichier unique
    const fileName = `receipts/${firebaseUid}/${new Date().getTime()}_${file.name}`;
    console.log('Téléchargement du fichier:', fileName);
    
    const storageRef = ref(storage, fileName);
    
    // Télécharger le fichier vers Firebase Storage avec meilleure gestion des erreurs
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    const snapshot = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progression du téléchargement
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progression du téléchargement: ${progress}%`);
        },
        (error) => {
          // Erreur de téléchargement avec informations détaillées
          console.error('Erreur Firebase Storage:', error.code, error.message);
          
          // Gestion spécifique des erreurs Firebase Storage
          switch (error.code) {
            case 'storage/unauthorized':
              reject(new Error("Vous n'avez pas les permissions nécessaires pour cette opération."));
              break;
            case 'storage/canceled':
              reject(new Error("Téléchargement annulé."));
              break;
            case 'storage/unknown':
              reject(new Error("Une erreur inconnue s'est produite. Vérifiez votre connexion internet."));
              break;
            default:
              reject(error);
          }
        },
        () => {
          // Téléchargement terminé avec succès
          console.log('Téléchargement terminé avec succès');
          resolve(uploadTask.snapshot);
        }
      );
    });
    
    // Obtenir l'URL de téléchargement
    console.log('Récupération de l\'URL de téléchargement');
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Enregistrer le ticket dans Supabase
    console.log('Enregistrement dans Supabase');
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert([
        {
          user_id: userId,
          firebase_storage_path: fileName,
          firebase_url: downloadURL,
          status: 'pending',
          upload_date: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    return {
      success: true,
      receipt,
      url: downloadURL
    };
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement:', error);
    
    // Message d'erreur plus convivial et informatif
    return {
      success: false,
      error: error.message || "Erreur lors du téléchargement. Vérifiez votre connexion et les permissions Firebase."
    };
  }
};

/**
 * Télécharge une image de produit vers Firebase Storage et enregistre le lien dans Supabase
 * @param {File} file - Le fichier à télécharger
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @param {string} productCode - Code-barres du produit
 * @returns {Promise<Object>} - Résultat du téléchargement
 */
export const uploadProductImage = async (file, userId, firebaseUid, productCode) => {
  try {
    // 1. Générer un nom de fichier unique
    const fileName = `products/${firebaseUid}/${productCode}/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    // 2. Télécharger le fichier vers Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // 3. Attendre la fin du téléchargement
    const snapshot = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progression du téléchargement
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progression du téléchargement: ${progress}%`);
        },
        (error) => {
          // Erreur de téléchargement
          reject(error);
        },
        () => {
          // Téléchargement terminé avec succès
          resolve(uploadTask.snapshot);
        }
      );
    });
    
    // 4. Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // 5. Enregistrer l'image du produit dans Supabase
    const { data: productImage, error } = await supabase
      .from('product_images')
      .insert([
        {
          user_id: userId,
          product_code: productCode,
          firebase_storage_path: fileName,
          firebase_url: downloadURL,
          upload_date: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      success: true,
      productImage,
      url: downloadURL
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image du produit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprime un ticket de caisse
 * @param {string} receiptId - ID du ticket de caisse dans Supabase
 * @param {string} userId - ID Supabase de l'utilisateur
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteReceipt = async (receiptId, userId) => {
  try {
    // 1. Récupérer les informations du ticket de caisse
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .eq('user_id', userId) // Sécurité pour s'assurer que l'utilisateur est le propriétaire
      .single();
      
    if (fetchError) throw fetchError;
    
    // 2. Supprimer le fichier dans Firebase Storage
    const storageRef = ref(storage, receipt.firebase_storage_path);
    await deleteObject(storageRef);
    
    // 3. Supprimer l'entrée dans Supabase
    const { error: deleteError } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId)
      .eq('user_id', userId);
      
    if (deleteError) throw deleteError;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprime une image de produit
 * @param {string} imageId - ID de l'image du produit dans Supabase
 * @param {string} userId - ID Supabase de l'utilisateur
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteProductImage = async (imageId, userId) => {
  try {
    // 1. Récupérer les informations de l'image du produit
    const { data: productImage, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', userId) // Sécurité pour s'assurer que l'utilisateur est le propriétaire
      .single();
      
    if (fetchError) throw fetchError;
    
    // 2. Supprimer le fichier dans Firebase Storage
    const storageRef = ref(storage, productImage.firebase_storage_path);
    await deleteObject(storageRef);
    
    // 3. Supprimer l'entrée dans Supabase
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId);
      
    if (deleteError) throw deleteError;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image du produit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Récupère la liste des tickets de caisse d'un utilisateur
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {number} limit - Nombre de tickets à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<Object>} - Résultat de la récupération
 */
export const getUserReceipts = async (userId, limit = 10, offset = 0) => {
  try {
    // Récupérer les tickets de caisse
    const { data, count, error } = await supabase
      .from('receipts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      success: true,
      receipts: data,
      total: count
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Récupère la liste des images de produit d'un utilisateur
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} productCode - Code-barres du produit (optionnel)
 * @param {number} limit - Nombre d'images à récupérer
 * @param {number} offset - Décalage pour la pagination
 * @returns {Promise<Object>} - Résultat de la récupération
 */
export const getUserProductImages = async (userId, productCode = null, limit = 10, offset = 0) => {
  try {
    // Construire la requête
    let query = supabase
      .from('product_images')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
      
    // Filtrer par code produit si spécifié
    if (productCode) {
      query = query.eq('product_code', productCode);
    }
    
    // Ajouter le tri et la pagination
    const { data, count, error } = await query
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      success: true,
      images: data,
      total: count
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};