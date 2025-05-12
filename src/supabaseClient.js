// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Synchronise un utilisateur Firebase avec Supabase
 * @param {Object} firebaseUser - L'utilisateur Firebase
 * @param {Object} additionalInfo - Informations supplémentaires comme les données d'adresse
 * @returns {Promise<Object>} - L'utilisateur créé ou mis à jour dans Supabase
 */
export const syncUserWithSupabase = async (firebaseUser, additionalInfo = {}) => {
  if (!firebaseUser) return null;

  try {
    // Vérifier si l'utilisateur existe déjà dans Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*') // Utiliser SELECT * pour récupérer tous les champs
      .eq('firebase_uid', firebaseUser.uid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      // Mettre à jour les informations si nécessaire
      const updates = {
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || existingUser.display_name,
        updated_at: new Date()
      };

      // Ajouter les champs d'adresse s'ils sont fournis
      if (additionalInfo.country) updates.country = additionalInfo.country;
      if (additionalInfo.city) updates.city = additionalInfo.city;
      if (additionalInfo.postalCode) updates.postal_code = additionalInfo.postalCode;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('firebase_uid', firebaseUser.uid)
        .select('*'); // Assurez-vous de sélectionner tous les champs après la mise à jour

      if (updateError) throw updateError;
      
      return updatedUser[0];
    } else {
      // Créer un nouvel utilisateur dans Supabase
      const newUser = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        user_type: 'Visiteur',
        created_at: new Date(),
        updated_at: new Date(),
        review_count: 0,
        favorite_count: 0,
        search_by_name_count: 0,
        manual_search_count: 0,
        scan_count: 0,
        status: 'bronze',
        is_suspended: false,
        // Ajouter les champs d'adresse s'ils sont fournis
        country: additionalInfo.country || null,
        city: additionalInfo.city || null,
        postal_code: additionalInfo.postalCode || null
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select('*');

      if (createError) throw createError;
      
      return createdUser[0];
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation avec Supabase:", error);
    throw error;
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

/**
 * Met à jour les informations d'adresse d'un utilisateur
 * @param {string} firebaseUid - L'identifiant Firebase de l'utilisateur
 * @param {Object} addressInfo - Les informations d'adresse (country, city, postalCode)
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const updateUserAddress = async (firebaseUid, addressInfo) => {
  if (!firebaseUid) return { success: false, error: 'Identifiant utilisateur requis' };
  
  try {
    // Récupérer l'ID Supabase de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();
      
    if (userError) throw userError;
    
    // Préparer les champs à mettre à jour
    const updates = {
      updated_at: new Date()
    };
    
    if (addressInfo.country !== undefined) updates.country = addressInfo.country;
    if (addressInfo.city !== undefined) updates.city = addressInfo.city;
    if (addressInfo.postalCode !== undefined) updates.postal_code = addressInfo.postalCode;
    
    // Mettre à jour l'utilisateur
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userData.id)
      .select('*');
      
    if (error) throw error;
    
    return { success: true, user: data[0] };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'adresse:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Vérifie si l'utilisateur a atteint son quota de tickets de caisse
 * @param {string} firebaseUid - L'identifiant Firebase de l'utilisateur
 * @returns {Promise<boolean>} - True si le quota est atteint
 */
export const hasReachedReceiptQuota = async (firebaseUid) => {
  try {
    const { subscription, plan } = await getUserSubscription(firebaseUid);
    
    if (!plan) return true; // Par sécurité, considérer le quota comme atteint
    
    // Si l'utilisateur n'a pas d'abonnement actif, vérifier le plan gratuit
    const maxReceipts = plan.max_receipts || 0;
    
    // Si le quota est illimité
    if (maxReceipts < 0) return false;
    
    // 1. Récupérer l'ID Supabase de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();
      
    if (userError) throw userError;
    
    // 2. Compter les tickets de caisse de l'utilisateur pour le mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { count, error: countError } = await supabase
      .from('receipts')
      .select('id', { count: 'exact' })
      .eq('user_id', userData.id)
      .gte('upload_date', firstDayOfMonth.toISOString());
      
    if (countError) throw countError;
    
    return count >= maxReceipts;
  } catch (error) {
    console.error('Erreur lors de la vérification du quota:', error);
    return true; // Par sécurité, considérer le quota comme atteint
  }
};