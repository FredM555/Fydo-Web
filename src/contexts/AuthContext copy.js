// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Si l'utilisateur est connecté, récupérer ses informations supplémentaires
      if (user) {
        fetchUserDetails(user);
      } else {
        setUserDetails(null);
      }
    });

    return unsubscribe;
  }, []);

  // Fonction pour récupérer les détails de l'utilisateur depuis PostgreSQL
  const fetchUserDetails = async (user) => {
    try {
      // Cette fonction sera implémentée quand vous configurerez Supabase
      // Pour l'instant, nous utilisons des valeurs factices
      setUserDetails({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userType: 'Visiteur', // Valeur par défaut
        subscriptionType: 'Gratuit', // Valeur par défaut
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des détails utilisateur:", error);
    }
  };

  // Fonction de déconnexion implémentée dans le contexte
  const logoutUser = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userDetails,
    loading,
    logoutUser // Exporter la fonction de déconnexion
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};