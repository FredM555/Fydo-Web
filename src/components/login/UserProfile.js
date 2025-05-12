import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getUserSubscription } from '../../services/subscriptionService';
import { ShoppingBag, AlertCircle, Settings, Star, Heart, Award, Shield, Badge, Calendar, Map } from 'lucide-react';
import ProfileLayout from '../profile/ProfileLayout';

const UserProfile = () => {
  const { currentUser, logout, userDetails } = useAuth(); // Ajout de userDetails
  const navigate = useNavigate(); // Pour la redirection après déconnexion
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // État pour le chargement
  const [subscription, setSubscription] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);

  // Fonction de déconnexion qui sera passée à ProfileLayout
  const handleLogout = async () => {
    setError('');
    setLoading(true);
    
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setError('Échec de la déconnexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les informations d'abonnement
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (currentUser) {
        try {
          const { subscription, plan } = await getUserSubscription(currentUser.uid);
          setSubscription(subscription);
          setSubscriptionPlan(plan);
        } catch (err) {
          console.error("Erreur lors du chargement de l'abonnement:", err);
        }
      }
    };
    
    fetchSubscriptionInfo();
  }, [currentUser]);

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

  // Obtenir la description du statut
  const getStatusDescription = (status) => {
    switch(status?.toLowerCase()) {
      case 'bronze': return 'Niveau débutant';
      case 'argent': case 'silver': return 'Niveau intermédiaire';
      case 'or': case 'gold': return 'Niveau avancé';
      case 'diamant': case 'diamond': return 'Niveau expert';
      default: return 'Niveau débutant';
    }
  };

  return (
    <ProfileLayout 
      title="Profil Utilisateur"
      onLogout={handleLogout} // Passer la fonction de déconnexion
      logoutLoading={loading} // Passer l'état de chargement
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-5xl font-bold mb-4">
          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'F')}
        </div>
        
        <h3 className="text-2xl font-bold">{currentUser.displayName || 'Utilisateur'}</h3>
        <p className="text-gray-600">{currentUser.email}</p>

        {/* Badge de statut utilisateur */}
        {userDetails?.status && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userDetails.status)}`}>
              <Award size={16} className="mr-1" />
              <span className="capitalize">{userDetails.status}</span>
            </span>
            <p className="text-xs text-gray-500 mt-1">{getStatusDescription(userDetails.status)}</p>
          </div>
        )}
      </div>
      
      {/* Statistiques utilisateur */}
      <div className="mb-6">
        <h4 className="text-xl font-bold mb-2 flex items-center">
          <Badge className="mr-2 text-green-600" size={18} />
          Statistiques
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center">
            <div className="flex items-center text-green-600 mb-1">
              <Star size={18} className="fill-green-600" />
              <span className="text-sm font-medium ml-1">Avis publiés</span>
            </div>
            <span className="text-2xl font-bold text-green-700">{userDetails?.reviewCount || 0}</span>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg flex flex-col items-center">
            <div className="flex items-center text-pink-500 mb-1">
              <Heart size={18} className="fill-pink-500" />
              <span className="text-sm font-medium ml-1">Produits favoris</span>
            </div>
            <span className="text-2xl font-bold text-pink-600">{userDetails?.favoriteCount || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Informations sur l'abonnement */}
      <div className="mb-6">
        <h4 className="text-xl font-bold mb-2 flex items-center">
          <Calendar size={18} className="mr-2 text-green-600" />
          Détails de l'abonnement
        </h4>
        <div className="bg-gray-50 p-4 rounded-md">
          {subscription ? (
            <div>
              <div className="mb-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  {subscription.is_active ? 'Actif' : 'Inactif'}
                </span>
                <h3 className="font-semibold">{subscriptionPlan?.name || userDetails?.subscription_name || 'Plan inconnu'}</h3>
              </div>
              <p className="mb-2 text-sm">
                <span className="font-medium">Expire le:</span> {new Date(subscription.end_date).toLocaleDateString()}
              </p>
              <Link to="/subscription/history" className="text-green-600 hover:text-green-800 text-sm">
                Voir l'historique complet
              </Link>
            </div>
          ) : (
            <div>
              <p className="mb-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                  Gratuit
                </span>
                <span className="font-medium">Plan actuel:</span> {userDetails?.subscription_name || 'Gratuit'}
              </p>
              <Link to="/abonnements" className="text-green-600 hover:text-green-800">
                Découvrir nos abonnements
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Informations d'adresse */}
{(userDetails?.country || userDetails?.city || userDetails?.postalCode) && (
  <div className="mb-6">
    <h4 className="text-xl font-bold mb-2 flex items-center">
      <Map size={18} className="mr-2 text-green-600" />
      Informations d'adresse
    </h4>
    <div className="bg-gray-50 p-4 rounded-md">
      <ul className="space-y-1">
        {userDetails?.country && (
          <li className="text-gray-700">
            <span className="font-medium">Pays:</span> {userDetails.country}
          </li>
        )}
        {userDetails?.city && (
          <li className="text-gray-700">
            <span className="font-medium">Ville:</span> {userDetails.city}
          </li>
        )}
        {userDetails?.postalCode && (
          <li className="text-gray-700">
            <span className="font-medium">Code postal:</span> {userDetails.postalCode}
          </li>
        )}
      </ul>
      {!userDetails?.country && !userDetails?.city && !userDetails?.postalCode && (
        <p className="text-gray-500 italic">Aucune information d'adresse renseignée</p>
      )}
      <Link to="/edit-profile" className="text-green-600 hover:text-green-800 text-sm mt-2 inline-block">
        Modifier mes informations
      </Link>
    </div>
  </div>
)}


      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/edit-profile" className="bg-green-100 text-green-700 py-3 px-4 rounded-md hover:bg-green-200 text-center transition flex items-center justify-center">
          <Settings size={18} className="mr-2" />
          Modifier le profil
        </Link>
        <Link to="/abonnements" className="bg-blue-100 text-blue-700 py-3 px-4 rounded-md hover:bg-blue-200 text-center transition flex items-center justify-center">
          <ShoppingBag size={18} className="mr-2" />
          Gérer mon abonnement
        </Link>
      </div>
    </ProfileLayout>
  );
};

export default UserProfile;