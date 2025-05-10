// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "../firebase";
import { supabase, syncUserWithSupabase, getUserSubscription } from '../supabaseClient';
import { loginUser, registerUser, resetPassword } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour se connecter
  const login = async (email, password) => {
    try {
      const user = await loginUser(email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fonction pour s'inscrire
  const signup = async (email, password, displayName) => {
    try {
      const user = await registerUser(email, password, displayName);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserDetails(null);
      setSubscription(null);
      setSubscriptionPlan(null);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const forgotPassword = async (email) => {
    try {
      await resetPassword(email);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fonction pour récupérer les détails utilisateur depuis Supabase
  const fetchUserDetails = async (firebaseUser) => {
    try {
      // Synchroniser l'utilisateur avec Supabase
      const supabaseUser = await syncUserWithSupabase(firebaseUser);
      
      if (supabaseUser) {
        setUserDetails({
          id: supabaseUser.id,
          email: supabaseUser.email,
          displayName: supabaseUser.display_name,
          userType: supabaseUser.user_type,
          createdAt: supabaseUser.created_at,
          // Ajouter les nouveaux champs de compteurs
          reviewCount: supabaseUser.review_count || 0,
          favoriteCount: supabaseUser.favorite_count || 0,
          searchByNameCount: supabaseUser.search_by_name_count || 0,
          manualSearchCount: supabaseUser.manual_search_count || 0,
          scanCount: supabaseUser.scan_count || 0,
          status: supabaseUser.status || 'bronze',
          isSuspended: supabaseUser.is_suspended || false,
          subscription_name: supabaseUser.subscription_name || 'Gratuit'
        });
        
        // Récupérer les informations d'abonnement
        const { subscription: userSubscription, plan } = await getUserSubscription(firebaseUser.uid);
        setSubscription(userSubscription);
        setSubscriptionPlan(plan);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails utilisateur:", error);
      setError("Impossible de récupérer les détails de votre compte.");
    }
  };

// Ajouter une fonction de vérification si l'utilisateur est admin
const isAdmin = () => {
  return userDetails && userDetails.userType === 'Admin';
};

  // Observer les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserDetails(user);
      } else {
        setUserDetails(null);
        setSubscription(null);
        setSubscriptionPlan(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = () => {
    if (!subscription) return false;
    
    // Vérifier si l'abonnement est actif
    if (!subscription.is_active) return false;
    
    // Vérifier si la date d'expiration n'est pas passée
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    return endDate > now;
  };

  // Vérifier si l'utilisateur peut effectuer une action basée sur son abonnement
  const canPerformAction = async (actionType) => {
    if (!currentUser) return false;
    
    try {
      // Récupérer les informations d'abonnement les plus récentes
      const { subscription: latestSubscription, plan } = await getUserSubscription(currentUser.uid);
      
      if (!latestSubscription || !plan) {
        // Utilisateur sur plan gratuit
        // Vérifier les restrictions du plan gratuit
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Gratuit')
          .single();
          
        // Vérifier selon le type d'action
        switch (actionType) {
          case 'upload_receipt':
            // Vérifier si l'utilisateur a atteint son quota de tickets
            const { data: receipts, error: receiptError } = await supabase
              .from('receipts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userDetails.id);
              
            if (receiptError) throw receiptError;
            
            return receipts.length < (freePlan?.max_receipts || 0);
            
          case 'upload_product_image':
            // Vérifier si l'utilisateur a atteint son quota de produits
            const { data: productImages, error: productError } = await supabase
              .from('product_images')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userDetails.id);
              
            if (productError) throw productError;
            
            return productImages.length < (freePlan?.max_products || 0);
            
          default:
            return false;
        }
      }
      
      // Utilisateur avec un abonnement
      // Vérifier si l'abonnement est actif
      if (!latestSubscription.is_active) return false;
      
      // Vérifier si la date d'expiration n'est pas passée
      const now = new Date();
      const endDate = new Date(latestSubscription.end_date);
      
      if (endDate <= now) return false;
      
      // Vérifier selon le type d'action
      switch (actionType) {
        case 'upload_receipt':
          // Vérifier si l'utilisateur a atteint son quota de tickets pour ce mois
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const { data: receipts, error: receiptError } = await supabase
            .from('receipts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userDetails.id)
            .gte('upload_date', firstDayOfMonth.toISOString());
            
          if (receiptError) throw receiptError;
          
          return receipts.length < (plan?.max_receipts || 0);
          
        case 'upload_product_image':
          // Vérifier si l'utilisateur a atteint son quota de produits
          const { data: productImages, error: productError } = await supabase
            .from('product_images')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userDetails.id);
            
          if (productError) throw productError;
          
          return productImages.length < (plan?.max_products || 0);
          
        default:
          return true;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des permissions:", error);
      return false;
    }
  };

  const value = {
    currentUser,
    userDetails,
    subscription,
    subscriptionPlan,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    hasActiveSubscription,
    canPerformAction,
    refreshUserDetails: () => fetchUserDetails(currentUser),
    isAdmin // Ajouter cette fonction au contexte
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};