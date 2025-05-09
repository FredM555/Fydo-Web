// src/services/subscriptionService.js
import { supabase } from '../supabaseClient';
import { calculateEndDate } from '../utils/formatters';

/**
 * Récupère tous les plans d'abonnement actifs
 * @returns {Promise<Array>} Liste des plans d'abonnement
 */
export const getAllSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des plans:', error.message);
    throw error;
  }
};

/**
 * Récupère les détails d'un plan d'abonnement spécifique
 * @param {string} planId - ID du plan d'abonnement
 * @returns {Promise<Object>} Détails du plan d'abonnement
 */
export const getSubscriptionPlan = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du plan:', error.message);
    throw error;
  }
};

/**
 * Crée un nouvel abonnement pour un utilisateur
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @param {string} planId - ID du plan d'abonnement
 * @param {string} billingCycle - Cycle de facturation ('monthly' ou 'yearly')
 * @param {string} paymentMethod - Méthode de paiement utilisée
 * @param {boolean} autoRenew - Activer le renouvellement automatique
 * @returns {Promise<Object>} Détails de l'abonnement créé
 */
export const createSubscription = async (
  userId, 
  firebaseUid, 
  planId, 
  billingCycle = 'monthly', 
  paymentMethod = 'card', 
  autoRenew = true
) => {
  try {
    // 1. Récupérer les détails du plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;
    
    // 2. Calculer les dates de début et de fin
    const startDate = new Date();
    let durationDays = plan.duration_days;
    
    // Si abonnement annuel, multiplier la durée par 12
    if (billingCycle === 'yearly') {
      durationDays *= 12;
    }
    
    const endDate = calculateEndDate(durationDays, startDate);
    
    // 3. Désactiver les abonnements actifs existants
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ is_active: false, is_auto_renew: false })
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (updateError) throw updateError;
    
    // 4. Créer le nouvel abonnement
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([
        {
          user_id: userId,
          firebase_uid: firebaseUid,
          plan_id: planId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
          payment_status: 'completed', // Dans un environnement réel, ce serait 'pending' jusqu'à confirmation
          payment_method: paymentMethod,
          is_auto_renew: autoRenew
        }
      ])
      .select()
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    // 5. Mettre à jour le type d'utilisateur
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ user_type: plan.name })
      .eq('id', userId);
    
    if (userUpdateError) throw userUpdateError;
    
    return subscription;
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error.message);
    throw error;
  }
};

/**
 * Annule un abonnement utilisateur (désactive le renouvellement automatique)
 * @param {string} subscriptionId - ID de l'abonnement
 * @param {string} userId - ID Supabase de l'utilisateur
 * @returns {Promise<Object>} Détails de l'abonnement mis à jour
 */
export const cancelSubscription = async (subscriptionId, userId) => {
  try {
    // 1. Mettre à jour l'abonnement
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({ 
        is_auto_renew: false
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId) // Sécurité pour s'assurer que l'utilisateur est bien le propriétaire
      .select()
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    return subscription;
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error.message);
    throw error;
  }
};

/**
 * Réactive un abonnement (active le renouvellement automatique)
 * @param {string} subscriptionId - ID de l'abonnement
 * @param {string} userId - ID Supabase de l'utilisateur
 * @returns {Promise<Object>} Détails de l'abonnement mis à jour
 */
export const reactivateSubscription = async (subscriptionId, userId) => {
  try {
    // 1. Mettre à jour l'abonnement
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({ 
        is_auto_renew: true
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    return subscription;
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'abonnement:', error.message);
    throw error;
  }
};

/**
 * Change le plan d'abonnement d'un utilisateur
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} firebaseUid - ID Firebase de l'utilisateur
 * @param {string} newPlanId - ID du nouveau plan d'abonnement
 * @param {string} billingCycle - Cycle de facturation ('monthly' ou 'yearly')
 * @returns {Promise<Object>} Détails du nouvel abonnement
 */
export const changePlan = async (userId, firebaseUid, newPlanId, billingCycle = 'monthly') => {
  try {
    // Utiliser la fonction de création d'abonnement
    // Cela va automatiquement désactiver les abonnements existants
    const newSubscription = await createSubscription(
      userId, 
      firebaseUid, 
      newPlanId, 
      billingCycle
    );
    
    return newSubscription;
  } catch (error) {
    console.error('Erreur lors du changement de plan:', error.message);
    throw error;
  }
};

/**
 * Récupère l'historique des abonnements d'un utilisateur
 * @param {string} userId - ID Supabase de l'utilisateur
 * @returns {Promise<Array>} Historique des abonnements
 */
export const getSubscriptionHistory = async (userId) => {
  try {
    // Récupérer tous les abonnements de l'utilisateur
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des abonnements:', error.message);
    throw error;
  }
};

/**
 * Vérifie si un utilisateur peut effectuer une action en fonction de son plan
 * @param {string} userId - ID Supabase de l'utilisateur
 * @param {string} actionType - Type d'action ('upload_receipt', 'upload_product_image', etc.)
 * @returns {Promise<boolean>} True si l'action est autorisée
 */
export const canPerformAction = async (userId, actionType) => {
  try {
    // 1. Récupérer l'abonnement actif de l'utilisateur
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('end_date', { ascending: false })
      .limit(1)
      .single();
    
    // Si pas d'abonnement, vérifier le plan gratuit
    if (subscriptionError && subscriptionError.code === 'PGRST116') {
      const { data: freePlan, error: freePlanError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuit')
        .single();
      
      if (freePlanError) return false;
      
      // Vérifier selon le type d'action
      switch (actionType) {
        case 'upload_receipt':
          // Vérifier le nombre de tickets ce mois-ci
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const { count: receiptCount, error: receiptError } = await supabase
            .from('receipts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .gte('upload_date', firstDayOfMonth.toISOString());
          
          if (receiptError) throw receiptError;
          
          return receiptCount < (freePlan.max_receipts || 0);
        
        case 'upload_product_image':
          // Vérifier le nombre de produits total
          const { count: productCount, error: productError } = await supabase
            .from('product_images')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
          
          if (productError) throw productError;
          
          return productCount < (freePlan.max_products || 0);
        
        default:
          return false;
      }
    }
    
    if (subscriptionError) throw subscriptionError;
    
    // Vérifier si l'abonnement est toujours valide
    const now = new Date();
    const endDate = new Date(subscriptionData.end_date);
    
    if (now > endDate) return false;
    
    const plan = subscriptionData.subscription_plans;
    
    // Vérifier selon le type d'action
    switch (actionType) {
      case 'upload_receipt':
        // Vérifier le nombre de tickets ce mois-ci
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { count: receiptCount, error: receiptError } = await supabase
          .from('receipts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('upload_date', firstDayOfMonth.toISOString());
        
        if (receiptError) throw receiptError;
        
        return receiptCount < (plan.max_receipts || 0);
      
      case 'upload_product_image':
        // Vérifier le nombre de produits total
        const { count: productCount, error: productError } = await supabase
          .from('product_images')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);
        
        if (productError) throw productError;
        
        return productCount < (plan.max_products || 0);
      
      default:
        return true;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error.message);
    return false;
  }
};

/**
 * Récupère les détails de l'abonnement actif d'un utilisateur
 * @param {string} firebaseUid - L'identifiant Firebase de l'utilisateur
 * @returns {Promise<Object>} - L'abonnement actif et les détails du plan
 */
export const getUserSubscription = async (firebaseUid) => {
    if (!firebaseUid) return { subscription: null, plan: null };
    
    try {
      // 1. Récupérer l'ID Supabase de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', firebaseUid)
        .single();
        
      if (userError) throw userError;
      
      // 2. Récupérer l'abonnement actif
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();
        
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }
      
      if (!subscriptionData) {
        // Récupérer le plan gratuit par défaut
        const { data: freePlan, error: freePlanError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Gratuit')
          .single();
          
        if (freePlanError) {
          return { subscription: null, plan: null };
        }
        
        return { subscription: null, plan: freePlan };
      }
      
      // 3. Récupérer les détails du plan
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionData.plan_id)
        .single();
        
      if (planError) throw planError;
      
      return { subscription: subscriptionData, plan: planData };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return { subscription: null, plan: null };
    }
  };