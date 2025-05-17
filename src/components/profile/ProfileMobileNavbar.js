// src/components/profile/ProfileMobileNavbar.js
import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  KeyRound, 
  Calendar, 
  History, 
  LogOut, 
  Star,
  Heart,
  Shield,
  MoreVertical,
  Award,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileMobileNavbar = ({ currentUser, title, isMenuOpen, toggleMenu, onLogout, loading }) => {
  const { userDetails } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);
  const currentPath = location.pathname;

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isMenuOpen) toggleMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, toggleMenu]);

  // Vérifier si le chemin actuel correspond au chemin de navigation
  const isActivePath = (path) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = userDetails && userDetails.userType === 'Admin';

  // Obtenir la couleur associée au statut de l'utilisateur
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'bronze': return 'bg-amber-600 text-white';
      case 'argent': case 'silver': return 'bg-gray-400 text-white';
      case 'or': case 'gold': return 'bg-yellow-500 text-white';
      case 'diamant': case 'diamond': return 'bg-blue-400 text-white';
      default: return 'bg-amber-600 text-white';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Barre de navigation fixe en haut */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          {/* Partie gauche: info utilisateur */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-bold">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-800">{title}</div>
              <div className="flex items-center space-x-2">
                {userDetails?.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium user-badge ${getStatusColor(userDetails.status)}`}>
                    <Award size={10} className="mr-1" />
                    <span className="capitalize">{userDetails.status}</span>
                  </span>
                )}
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Star size={10} className="text-amber-500 mr-1" />
                    {userDetails?.reviewCount || 0}
                  </span>
                  <span className="flex items-center">
                    <Heart size={10} className="text-pink-500 mr-1" />
                    {userDetails?.favoriteCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Partie droite: bouton menu */}
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Menu utilisateur"
          >
            {isMenuOpen ? <X size={20} /> : <MoreVertical size={20} />}
          </button>
        </div>
      </div>

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-full max-w-xs bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden profile-dropdown mobile-nav-menu">
          <div className="py-1">
            <Link 
              to="/profile" 
              className={`flex items-center px-4 py-3 ${isActivePath('/profile') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <User size={18} className="mr-3 shrink-0" />
              <span>Profil</span>
            </Link>
            
            <Link 
              to="/edit-profile" 
              className={`flex items-center px-4 py-3 ${isActivePath('/edit-profile') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <Settings size={18} className="mr-3 shrink-0" />
              <span>Modifier profil</span>
            </Link>
            
            <Link 
              to="/change-password" 
              className={`flex items-center px-4 py-3 ${isActivePath('/change-password') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <KeyRound size={18} className="mr-3 shrink-0" />
              <span>Changer mot de passe</span>
            </Link>
            
            <Link 
              to="/subscription/history" 
              className={`flex items-center px-4 py-3 ${isActivePath('/subscription/history') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <Calendar size={18} className="mr-3 shrink-0" />
              <span>Abonnements</span>
            </Link>
            
            <Link 
              to="/historique-produits" 
              className={`flex items-center px-4 py-3 ${isActivePath('/historique-produits') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <History size={18} className="mr-3 shrink-0" />
              <span>Historique produits</span>
            </Link>
            
            <Link 
              to="/mes-favoris" 
              className={`flex items-center px-4 py-3 ${isActivePath('/mes-favoris') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <Heart size={18} className="mr-3 shrink-0" />
              <span>Mes favoris</span>
            </Link>
            <Link 
              to="/mes-tickets" 
              className={`flex items-center px-4 py-3 ${isActivePath('/mes-avis') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <Star size={18} className="mr-3 shrink-0" />
              <span>Mes tickets</span>
            </Link>
            
              <Link 
              to="/mes-avis" 
              className={`flex items-center px-4 py-3 ${isActivePath('/mes-avis') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={toggleMenu}
            >
              <Star size={18} className="mr-3 shrink-0" />
              <span>Mes avis</span>
            </Link>
            
            {/* Lien d'administration - visible uniquement pour les administrateurs */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center px-4 py-3 ${isActivePath('/admin') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={toggleMenu}
              >
                <Shield size={18} className="mr-3 shrink-0 text-blue-600" />
                <span className="text-blue-600 font-medium">Administration</span>
              </Link>
            )}
            
            <div className="h-px bg-gray-200 my-1"></div>
            
            <button 
              onClick={() => {
                toggleMenu();
                onLogout();
              }}
              className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left"
              disabled={loading}
            >
              <LogOut size={18} className="mr-3 shrink-0" />
              <span>{loading ? 'Déconnexion...' : 'Se déconnecter'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMobileNavbar;