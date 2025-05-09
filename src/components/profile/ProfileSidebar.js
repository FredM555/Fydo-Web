// src/components/profile/ProfileSidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  KeyRound, 
  Calendar, 
  History, 
  LogOut, 
  ShoppingBag,
  Users,
  Shield,
  Star,
  Heart,
  Award,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 

const ProfileSidebar = ({ currentUser, onLogout, loading }) => {
  const { logout, userDetails } = useAuth(); // Récupérer la fonction logout et userDetails depuis le contexte
  const navigate = useNavigate(); // Pour rediriger après déconnexion
  const location = useLocation();
  const currentPath = location.pathname;

  // Fonction locale de déconnexion qui utilise celle du contexte
  const handleLogout = async () => {
    if (onLogout) {
      // Si onLogout est fourni, on l'utilise
      await onLogout();
    } else {
      // Sinon, on utilise directement la fonction du contexte
      try {
        await logout();
        navigate('/'); // Rediriger vers la page d'accueil après déconnexion
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
    }
  };

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
    <div className="w-64 shrink-0">
      <div className="bg-white p-6 rounded-lg shadow-md sticky top-24 w-64">
        {/* En-tête du profil avec photo et email - hauteur fixe */}
        <div className="mb-4 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-green-700 font-bold text-2xl">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
            </span>
          </div>
          <div className="w-full">
            <h3 className="font-bold text-gray-800 truncate">{currentUser?.displayName || 'Utilisateur'}</h3>
            <p className="text-sm text-gray-600 truncate">{currentUser?.email}</p>
            
            {/* Badge de statut utilisateur */}
            {userDetails?.status && (
              <div className="mt-2 mb-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userDetails.status)}`}>
                  {getStatusIcon(userDetails.status)}
                  <span className="ml-1 capitalize">{userDetails.status}</span>
                </span>
              </div>
            )}

            {/* Abonnement en cours */}
            {userDetails?.subscription_name && (
              <p className="text-xs text-green-600 font-medium mt-1">
                {userDetails.subscription_name}
              </p>
            )}
          </div>
        </div>
        
        {/* Statistiques utilisateur */}
        <div className="mb-4 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-md">
          <div className="flex flex-col items-center justify-center p-2">
            <div className="flex items-center text-amber-500 mb-1">
              <Star size={14} className="fill-amber-500" />
              <span className="text-xs ml-1">Avis</span>
            </div>
            <span className="font-bold text-gray-700">{userDetails?.reviewCount || 0}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <div className="flex items-center text-pink-500 mb-1">
              <Heart size={14} className="fill-pink-500" />
              <span className="text-xs ml-1">Favoris</span>
            </div>
            <span className="font-bold text-gray-700">{userDetails?.favoriteCount || 0}</span>
          </div>
        </div>
        
        {/* Options du menu - hauteur fixe par élément */}
        <nav className="space-y-1">
          {/* Liens inchangés */}
          <Link 
            to="/profile" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/profile') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <User size={18} className="mr-3 shrink-0" />
            <span>Profil</span>
          </Link>
          
          <Link 
            to="/edit-profile" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/edit-profile') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Settings size={18} className="mr-3 shrink-0" />
            <span>Modifier profil</span>
          </Link>
          
          <Link 
            to="/change-password" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/change-password') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <KeyRound size={18} className="mr-3 shrink-0" />
            <span>Changer mot de passe</span>
          </Link>
          
          <Link 
            to="/subscription/history" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/subscription/history') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Calendar size={18} className="mr-3 shrink-0" />
            <span>Abonnements</span>
          </Link>
          
          <Link 
            to="/historique-produits" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/product/history') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <History size={18} className="mr-3 shrink-0" />
            <span>Historique produits</span>
          </Link>
          <Link 
            to="/mes-favoris" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/mes-favoris') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Heart size={18} className="mr-3 shrink-0" />
            <span>Mes favoris</span>
          </Link>       
          <Link 
            to="/mes-avis" 
            className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/mes-avis') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <Star size={18} className="mr-3 shrink-0" />
            <span>Mes avis</span>
          </Link>
          
          {/* Lien d'administration - visible uniquement pour les administrateurs */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`flex items-center px-3 py-2 rounded-md w-full transition h-10 ${isActivePath('/admin') ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Shield size={18} className="mr-3 shrink-0 text-blue-600" />
              <span className="text-blue-600 font-medium">Administration</span>
            </Link>
          )}
          
          <div className="h-0.5 my-3 bg-gray-200"></div>
          
          {/* Bouton de déconnexion modifié pour utiliser handleLogout */}
          <button 
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md w-full text-left transition h-10"
            disabled={loading}
          >
            <LogOut size={18} className="mr-3 shrink-0" />
            <span>{loading ? 'Déconnexion...' : 'Se déconnecter'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;