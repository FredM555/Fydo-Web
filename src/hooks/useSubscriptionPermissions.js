// src/hooks/useSubscriptionPermissions.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import subscriptionService from '../services/subscriptionAuthorizationService';

/**
 * Hook personnalisé pour gérer les autorisations selon l'abonnement utilisateur
 */
const useSubscriptionPermissions = () => {
  // États pour les limites et l'utilisation
  const [userQuotas, setUserQuotas] = useState({
    scanAuto: 0,
    scanManual: 0,
    searchName: 0
  });
  
  const [userLimits, setUserLimits] = useState({
    maxScanAuto: 0,
    maxScanManual: 0,
    maxSearchName: 0,
    maxReviewAccess: 0,
    canAccessFavorites: false,
    canAccessHistory: false,
    canAccessDetailedInfo: false,
  canAccessNutri: false // Ajout de la propriété
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Récupération du contexte d'authentification
  const { currentUser, userDetails } = useAuth();
  
  // Effet pour initialiser les données
  useEffect(() => {
    if (currentUser && userDetails) {
      loadUserData();
    }
  }, [currentUser, userDetails]);
  
  /**
   * Charge les données d'utilisation et les limites en une seule fonction
   */
  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log("Chargement des données utilisateur...");
      
      if (!userDetails || !userDetails.id) {
        console.warn("Impossible de charger les données : détails utilisateur manquants");
        return;
      }
      
      // Récupérer le type d'abonnement de l'utilisateur
      let planName = 'Gratuit'; // Par défaut
      if (userDetails.subscription_name) {
        planName = userDetails.subscription_name;
      }
      
      console.log("Plan d'abonnement détecté:", planName);
      
      // Charger les limites du plan d'abonnement
      const limitsResponse = await subscriptionService.getSubscriptionLimits(planName);
      if (!limitsResponse.success) {
        throw new Error(`Erreur lors du chargement des limites: ${limitsResponse.error}`);
      }
      
      console.log("Limites récupérées:", limitsResponse.limits);
      setUserLimits(limitsResponse.limits);
      
      // Charger l'utilisation quotidienne
      const usageResponse = await subscriptionService.getDailyUsage(userDetails.id);
      if (!usageResponse.success) {
        throw new Error(`Erreur lors du chargement de l'utilisation: ${usageResponse.error}`);
      }
      
      console.log("Utilisation récupérée:", usageResponse.usage);
      setUserQuotas(usageResponse.usage);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données utilisateur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Vérifie si l'utilisateur est autorisé à effectuer une action spécifique
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName', etc.)
   * @returns {boolean} - True si l'utilisateur est autorisé, sinon False
   */
  const isAuthorized = (actionType) => {
    // Si l'utilisateur n'est pas connecté, il n'est pas autorisé
    if (!currentUser || !userDetails) {
      return false;
    }
    
    let result = false;
    
    switch (actionType) {
      case 'scan':
        result = userQuotas.scanAuto < userLimits.maxScanAuto;
        break;
      case 'scan_barcode':
        result = userQuotas.scanAuto < userLimits.maxScanAuto;
        break;
      case 'manual_search':
        result = userQuotas.scanManual < userLimits.maxScanManual;
        break;
      case 'manual_entry':
        result = userQuotas.scanManual < userLimits.maxScanManual;
        break;
      case 'searchName':
        result = userQuotas.searchName < userLimits.maxSearchName;
        break;
      case 'search_by_name':
        result = userQuotas.searchName < userLimits.maxSearchName;
        break;
      case 'view_reviews':
        result = true; // Toujours autorisé, mais le nombre peut être limité
        break;
      case 'favorites':
        result = userLimits.canAccessFavorites;
        break;
      case 'history':
        result = userLimits.canAccessHistory;
        break;
      case 'detailed_info':
        result = userLimits.canAccessDetailedInfo;
        break;
            // Nouveau cas pour les informations nutritionnelles
      case 'nutrition_info':
      result = userLimits.canAccessNutri;
      break;
      default:
        result = false;
    }
    
    console.log(`Vérification d'autorisation pour ${actionType}: ${result}`);
    console.log(`Quotas actuels:`, userQuotas);
    console.log(`Limites:`, userLimits);
    
    return result;
  };
  
  /**
   * Vérifie l'autorisation de manière asynchrone (pour les vérifications côté serveur)
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName', etc.)
   * @returns {Promise<boolean>} - True si l'utilisateur est autorisé, sinon False
   */
  const checkAuthorization = async (actionType) => {
    if (!currentUser || !userDetails || !userDetails.id) {
      return false;
    }
    
    try {
      const response = await subscriptionService.checkActionAuthorization(
        userDetails.id,
        actionType
      );
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      // Mettre à jour les états avec les données les plus récentes
      setUserQuotas(response.usage);
      setUserLimits(response.limits);
      
      return response.isAuthorized;
    } catch (err) {
      console.error(`Erreur lors de la vérification d'autorisation pour ${actionType}:`, err);
      return false;
    }
  };
  
  /**
   * Permet d'incrémenter manuellement le compteur d'une action spécifique
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName')
   */
  const incrementUsage = (actionType) => {
    setUserQuotas(prev => {
      let newQuotas;
      
      switch (actionType) {
        case 'scan':
          newQuotas = { ...prev, scanAuto: prev.scanAuto + 1 };
          break;
        case 'manual_entry':
          newQuotas = { ...prev, scanManual: prev.scanManual + 1 };
          break;
        case 'searchName':
          newQuotas = { ...prev, searchName: prev.searchName + 1 };
          break;
        default:
          newQuotas = prev;
      }
      
      console.log(`Incrémentation du quota pour ${actionType}:`, newQuotas);
      return newQuotas;
    });
  };
  
  /**
   * Crée un message d'erreur pour un quota dépassé
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName')
   * @returns {string} - Message d'erreur formaté
   */
  const getQuotaExceededMessage = (actionType) => {
    return subscriptionService.getActionDeniedMessage(actionType, userQuotas, userLimits);
  };
  
  /**
   * Récupère le nombre maximal d'avis que l'utilisateur peut consulter
   * @returns {number} - Nombre maximal d'avis
   */
  const getMaxReviews = () => {
    return userLimits.maxReviewAccess;
  };
  
  // Retourner toutes les fonctions et valeurs nécessaires
  return {
    isAuthorized,
    checkAuthorization,
    incrementUsage,
    getQuotaExceededMessage,
    getMaxReviews,
    userQuotas,
    userLimits,
    loading,
    error,
    refreshUsage: loadUserData
  };
};

export default useSubscriptionPermissions;