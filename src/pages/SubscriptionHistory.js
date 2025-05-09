// src/components/profile/SubscriptionHistory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Camera,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionHistory } from '../services/subscriptionService';
import { formatDate, formatPrice } from '../utils/formatters';
import ProfileLayout from '../components/profile/ProfileLayout';

const SubscriptionHistory = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchSubscriptionHistory = async () => {
      try {
        setLoading(true);
        
        if (!userDetails || !userDetails.id) {
          throw new Error("Données utilisateur non disponibles");
        }
        
        const historyData = await getSubscriptionHistory(userDetails.id);
        setHistory(historyData);
        
        // Initialiser l'état d'expansion avec le plus récent ouvert par défaut
        if (historyData.length > 0) {
          const expandMap = {};
          expandMap[historyData[0].id] = true;
          setExpandedItems(expandMap);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique:", err.message);
        setError("Impossible de charger l'historique des abonnements. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && userDetails) {
      fetchSubscriptionHistory();
    }
  }, [currentUser, userDetails]);

  // Fonction pour basculer l'état d'expansion d'un élément
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fonction pour afficher le statut de l'abonnement
  const renderStatus = (subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    if (subscription.is_active && now <= endDate) {
      return (
        <span className="flex items-center text-green-600 status-badge status-active">
          <CheckCircle className="h-4 w-4 mr-1" />
          Actif
        </span>
      );
    } else if (subscription.is_active && now > endDate) {
      return (
        <span className="flex items-center text-orange-600 status-badge">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Expiré
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-600 status-badge">
          <XCircle className="h-4 w-4 mr-1" />
          Inactif
        </span>
      );
    }
  };

  // Fonction pour afficher le statut du paiement
  const renderPaymentStatus = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-badge">
            Payé
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 status-badge">
            En attente
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 status-badge">
            Échec
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 status-badge">
            {status}
          </span>
        );
    }
  };

  // Fonction pour afficher une caractéristique avec valeur
  const renderFeatureWithValue = (label, value, icon = null) => {
    const displayValue = typeof value === 'number' && value >= 9000 ? 'Illimité' : value;
    
    return (
      <div className="flex items-center py-1">
        {icon || <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />}
        <span className="text-gray-700 text-sm">
          {label}: <span className="font-medium text-green-600">{displayValue}</span>
        </span>
      </div>
    );
  };

  return (
    <ProfileLayout title="Historique de vos abonnements">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Une erreur est survenue</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center subscription-fade-in">
          <div className="flex justify-center mb-4">
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique d'abonnement</h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore souscrit à un abonnement ou votre historique est vide.
          </p>
          <button
            onClick={() => navigate('/abonnements')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 subscription-action"
          >
            Découvrir nos abonnements
          </button>
        </div>
      ) : (
        <div className="subscription-fade-in">
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {history.map((subscription, index) => (
              <li key={subscription.id} className={`bg-white subscription-card ${index === 0 ? 'border-l-4 border-green-500' : ''}`}>
                {/* En-tête toujours visible avec prix mis en évidence */}
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(subscription.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Partie supérieure avec nom du plan et badge de statut */}
                      <div className="flex items-center mb-1">
                        <h4 className="text-lg font-semibold text-gray-900 mr-2">
                          {subscription.subscription_plans?.name || 'Plan inconnu'}
                        </h4>
                        {renderStatus(subscription)}
                        <div className="ml-auto sm:hidden">
                          {expandedItems[subscription.id] ? 
                            <ChevronUp size={18} className="chevron-toggle expanded" /> : 
                            <ChevronDown size={18} className="chevron-toggle" />
                          }
                        </div>
                      </div>
                      
                      {/* Description courte du plan */}
                      <p className="text-sm text-gray-500 mb-2 pr-6 truncate-2-lines">
                        {subscription.subscription_plans?.description || 'Description non disponible'}
                      </p>
                      
                      {/* Période d'abonnement, visible même sans expansion */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          Du {formatDate(subscription.start_date)} au {formatDate(subscription.end_date)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Prix mis en évidence à droite */}
                    <div className="mt-3 sm:mt-0 sm:ml-6 flex flex-row sm:flex-col items-center sm:items-end justify-between">
                      <div className="text-2xl font-bold text-green-700 subscription-price price-highlight">
                        {formatPrice(subscription.price || (
                          subscription.subscription_plans?.price_monthly || 0
                        ))}
                      </div>
                      <div className="hidden sm:flex">
                        {expandedItems[subscription.id] ? 
                          <ChevronUp size={18} className="chevron-toggle expanded" /> : 
                          <ChevronDown size={18} className="chevron-toggle" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Partie dépliable avec les détails */}
                {expandedItems[subscription.id] && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 subscription-details">
                    {/* Caractéristiques du plan */}
                    <div className="mt-3 p-3 bg-white rounded-md shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 subscription-info-grid">
                      {subscription.subscription_plans?.max_scan_auto && (
                        renderFeatureWithValue(
                          "Scans par jour", 
                          subscription.subscription_plans.max_scan_auto,
                          <Camera className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        )
                      )}
                      
                      {subscription.subscription_plans?.max_scan_manuel && (
                        renderFeatureWithValue(
                          "Scans manuels par jour", 
                          subscription.subscription_plans.max_scan_manuel,
                          <Camera className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        )
                      )}
                      
                      {subscription.subscription_plans?.max_recherche && (
                        renderFeatureWithValue(
                          "Recherches par jour", 
                          subscription.subscription_plans.max_recherche,
                          <Search className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        )
                      )}
                      
                      {subscription.subscription_plans?.max_consult_avis && (
                        renderFeatureWithValue(
                          "Consultation avis par jour", 
                          subscription.subscription_plans.max_consult_avis,
                          <Eye className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        )
                      )}
                    </div>
                    
                    {/* Informations de paiement */}
                    <div className="mt-3 p-3 bg-white rounded-md shadow-sm">
                      <h5 className="font-medium text-gray-700 mb-2 subscription-header">Informations de paiement</h5>
                      <div className="grid grid-cols-1 gap-2 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="mr-2">
                            {subscription.payment_method === 'card' ? 'Carte bancaire' : subscription.payment_method}
                          </span>
                          {renderPaymentStatus(subscription.payment_status)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className={subscription.is_auto_renew ? 'text-green-600' : 'text-gray-600'}>
                            {subscription.is_auto_renew 
                              ? 'Renouvellement automatique activé' 
                              : 'Sans renouvellement automatique'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p>
              Pour toute question concernant vos abonnements, veuillez contacter notre service client à <a href="mailto:support@fydo.app" className="text-green-600 hover:text-green-800">support@fydo.app</a>
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/abonnements')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition subscription-action"
            >
              Voir les abonnements disponibles
            </button>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default SubscriptionHistory;