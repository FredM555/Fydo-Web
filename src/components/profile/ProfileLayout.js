// src/components/profile/ProfileLayout.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSidebar from './ProfileSidebar';
import ProfileMobileNavbar from './ProfileMobileNavbar';
import ProfileNavigationTabs from './ProfileNavigationTabs';

/**
 * Composant de mise en page principal pour toutes les pages de profil
 * Garantit une structure cohérente et évite les sauts visuels lors des changements d'onglets
 */
const ProfileLayout = ({ children, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gestion de la déconnexion
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 mb-20 md:mb-12 has-bottom-nav">
      {/* Barre de navigation mobile visible uniquement sur petits écrans */}
      <div className="md:hidden mb-4">
        <ProfileMobileNavbar 
          currentUser={currentUser}
          title={title}
          isMenuOpen={mobileMenuOpen}
          toggleMenu={toggleMobileMenu}
          onLogout={handleLogout}
          loading={loading}
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Menu latéral réutilisable - visible uniquement sur desktop */}
        <div className="hidden md:block md:w-64 md:shrink-0">
          <ProfileSidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            loading={loading} 
          />
        </div>
        
        {/* Contenu principal avec une hauteur minimale fixe pour éviter les sauts */}
        <div className="flex-1 w-full">
          <div className="bg-white p-6 rounded-lg shadow-md min-h-[550px] profile-content">
            {/* Titre visible uniquement sur desktop, car déjà inclus dans la navbar mobile */}
            <h2 className="text-2xl font-bold mb-6 hidden md:block">{title}</h2>
            
            {/* Contenu enfant (les différentes pages de profil) */}
            {children}
          </div>
        </div>
      </div>
      
      {/* Navigation par onglets en bas d'écran (uniquement sur mobile) */}
      <div className="md:hidden">
        <ProfileNavigationTabs />
      </div>
    </div>
  );
};

export default ProfileLayout;