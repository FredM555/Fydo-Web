// src/components/profile/ProfileLayout.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSidebar from './ProfileSidebar';

/**
 * Composant de mise en page principal pour toutes les pages de profil
 * Garantit une structure cohérente et évite les sauts visuels lors des changements d'onglets
 */
const ProfileLayout = ({ children, title }) => {
  const { currentUser, logout } = useAuth(); // Modifié pour correspondre au nom utilisé dans AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Gestion de la déconnexion
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // Utilisation de la fonction logout du contexte
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redirection si l'utilisateur n'est pas connecté
  if (!currentUser) {
    navigate('/login', { state: { redirectTo: location.pathname } });
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 mb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Menu latéral réutilisable - position fixe */}
        <div className="md:w-64 md:shrink-0 w-full">
          <ProfileSidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            loading={loading} 
          />
        </div>
        
        {/* Contenu principal avec une hauteur minimale fixe pour éviter les sauts */}
        <div className="flex-1 w-full">
          <div className="bg-white p-6 rounded-lg shadow-md min-h-[550px]">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            
            {/* Contenu enfant (les différentes pages de profil) */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;