// src/components/Header.js - Modification pour utiliser l'image du logo
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, LogOut, ChevronDown, Clock, Star, MessageSquare, Heart, Award, Crown, Menu, X as XIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

  return (
    <nav className={`bg-white shadow-md py-2 fixed top-0 left-0 right-0 z-50 ${isSearchPage ? 'search-page-header' : ''}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo Fydo - Utilisation de l'image */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {/* Remplacer le texte et le SVG par l'image du logo */}
            <img 
              src="/images/fydo-logo.png" 
              alt="Fydo Logo" 
              className="h-10 md:h-12" 
            />
          </Link>
        </div>

        {/* Bouton du menu mobile */}
        <button className="lg:hidden mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <XIcon className="h-5 w-5 text-green-700" /> : <Menu className="h-5 w-5 text-green-700" />}
        </button>

        {/* Liens de navigation desktop - version horizontale compacte */}
        <div className="hidden lg:flex space-x-4 text-sm">
          <Link to="/concept" className="text-green-700 hover:text-green-500 px-2 py-1">Concept</Link>
          <Link to="/fonctionnalites" className="text-green-700 hover:text-green-500 px-2 py-1">Fonctionnalités</Link>
          <Link to="/recherche-filtre" className="text-green-700 hover:text-green-500 px-2 py-1">Scan/Recherche</Link>
          <Link to="/top-produits" className="text-green-700 hover:text-green-500 px-2 py-1">Top Produits</Link>
          <Link to="/abonnements" className="text-green-700 hover:text-green-500 px-2 py-1">Abonnements</Link>
          <Link to="/contact" className="text-green-700 hover:text-green-500 px-2 py-1">Contact</Link>
        </div>
        
        {/* Partie utilisateur desktop - version compacte */}
        <div className="hidden lg:block relative" ref={dropdownRef}>
          {currentUser ? (
            <div>
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
                  <span className="text-xs font-medium">{currentUser.displayName || 'Utilisateur'}</span>
                  
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
                  
                  <Link 
                    to="/historique-produits" 
                    className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Clock size={12} className="mr-1 text-gray-500" />
                    Historique produits
                  </Link>
                  
                  <Link 
                    to="/mes-favoris" 
                    className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <Star size={12} className="mr-1 text-gray-500" />
                    Mes favoris
                  </Link>
                  
                  <Link 
                    to="/mes-avis" 
                    className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare size={12} className="mr-1 text-gray-500" />
                    Mes avis
                  </Link>
                  
                  <hr className="border-gray-200" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-50"
                  >
                    <LogOut size={12} className="mr-1" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-1">
              <Link to="/login" className="px-2 py-1 text-xs text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                Connexion
              </Link>
              <Link to="/signup" className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Inscription
              </Link>
            </div>
          )}
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-12 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg">
            <div className="px-4 py-3 space-y-3 divide-y divide-gray-200">
              <div className="space-y-2">
                <Link to="/concept" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Concept</Link>
                <Link to="/fonctionnalites" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Fonctionnalités</Link>
                <Link to="/recherche-filtre" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Scan/Recherche</Link>
                <Link to="/top-produits" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Top Produits</Link>
                <Link to="/abonnements" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Abonnements</Link>
                <Link to="/contact" className="block text-green-700 hover:text-green-500 py-1.5 text-sm">Contact</Link>
              </div>
              
              <div className="pt-2">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center py-1.5">
                      <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center mr-2">
                        <span className="text-green-700 text-xs font-semibold">
                          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{currentUser.displayName || 'Utilisateur'}</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-600 mt-0.5">
                          {userDetails?.status && (
                            <span className={`inline-flex items-center px-1 rounded-full text-xs font-medium ${getStatusColor(userDetails.status)}`}>
                              {getStatusIcon(userDetails.status)}
                              <span className="ml-0.5 capitalize">{userDetails.status}</span>
                            </span>
                          )}
                          <span className="flex items-center">
                            <Star size={8} className="text-amber-500 mr-0.5" />
                            {userDetails?.reviewCount || 0}
                          </span>
                          <span className="flex items-center">
                            <Heart size={8} className="text-pink-500 mr-0.5" />
                            {userDetails?.favoriteCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to="/profile" className="flex items-center py-1.5 text-sm text-gray-700">
                      <User size={14} className="mr-2 text-gray-500" />
                      Voir profil
                    </Link>
                    
                    <Link to="/historique-produits" className="flex items-center py-1.5 text-sm text-gray-700">
                      <Clock size={14} className="mr-2 text-gray-500" />
                      Historique produits
                    </Link>
                    
                    <Link to="/mes-favoris" className="flex items-center py-1.5 text-sm text-gray-700">
                      <Star size={14} className="mr-2 text-gray-500" />
                      Mes favoris
                    </Link>
                    
                    <Link to="/mes-avis" className="flex items-center py-1.5 text-sm text-gray-700">
                      <MessageSquare size={14} className="mr-2 text-gray-500" />
                      Mes avis
                    </Link>
                    
                    <button onClick={handleLogout} className="flex items-center py-1.5 text-sm text-red-600">
                      <LogOut size={14} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 py-2">
                    <Link to="/login" className="px-3 py-1.5 text-center text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                      Connexion
                    </Link>
                    <Link to="/signup" className="px-3 py-1.5 text-center text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;