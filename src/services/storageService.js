// src/services/storageService.js
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { storage } from '../firebase';
import { supabase } from '../supabaseClient';
import { analyzeReceipt } from './claudeService';

/**
 * Télécharge un ticket de caisse vers Firebase Storage et enregistre le lien dans Supabase
 * @param {File} file - Le fichier à télécharger
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @param {string} productCode - Code-barres du produit (optionnel)
 * @returns {Promise<Object>} - Résultat du téléchargement
 */
export const uploadReceipt = async (file, userId, firebaseUid, productCode = null) => {
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
    
    // Télécharger le fichier vers Firebase Storage
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
          console.error('Erreur Firebase Storage:', error.code, error.message);
          reject(error);
        },
        () => {
          console.log('Téléchargement terminé avec succès');
          resolve(uploadTask.snapshot);
        }
      );
    });
    
    // Obtenir l'URL de téléchargement
    console.log('Récupération de l\'URL de téléchargement');
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Utiliser Claude AI pour analyser le ticket si un code produit est fourni
    let receiptData = {
      date: null,
      store: null,
      price: null
    };
    
    if (productCode) {
      try {
        // Analyser le ticket avec Claude
        const analysisResult = await analyzeReceipt(downloadURL, productCode);
        
        if (analysisResult.success) {
          console.log("Analyse du ticket par Claude AI réussie:", analysisResult.data);
          receiptData = analysisResult.data;
        } else {
          console.warn("L'analyse du ticket n'a pas pu être effectuée:", analysisResult.error);
        }
      } catch (aiError) {
        console.error("Erreur lors de l'analyse par IA:", aiError);
        // Continuer le processus même si l'analyse par IA échoue
      }
    }
    
    // Enregistrer uniquement dans la table receipts avec les colonnes existantes
    const receiptObject = {
      user_id: userId,
      firebase_storage_path: fileName,
      firebase_url: downloadURL,
      upload_date: new Date().toISOString(),
      status: 'pending'
    };
    
    // Enregistrer dans Supabase
    console.log('Enregistrement dans Supabase');
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert([receiptObject])
      .select()
      .single();
      
    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    // Retourner le résultat avec les données AI pour utilisation ultérieure
    return {
      success: true,
      receipt,
      url: downloadURL,
      aiData: receiptData // Ces données seront utilisées par le composant client
    };
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement:', error);
    
    return {
      success: false,
      error: error.message || "Erreur lors du téléchargement. Vérifiez votre connexion et les permissions."
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
    
    // 2. Supprimer le fichier dans Firebase Storage si le chemin existe
    if (receipt.firebase_storage_path) {
      const storageRef = ref(storage, receipt.firebase_storage_path);
      await deleteObject(storageRef);
    }
     
    
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
 * Récupère les tickets de caisse récents de l'utilisateur (7 derniers jours)
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {number} limit - Nombre maximum de tickets à récupérer (défaut: 3)
 * @returns {Promise<Object>} - Résultat de la récupération
 */
export const getRecentReceipts = async (userId, limit = 3) => {
  try {
    // Calculer la date d'il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Récupérer les tickets de caisse des 7 derniers jours
    // Inclure également les données de l'enseigne si disponibles
    const { data, count, error } = await supabase
      .from('receipts')
      .select(`
        *,
        enseignes(id, nom)
      `)
      .eq('user_id', userId)
      .eq('status', 'analyzed')
      .gte('upload_date', sevenDaysAgo.toISOString())
      .order('upload_date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return {
      success: true,
      receipts: data,
      total: count
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets récents:', error);
    return {
      success: false,
      error: error.message,
      receipts: []
    };
  }
};