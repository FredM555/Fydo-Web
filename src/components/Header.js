// src/components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, LogOut, ChevronDown, Clock, Star, MessageSquare, Heart, Award, Crown, Menu, X as XIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import fydoLogo from '../assets/images/Fydo-logo.png';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const { currentUser, userDetails } = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);
  
  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

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

  // Obtenir l'icône associée au statut de l'utilisateur
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'bronze': return <Award size={12} />;
      case 'argent': case 'silver': return <Award size={12} />;
      case 'or': case 'gold': return <Award size={12} />;
      case 'diamant': case 'diamond': return <Crown size={12} />;
      default: return <Award size={12} />;
    }
  };

  // Vérifier si l'URL actuelle contient "recherche" pour appliquer un style spécifique
  const isSearchPage = location.pathname.includes('recherche');

  // Style commun pour tous les liens de navigation et les boutons connexion/inscription
  const linkStyle = "text-base font-medium text-green-700 hover:text-green-500 px-2 py-1";
  const authBtnStyle = "text-base font-medium px-2 py-1 rounded-lg transition-colors";

  return (
    <nav className={`bg-white shadow-md py-2 fixed top-0 left-0 right-0 z-50 ${isSearchPage ? 'search-page-header' : ''}`}>
      {/* Conteneur principal avec des marges réduites pour s'adapter aux lignes jaunes */}
      <div className="mx-auto" style={{ maxWidth: '1380px', padding: '0 80px' }}>
        <div className="flex justify-between items-center">
          {/* Logo Fydo - aligné exactement avec la ligne jaune à gauche */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={fydoLogo} alt="Fydo Logo" className="h-10 md:h-12" />
            </Link>
          </div>

          {/* Navigation - centrée entre les deux éléments */}
          <div className="hidden lg:flex items-center justify-center space-x-6 flex-1 mx-6">
            <Link to="/concept" className={linkStyle}>Concept</Link>
            <Link to="/fonctionnalites" className={linkStyle}>Fonctionnalités</Link>
            <Link to="/recherche-filtre" className={linkStyle}>Scan/Recherche</Link>
            <Link to="/top-produits" className={linkStyle}>Top Produits</Link>
            <Link to="/abonnements" className={linkStyle}>Abonnements</Link>
            <Link to="/contact" className={linkStyle}>Contact</Link>
          </div>
          
          {/* Profil utilisateur ou Connexion/Inscription - aligné exactement avec la ligne jaune à droite */}
          <div className="flex items-center justify-end">
            {currentUser ? (
              <div ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-full transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="text-green-700 text-xs font-semibold">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-medium">{currentUser.displayName || 'Utilisateur'}</span>
                    
                    {/* Ajout des informations d'avis, favoris et statut - version minimale */}
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      {/* Badge de statut */}
                      {userDetails?.status && (
                        <span className={`inline-flex items-center px-1 rounded-full text-xs font-medium ${getStatusColor(userDetails.status)}`}>
                          {getStatusIcon(userDetails.status)}
                          <span className="capitalize text-xs ml-0.5">{userDetails.status}</span>
                        </span>
                      )}
                      
                      {/* Nombre d'avis et favoris */}
                      <span className="flex items-center text-xs">
                        <Star size={8} className="text-amber-500 mr-0.5" />
                        {userDetails?.reviewCount || 0}
                      </span>
                      <span className="flex items-center text-xs">
                        <Heart size={8} className="text-pink-500 mr-0.5" />
                        {userDetails?.favoriteCount || 0}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={12} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-md z-10">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <User size={12} className="mr-1 text-gray-500" />
                      Voir profil
                    </Link>
                    
                    {/* Reste des options du dropdown */}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className={`${authBtnStyle} text-green-700 hover:bg-green-50`}>
                  Connexion
                </Link>
                <Link to="/signup" className={`${authBtnStyle} bg-green-600 text-white hover:bg-green-700`}>
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile - masqué en mode desktop */}
          <button className="lg:hidden mobile-menu-button" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <XIcon className="h-5 w-5 text-green-700" /> : <Menu className="h-5 w-5 text-green-700" />}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-12 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg">
            <div className="px-4 py-3 space-y-3 divide-y divide-gray-200">
              <div className="space-y-2">
                <Link to="/concept" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Concept</Link>
                <Link to="/fonctionnalites" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Fonctionnalités</Link>
                <Link to="/recherche-filtre" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Scan/Recherche</Link>
                <Link to="/top-produits" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Top Produits</Link>
                <Link to="/abonnements" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Abonnements</Link>
                <Link to="/contact" className="block text-base font-medium text-green-700 hover:text-green-500 py-1.5">Contact</Link>
              </div>
              
              {/* Reste du contenu mobile */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;