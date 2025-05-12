// src/services/authService.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
  } from "firebase/auth";
import { auth } from "../firebase";
import { supabase, syncUserWithSupabase } from '../supabaseClient';
  
// Créer un nouvel utilisateur
export const registerUser = async (email, password, displayName, addressInfo = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(user, { displayName });
    
    // Synchroniser avec Supabase et inclure les informations d'adresse
    await syncUserWithDatabase(user, addressInfo);
    
    return user;
  } catch (error) {
    throw error;
  }
};
  
// Connecter un utilisateur
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
  
// Déconnecter l'utilisateur
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};
  
// Réinitialiser le mot de passe
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};
  
// Observer l'état de l'authentification
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
  
// Fonction pour synchroniser l'utilisateur avec PostgreSQL via Supabase
const syncUserWithDatabase = async (user, addressInfo = {}) => {
  try {
    // Utiliser la fonction de synchronisation de supabaseClient
    if (typeof syncUserWithSupabase === 'function') {
      return await syncUserWithSupabase(user, addressInfo);
    }
    
    // Fallback si syncUserWithSupabase n'est pas disponible
    // Exemple d'appel API vers un backend qui gère la synchronisation avec PostgreSQL
    const token = await user.getIdToken();
    const response = await fetch('https://votre-api.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        subscription_type: 'Gratuit', // Valeur par défaut
        user_type: 'Visiteur', // Valeur par défaut
        // Ajouter les informations d'adresse
        country: addressInfo.country || null,
        city: addressInfo.city || null,
        postal_code: addressInfo.postalCode || null
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la synchronisation avec la base de données:", error);
    // Gérer l'erreur silencieusement pour ne pas interrompre l'inscription
  }
};

// Mettre à jour les informations d'adresse d'un utilisateur
export const updateUserAddress = async (user, addressInfo) => {
  try {
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }
    
    // Utiliser la fonction Supabase si disponible
    if (typeof supabase !== 'undefined') {
      return await supabase.from('users')
        .update({
          country: addressInfo.country,
          city: addressInfo.city,
          postal_code: addressInfo.postalCode,
          updated_at: new Date()
        })
        .eq('firebase_uid', user.uid);
    }
    
    // Fallback si supabase n'est pas disponible
    const token = await user.getIdToken();
    const response = await fetch('https://votre-api.com/users/address', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firebase_uid: user.uid,
        country: addressInfo.country,
        city: addressInfo.city,
        postal_code: addressInfo.postalCode
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'adresse:", error);
    throw error;
  }
};

// Récupérer les informations d'adresse d'un utilisateur
export const getUserAddress = async (user) => {
  try {
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }
    
    // Utiliser la fonction Supabase si disponible
    if (typeof supabase !== 'undefined') {
      const { data, error } = await supabase
        .from('users')
        .select('country, city, postal_code')
        .eq('firebase_uid', user.uid)
        .single();
        
      if (error) throw error;
      
      return {
        country: data.country,
        city: data.city,
        postalCode: data.postal_code
      };
    }
    
    // Fallback si supabase n'est pas disponible
    const token = await user.getIdToken();
    const response = await fetch(`https://votre-api.com/users/${user.uid}/address`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'adresse:", error);
    throw error;
  }
};