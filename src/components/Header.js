import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, LogOut, ChevronDown, Clock, Star, MessageSquare, Heart, Award, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Assurez-vous d'importer useAuth

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Utiliser useAuth pour récupérer userDetails
  const { currentUser, userDetails } = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fonction de déconnexion corrigée
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
      case 'bronze': return <Award size={14} />;
      case 'argent': case 'silver': return <Award size={14} />;
      case 'or': case 'gold': return <Award size={14} />;
      case 'diamant': case 'diamond': return <Crown size={14} />;
      default: return <Award size={14} />;
    }
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo avec code-barres et étoile */}
        <div className="flex items-center">
          <Link to="/">
            <svg viewBox="0 0 200 100" width="180" height="80">
              {/* Logo principal */}
              <text x="20" y="60" fontFamily="Arial, sans-serif" fontSize="45" fontWeight="bold" fill="#1B9E3E">Fydo</text>
              
              {/* Code-barres à côté du texte */}
              <g transform="translate(120, 30)">
                {/* Rectangle de fond blanc pour le code-barres */}
                <rect x="0" y="0" width="45" height="40" fill="white" rx="2" ry="2"/>
                
                {/* Lignes du code-barres */}
                <rect x="3" y="5" width="2" height="30" fill="black"/>
                <rect x="7" y="5" width="3" height="30" fill="black"/>
                <rect x="12" y="5" width="1" height="30" fill="black"/>
                <rect x="15" y="5" width="2" height="30" fill="black"/>
                <rect x="19" y="5" width="3" height="30" fill="black"/>
                <rect x="24" y="5" width="1" height="30" fill="black"/>
                <rect x="27" y="5" width="2" height="30" fill="black"/>
                <rect x="31" y="5" width="1" height="30" fill="black"/>
                <rect x="34" y="5" width="3" height="30" fill="black"/>
                <rect x="39" y="5" width="2" height="30" fill="black"/>
              </g>
              
              {/* Étoile jaune à côté du texte */}
              <path d="M170 25 L176 44 L196 44 L180 55 L186 74 L170 62 L154 74 L160 55 L144 44 L164 44 Z" fill="#FFD700" stroke="none"/>
            </svg>
          </Link>
        </div>

        {/* Liens de navigation */}
        <div className="hidden md:flex space-x-6">
          <a href="#concept" className="text-green-700 hover:text-green-500">Concept</a>
          <a href="#fonctionnalites" className="text-green-700 hover:text-green-500">Fonctionnalités</a>
          <Link to="/recherche-filtre" className="text-green-700 hover:text-green-500">Scan/Recherche</Link>
          <Link to="/top-produits" className="text-green-700 hover:text-green-500">Top Produits</Link> {/* Nouveau lien */}
          <Link to="/abonnements" className="text-green-700 hover:text-green-500">Abonnements</Link>
          <a href="#contact" className="text-green-700 hover:text-green-500">Contact</a>
        </div>
        
        {/* Partie utilisateur */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            <div>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-green-700 font-semibold">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{currentUser.displayName || 'Utilisateur'}</span>
                  
                  {/* Ajout des informations d'avis, favoris et statut */}
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    {/* Badge de statut */}
                    {userDetails?.status && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userDetails.status)}`}>
                        {getStatusIcon(userDetails.status)}
                        <span className="ml-0.5 capitalize">{userDetails.status}</span>
                      </span>
                    )}
                    
                    {/* Nombre d'avis */}
                    <span className="flex items-center">
                      <Star size={10} className="text-amber-500 mr-0.5" />
                      {userDetails?.reviewCount || 0}
                    </span>
                    
                    {/* Nombre de favoris */}
                    <span className="flex items-center">
                      <Heart size={10} className="text-pink-500 mr-0.5" />
                      {userDetails?.favoriteCount || 0}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-10">
                  {/* Lien Voir profil */}
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} className="mr-2 text-gray-500" />
                    Voir profil
                  </Link>
                  
                  {/* Raccourci Historique produits */}
                  <Link 
                    to="/historique-produits" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Clock size={16} className="mr-2 text-gray-500" />
                    Historique produits
                  </Link>
                  
                  {/* Raccourci Mes favoris */}
                  <Link 
                    to="/mes-favoris" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Star size={16} className="mr-2 text-gray-500" />
                    Mes favoris ({userDetails?.favoriteCount || 0})
                  </Link>
                  
                  {/* Raccourci Mes avis */}
                  <Link 
                    to="/mes-avis" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare size={16} className="mr-2 text-gray-500" />
                    Mes avis ({userDetails?.reviewCount || 0})
                  </Link>
                  
                  <hr className="border-gray-200" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login" className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                Connexion
              </Link>
              <Link to="/signup" className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;