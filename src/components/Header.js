// src/components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Clock, 
  Star, 
  MessageSquare, 
  Heart, 
  Award, 
  Menu, 
  X, 
  Trophy,
  Search,
  ShoppingBag,
  Info,
  Phone,
  Receipt
} from 'lucide-react';
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

  // Vérifier si l'URL actuelle contient un segment spécifique
  const isActivePath = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  // Obtenir le badge et l'icône selon le statut
  const getBadgeInfo = (status) => {
    let color, bg, icon;
    
    switch(status?.toLowerCase()) {
      case 'bronze':
        color = 'text-amber-800';
        bg = 'bg-amber-500';
        icon = <Award size={12} />;
        break;
      case 'argent': case 'silver':
        color = 'text-gray-700';
        bg = 'bg-gray-400';
        icon = <Award size={12} />;
        break;
      case 'or': case 'gold':
        color = 'text-amber-800';
        bg = 'bg-yellow-500';
        icon = <Award size={12} />;
        break;
      case 'diamant': case 'diamond':
        color = 'text-blue-700';
        bg = 'bg-blue-400';
        icon = <Award size={12} />;
        break;
      default:
        color = 'text-amber-800';
        bg = 'bg-amber-500';
        icon = <Award size={12} />;
    }
    
    return { color, bg, icon };
  };

  // Vérifier si l'URL actuelle contient "recherche" pour appliquer un style spécifique
  const isSearchPage = location.pathname.includes('recherche');
  
  // Vérifier si l'utilisateur est sur la page challenges
  const isChallengesPage = location.pathname === '/challenges';

  return (
    <nav className={`bg-white shadow-md py-3 fixed top-0 left-0 right-0 z-50 ${isSearchPage ? 'search-page-header' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo Fydo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src={fydoLogo} 
                alt="Fydo Logo" 
                className="h-10 md:h-12" 
              />
            </Link>
          </div>

          {/* Bouton du menu mobile */}
          <button 
            className="lg:hidden mobile-menu-button p-2 rounded-md hover:bg-green-50 text-green-800 transition-colors"
            aria-label="Menu"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? 
              <X className="h-6 w-6" /> : 
              <Menu className="h-6 w-6" />
            }
          </button>

          {/* Liens de navigation desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink 
              to="/concept" 
              icon={<Info size={16} />}
              active={isActivePath('/concept')}
            >
              Concept
            </NavLink>
            
            <NavLink 
              to="/fonctionnalites" 
              icon={<ShoppingBag size={16} />}
              active={isActivePath('/fonctionnalites')}
            >
              Fonctionnalités
            </NavLink>
            
            <NavLink 
              to="/recherche-filtre" 
              icon={<Search size={16} />}
              active={isActivePath('/recherche-filtre')}
            >
              Scan/Recherche
            </NavLink>
            
            {/* Icône Challenges - Seulement l'icône trophée, plus distinctive */}
            {currentUser && (
              <div className="mx-2">
                <Link 
                  to="/challenges"
                  aria-label="Challenges"
                  className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 transform hover:scale-110 ${
                    isChallengesPage 
                      ? 'bg-green-800 text-white'
                      : 'bg-amber-100 text-amber-600 hover:bg-amber-200 ring-2 ring-amber-300'
                  }`}
                >
                  <Trophy 
                    size={20} 
                    className={`${isChallengesPage ? 'fill-white' : 'fill-amber-500'}`} 
                  />
                </Link>
              </div>
            )}
            
            <NavLink 
              to="/top-produits" 
              icon={<Star size={16} />}
              active={isActivePath('/top-produits')}
            >
              Top Produits
            </NavLink>
            
            <NavLink 
              to="/abonnements" 
              icon={<ShoppingBag size={16} />}
              active={isActivePath('/abonnements')}
            >
              Abonnements
            </NavLink>
            
            <NavLink 
              to="/contact" 
              icon={<Phone size={16} />}
              active={isActivePath('/contact')}
            >
              Contact
            </NavLink>
          </div>
        
          {/* Partie utilisateur desktop */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            {currentUser ? (
              <div>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center rounded-full py-1.5 px-2.5 bg-green-50 hover:bg-green-100 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar de l'utilisateur */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm font-medium mr-2">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
                    </div>
                    
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-green-800">
                        {currentUser.displayName || 'Utilisateur'}
                      </span>
                      
                      {/* Informations du profil */}
                      <div className="flex items-center space-x-1.5">
                        {/* Badge de statut */}
                        {userDetails?.status && (
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeInfo(userDetails.status).bg}`}>
                              {getBadgeInfo(userDetails.status).icon}
                              <span className="ml-0.5 capitalize">{userDetails.status}</span>
                            </span>
                          </div>
                        )}
                        
                        {/* Stats d'avis */}
                        <span className="flex items-center text-xs text-green-700">
                          <Star size={10} className="text-amber-500 mr-0.5 fill-amber-500" />
                          {userDetails?.reviewCount || 0}
                        </span>
                        
                        {/* Stats de favoris */}
                        <span className="flex items-center text-xs text-green-700">
                          <Heart size={10} className="text-pink-500 mr-0.5 fill-pink-500" />
                          {userDetails?.favoriteCount || 0}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronDown 
                      size={16} 
                      className={`ml-1 text-green-800 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>

                {/* Menu déroulant du profil */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    <div className="py-1">
                      <DropdownLink to="/profile" icon={<User size={16} />}>
                        Voir profil
                      </DropdownLink>
                      
                      <DropdownLink to="/historique-produits" icon={<Clock size={16} />}>
                        Historique produits
                      </DropdownLink>
                    </div>
                    
                    <div className="py-1">
                      <DropdownLink to="/mes-favoris" icon={<Heart size={16} />}>
                        Mes favoris
                      </DropdownLink>
                      <DropdownLink to="/mes-tickets" icon={<Receipt size={16} />}>
                        Mes tickets
                      </DropdownLink>
                      
                      <DropdownLink to="/mes-avis" icon={<MessageSquare size={16} />}>
                        Mes avis
                      </DropdownLink>
                      
                      <DropdownLink to="/challenges" icon={<Trophy size={16} />} special>
                        Challenges
                      </DropdownLink>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-sm text-green-800 hover:text-green-700 py-2 px-3 rounded-md transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm bg-green-800 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div 
              ref={mobileMenuRef} 
              className="lg:hidden absolute top-16 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg"
            >
              <div className="p-4 space-y-4 divide-y divide-gray-100">
                {/* Menu navigation mobile */}
                <div className="grid grid-cols-1 gap-2 py-2">
                  <MobileNavLink to="/concept" icon={<Info size={18} />} active={isActivePath('/concept')}>
                    Concept
                  </MobileNavLink>
                  
                  <MobileNavLink to="/fonctionnalites" icon={<ShoppingBag size={18} />} active={isActivePath('/fonctionnalites')}>
                    Fonctionnalités
                  </MobileNavLink>
                  
                  <MobileNavLink to="/recherche-filtre" icon={<Search size={18} />} active={isActivePath('/recherche-filtre')}>
                    Scan/Recherche
                  </MobileNavLink>
                  
                  <MobileNavLink to="/top-produits" icon={<Star size={18} />} active={isActivePath('/top-produits')}>
                    Top Produits
                  </MobileNavLink>
                  
                  <MobileNavLink to="/abonnements" icon={<ShoppingBag size={18} />} active={isActivePath('/abonnements')}>
                    Abonnements
                  </MobileNavLink>
                  
                  <MobileNavLink to="/contact" icon={<Phone size={18} />} active={isActivePath('/contact')}>
                    Contact
                  </MobileNavLink>
                  
                  {/* Challenges - seulement pour utilisateurs connectés */}
                  {currentUser && (
                    <MobileNavLink 
                      to="/challenges" 
                      icon={<Trophy size={18} className={`${isChallengesPage ? 'text-white' : 'text-amber-500 fill-amber-500'}`} />} 
                      active={isActivePath('/challenges')}
                      specialStyle="flex justify-between items-center bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      Challenges
                    </MobileNavLink>
                  )}
                </div>
                
                {/* Section utilisateur mobile */}
                <div className="pt-3">
                  {currentUser ? (
                    <div className="space-y-3">
                      {/* Informations utilisateur */}
                      <div className="flex items-center pb-2">
                        <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center text-lg font-medium mr-3">
                          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div>
                          <div className="font-medium text-green-800">
                            {currentUser.displayName || 'Utilisateur'}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-0.5">
                            {/* Badge de statut */}
                            {userDetails?.status && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${getBadgeInfo(userDetails.status).bg}`}>
                                {getBadgeInfo(userDetails.status).icon}
                                <span className="ml-0.5 capitalize">{userDetails.status}</span>
                              </span>
                            )}
                            
                            {/* Stats d'avis et favoris */}
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center text-xs text-green-700">
                                <Star size={12} className="text-amber-500 mr-0.5 fill-amber-500" />
                                {userDetails?.reviewCount || 0}
                              </span>
                              <span className="flex items-center text-xs text-green-700">
                                <Heart size={12} className="text-pink-500 mr-0.5 fill-pink-500" />
                                {userDetails?.favoriteCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Liens profil mobile */}
                      <div className="grid grid-cols-1 gap-1">
                        <MobileNavLink to="/profile" icon={<User size={18} />}>
                          Voir profil
                        </MobileNavLink>
                        
                        <MobileNavLink to="/historique-produits" icon={<Clock size={18} />}>
                          Historique produits
                        </MobileNavLink>
                        
                        <MobileNavLink to="/mes-favoris" icon={<Heart size={18} />}>
                          Mes favoris
                        </MobileNavLink>

                        <MobileNavLink to="/mes-tickets" icon={<Receipt size={18} />}>
                          Mes tickets
                        </MobileNavLink>
                        
                        <MobileNavLink to="/mes-avis" icon={<MessageSquare size={18} />}>
                          Mes avis
                        </MobileNavLink>
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut size={18} className="mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 py-2">
                      <Link to="/login" className="w-full text-center text-sm text-green-800 hover:bg-green-50 py-2 px-3 rounded-md transition-colors">
                        Connexion
                      </Link>
                      <Link to="/signup" className="w-full text-center text-sm bg-green-800 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors">
                        Inscription
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Composant pour les liens de navigation desktop
const NavLink = ({ to, children, icon, active, specialStyle }) => {
  const baseStyle = "flex items-center text-sm font-medium px-3 py-2 rounded-md transition-colors";
  const defaultStyle = specialStyle || "text-green-800 hover:text-green-700";
  
  return (
    <Link
      to={to}
      className={`${baseStyle} ${active 
        ? `bg-green-800 text-white ${specialStyle ? 'hover:bg-green-700' : 'hover:bg-green-700'}` 
        : `hover:bg-green-50 ${defaultStyle}`}`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </Link>
  );
};

// Composant pour les liens du menu déroulant
const DropdownLink = ({ to, children, icon, special }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm ${special ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {icon && <span className={`mr-2 ${special ? 'text-amber-500' : 'text-gray-500'}`}>{icon}</span>}
      {children}
    </Link>
  );
};

// Composant pour les liens du menu mobile
const MobileNavLink = ({ to, children, icon, active, specialStyle }) => {
  const baseStyle = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const defaultStyle = specialStyle || "text-green-800";
  
  return (
    <Link
      to={to}
      className={`${baseStyle} ${active 
        ? `bg-green-800 text-white ${specialStyle ? '' : ''}` 
        : `hover:bg-green-50 ${defaultStyle}`}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
};

export default Header;