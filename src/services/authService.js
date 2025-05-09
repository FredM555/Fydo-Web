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
  
  // Créer un nouvel utilisateur
  export const registerUser = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mettre à jour le profil avec le nom d'affichage
      await updateProfile(user, { displayName });
      
      // Ici, vous pouvez ajouter du code pour synchroniser avec PostgreSQL
      // via une API (à implémenter plus tard)
      await syncUserWithDatabase(user);
      
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
  
  // Fonction pour synchroniser l'utilisateur avec PostgreSQL (à implémenter)
  const syncUserWithDatabase = async (user) => {
    // Exemple d'appel API vers un backend qui gère la synchronisation avec PostgreSQL
    // Cela sera implémenté plus tard quand vous configurerez Supabase
    try {
      // Ceci est un exemple - vous aurez besoin d'implémenter cette API
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
          user_type: 'Visiteur' // Valeur par défaut
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec la base de données:", error);
      // Gérer l'erreur silencieusement pour ne pas interrompre l'inscription
    }
  };