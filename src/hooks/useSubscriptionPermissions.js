// src/hooks/useSubscriptionPermissions.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { getUserHistory } from '../services/productService';

/**
 * Hook personnalisé pour gérer les autorisations selon l'abonnement utilisateur
 * Fournit les fonctions pour vérifier si un utilisateur peut effectuer une action
 * et gérer les quotas d'utilisation
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
    canAccessDetailedInfo: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Récupération du contexte d'authentification
  const { currentUser, userDetails, subscription, subscriptionPlan } = useAuth();
  
  // Effet pour initialiser les données
  useEffect(() => {
    if (currentUser && userDetails) {
      loadUserLimits();
      loadUserUsage();
    }
  }, [currentUser, userDetails]);
  
  /**
   * Charge les limites d'utilisation selon l'abonnement de l'utilisateur
   */
  const loadUserLimits = async () => {
    try {
      setLoading(true);
      
      // Si on a déjà un plan d'abonnement dans le contexte Auth
      if (subscriptionPlan) {
        setUserLimits({
          maxScanAuto: subscriptionPlan.max_scan_auto || 0,
          maxScanManual: subscriptionPlan.max_scan_manuel || 0,
          maxSearchName: subscriptionPlan.max_recherche || 0,
          maxReviewAccess: subscriptionPlan.max_consult_avis || 0,
          canAccessFavorites: subscriptionPlan.can_favorite || false,
          canAccessHistory: subscriptionPlan.can_history || false,
          canAccessDetailedInfo: subscriptionPlan.can_access_detailed_info || false
        });
        return;
      }
      
      // Sinon, récupérer le plan gratuit par défaut
      const { data: freePlan, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuit')
        .single();
        
      if (error) throw error;
      
      setUserLimits({
        maxScanAuto: freePlan.max_scan_auto || 0,
        maxScanManual: freePlan.max_scan_manuel || 0,
        maxSearchName: freePlan.max_recherche || 0,
        maxReviewAccess: freePlan.max_consult_avis || 0,
        canAccessFavorites: freePlan.can_favorite || false,
        canAccessHistory: freePlan.can_history || false,
        canAccessDetailedInfo: freePlan.can_access_detailed_info || false
      });
    } catch (err) {
      console.error("Erreur lors du chargement des limites d'utilisation:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Charge l'utilisation actuelle de l'utilisateur pour aujourd'hui
   */
  const loadUserUsage = async () => {
    if (!userDetails || !userDetails.id) return;
    
    try {
      setLoading(true);
      
      // Calculer le début de la journée
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Récupérer l'historique d'aujourd'hui
      const { data, error } = await getUserHistory(userDetails.id, 1000, 0);
      
      if (error) throw error;
      
      if (data && data.data) {
        // Filtrer pour ne garder que les interactions d'aujourd'hui
        const todayInteractions = data.data.filter(item => {
          const interactionDate = new Date(item.interaction_date);
          return interactionDate >= today;
        });
        
        // Compter les différents types d'interactions
        const scanAuto = todayInteractions.filter(item => item.interaction_type === 'scan').length;
        const scanManual = todayInteractions.filter(item => item.interaction_type === 'manual_entry').length;
        const searchName = todayInteractions.filter(item => item.interaction_type === 'searchName').length;
        
        setUserQuotas({
          scanAuto,
          scanManual,
          searchName
        });
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisation:", err);
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
    
    switch (actionType) {
      case 'scan':
        return userQuotas.scanAuto < userLimits.maxScanAuto;
      case 'manual_entry':
        return userQuotas.scanManual < userLimits.maxScanManual;
      case 'searchName':
        return userQuotas.searchName < userLimits.maxSearchName;
      case 'view_reviews':
        return true; // Toujours autorisé, mais le nombre peut être limité
      case 'favorites':
        return userLimits.canAccessFavorites;
      case 'history':
        return userLimits.canAccessHistory;
      case 'detailed_info':
        return userLimits.canAccessDetailedInfo;
      default:
        return false;
    }
  };
  
  /**
   * Permet d'incrémenter manuellement le compteur d'une action spécifique
   * Utile après un ajout réussi à l'historique
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName')
   */
  const incrementUsage = (actionType) => {
    setUserQuotas(prev => {
      switch (actionType) {
        case 'scan':
          return { ...prev, scanAuto: prev.scanAuto + 1 };
        case 'manual_entry':
          return { ...prev, scanManual: prev.scanManual + 1 };
        case 'searchName':
          return { ...prev, searchName: prev.searchName + 1 };
        default:
          return prev;
      }
    });
  };
  
  /**
   * Crée un message d'erreur pour un quota dépassé
   * @param {string} actionType - Type d'action ('scan', 'manual_entry', 'searchName')
   * @returns {string} - Message d'erreur formaté
   */
  const getQuotaExceededMessage = (actionType) => {
    let actionName = '';
    let currentUsage = 0;
    let maxLimit = 0;
    
    switch (actionType) {
      case 'scan':
        actionName = 'scans avec l\'appareil photo';
        currentUsage = userQuotas.scanAuto;
        maxLimit = userLimits.maxScanAuto;
        break;
      case 'manual_entry':
        actionName = 'recherches par code-barres';
        currentUsage = userQuotas.scanManual;
        maxLimit = userLimits.maxScanManual;
        break;
      case 'searchName':
        actionName = 'recherches par nom';
        currentUsage = userQuotas.searchName;
        maxLimit = userLimits.maxSearchName;
        break;
      default:
        actionName = 'actions';
        break;
    }
    
    return `Quota quotidien dépassé: ${currentUsage}/${maxLimit} ${actionName}. Passez à un abonnement supérieur pour plus d'accès.`;
  };
  
  /**
   * Récupère le nombre maximal d'avis que l'utilisateur peut consulter
   * @returns {number} - Nombre maximal d'avis
   */
  const getMaxReviews = () => {
    return userLimits.maxReviewAccess;
  };
  
  return {
    isAuthorized,
    incrementUsage,
    getQuotaExceededMessage,
    getMaxReviews,
    userQuotas,
    userLimits,
    loading,
    error,
    refreshUsage: loadUserUsage
  };
};

export default useSubscriptionPermissions;