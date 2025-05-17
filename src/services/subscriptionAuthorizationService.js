// src/services/subscriptionAuthorizationService.js
import { supabase } from '../supabaseClient';

/**
 * Service pour gérer les autorisations et limites liées aux abonnements
 */

/**
 * Récupère les limites d'utilisation selon le plan d'abonnement
 * @param {string} planName - Nom du plan d'abonnement ('Gratuit', 'Essential', 'Premium', etc.)
 * @returns {Promise<Object>} - Limites du plan d'abonnement
 */
export const getSubscriptionLimits = async (planName = 'Gratuit') => {
  try {
    console.log(`Récupération des limites pour le plan: ${planName}`);
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .single();
      
    if (error) {
      console.error(`Erreur lors de la récupération du plan ${planName}:`, error);
      throw error;
    }
    
    console.log(`Données du plan récupérées:`, data);
    
    return {
      success: true,
      limits: {
        maxScanAuto: data.max_scan_auto || 0,
        maxScanManual: data.max_scan_manuel || 0,
        maxSearchName: data.max_recherche || 0,
        maxReviewAccess: data.max_consult_avis || 0,
        canAccessFavorites: data.can_favorite || false,
        canAccessHistory: data.can_history || false,
        canAccessDetailedInfo: data.can_access_detailed_info || false,
        canAccessNutri: data.can_nutri || false
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des limites:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Récupère l'utilisation quotidienne d'un utilisateur
 * @param {string} userId - ID de l'utilisateur dans Supabase
 * @returns {Promise<Object>} - Utilisation quotidienne
 */
export const getDailyUsage = async (userId) => {
  try {
    if (!userId) throw new Error("ID utilisateur requis");
    
    console.log(`Récupération de l'utilisation quotidienne pour l'utilisateur ${userId}`);
    
    // Calculer le début de la journée
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    console.log(`Date de début de la journée: ${todayISO}`);
    
    // Récupérer les différents types d'interactions pour aujourd'hui
    const { data, error } = await supabase
      .from('product_history')
      .select('interaction_type')
      .eq('user_id', userId)
      .gte('interaction_date', todayISO);
      
    if (error) {
      console.error(`Erreur lors de la récupération de l'historique:`, error);
      throw error;
    }
    
    console.log(`Nombre total d'interactions trouvées: ${data?.length || 0}`);
    
    // Compter les différents types d'interactions
    const scanAuto = data.filter(item => item.interaction_type === 'scan').length;
    const scanManual = data.filter(item => item.interaction_type === 'manual_entry').length;
    const searchName = data.filter(item => item.interaction_type === 'searchName').length;
    
    console.log(`Compteurs d'utilisation:`, { scanAuto, scanManual, searchName });
    
    return {
      success: true,
      usage: {
        scanAuto,
        scanManual,
        searchName
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisation:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Vérifie si un utilisateur est autorisé à effectuer une action spécifique
 * @param {string} userId - ID de l'utilisateur dans Supabase
 * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName', etc.)
 * @returns {Promise<Object>} - Résultat de la vérification
 */
export const checkActionAuthorization = async (userId, actionType) => {
  try {
    if (!userId) throw new Error("ID utilisateur requis");
    
    console.log(`Vérification d'autorisation pour l'utilisateur ${userId}, action: ${actionType}`);
    
    // 1. Récupérer le plan d'abonnement actif de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError);
      throw userError;
    }
    
    // 2. Récupérer les limites du plan
    const { success: limitsSuccess, limits, error: limitsError } = 
      await getSubscriptionLimits(userData.user_type || 'Gratuit');
      
    if (!limitsSuccess) {
      console.error("Erreur lors de la récupération des limites:", limitsError);
      throw new Error(limitsError);
    }
    
    // 3. Récupérer l'utilisation quotidienne
    const { success: usageSuccess, usage, error: usageError } = 
      await getDailyUsage(userId);
      
    if (!usageSuccess) {
      console.error("Erreur lors de la récupération de l'utilisation:", usageError);
      throw new Error(usageError);
    }
    
    // 4. Vérifier l'autorisation selon le type d'action
    let isAuthorized = false;
    let reason = '';
    
    switch (actionType) {
      case 'scan':
        isAuthorized = usage.scanAuto < limits.maxScanAuto;
        reason = !isAuthorized ? `Limite quotidienne atteinte (${usage.scanAuto}/${limits.maxScanAuto})` : '';
        break;
      case 'manual_entry':
        isAuthorized = usage.scanManual < limits.maxScanManual;
        reason = !isAuthorized ? `Limite quotidienne atteinte (${usage.scanManual}/${limits.maxScanManual})` : '';
        break;
      case 'searchName':
        isAuthorized = usage.searchName < limits.maxSearchName;
        reason = !isAuthorized ? `Limite quotidienne atteinte (${usage.searchName}/${limits.maxSearchName})` : '';
        break;
      case 'favorites':
        isAuthorized = limits.canAccessFavorites;
        reason = !isAuthorized ? 'Fonction disponible uniquement avec un abonnement' : '';
        break;
      case 'history':
        isAuthorized = limits.canAccessHistory;
        reason = !isAuthorized ? 'Fonction disponible uniquement avec un abonnement' : '';
        break;
      case 'detailed_info':
        isAuthorized = limits.canAccessDetailedInfo;
        reason = !isAuthorized ? 'Détails complets disponibles avec un abonnement' : '';
        break;
              // Nouveau cas pour les informations nutritionnelles
      case 'nutrition_info':
        isAuthorized = limits.canAccessNutri;
        reason = !isAuthorized ? 'Informations nutritionnelles détaillées disponibles avec un abonnement' : '';
        break;
      default:
        isAuthorized = false;
        reason = 'Type d\'action non reconnu';
    }
    
    console.log(`Résultat de l'autorisation pour ${actionType}: ${isAuthorized ? 'Autorisé' : 'Non autorisé'}`);
    console.log(`Raison: ${reason || 'Aucune raison spécifiée'}`);
    
    return {
      success: true,
      isAuthorized,
      reason,
      usage,
      limits,
      planName: userData.user_type || 'Gratuit'
    };
  } catch (error) {
    console.error("Erreur lors de la vérification d'autorisation:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Génère un message explicatif pour une action non autorisée
 * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName', etc.)
 * @param {Object} usage - Utilisation actuelle
 * @param {Object} limits - Limites du plan d'abonnement
 * @returns {string} - Message explicatif
 */
export const getActionDeniedMessage = (actionType, usage, limits) => {
  let actionName = '';
  let currentUsage = 0;
  let maxLimit = 0;
  
  switch (actionType) {
    case 'scan':
      actionName = 'scans avec l\'appareil photo';
      currentUsage = usage.scanAuto;
      maxLimit = limits.maxScanAuto;
      break;
    case 'manual_entry':
      actionName = 'recherches par code-barres';
      currentUsage = usage.scanManual;
      maxLimit = limits.maxScanManual;
      break;
    case 'searchName':
      actionName = 'recherches par nom';
      currentUsage = usage.searchName;
      maxLimit = limits.maxSearchName;
      break;
    case 'favorites':
      return 'La fonctionnalité Favoris est disponible uniquement avec un abonnement';
    case 'history':
      return 'L\'accès à l\'historique complet est disponible uniquement avec un abonnement';
    case 'detailed_info':
      return 'Les informations détaillées sont disponibles uniquement avec un abonnement';
     case 'nutrition_info':
      return 'L\'accès aux informations de score est disponible uniquement avec un abonnement premium';
     default:
      return 'Cette fonctionnalité n\'est pas disponible avec votre abonnement actuel';
  }
  
  return `Quota quotidien dépassé: ${currentUsage}/${maxLimit} ${actionName}. Passez à un abonnement supérieur pour plus d'accès.`;
};

// Exporter les fonctions individuellement ET comme un objet par défaut
const subscriptionService = {
  getSubscriptionLimits,
  getDailyUsage,
  checkActionAuthorization,
  getActionDeniedMessage
};

export default subscriptionService;