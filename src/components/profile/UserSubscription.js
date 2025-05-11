// src/components/profile/UserSubscription.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, AlertCircle, CreditCard, CheckCircle, XCircle, Gift, DollarSign, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { formatDate } from '../../utils/formatters';

const UserSubscription = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [paidSubscription, setPaidSubscription] = useState(null);
  const [offeredSubscription, setOfferedSubscription] = useState(null);
  const [paidPlan, setPaidPlan] = useState(null);
  const [offeredPlan, setOfferedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [expandedOffered, setExpandedOffered] = useState(false);
  const [expandedPaid, setExpandedPaid] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // 1. Récupérer l'ID de l'utilisateur dans Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('firebase_uid', currentUser.uid)
          .single();
          
        if (userError) throw userError;
        
        // 2. Récupérer tous les abonnements actifs de l'utilisateur
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userData.id)
          .eq('is_active', true)
          .order('end_date', { ascending: false });
          
        if (subscriptionsError) throw subscriptionsError;
        
        // Séparer les abonnements en "payé" et "offert"
        const now = new Date();
        const validSubscriptions = subscriptionsData.filter(sub => new Date(sub.end_date) > now);
        
        const paid = validSubscriptions.find(sub => sub.payment_method !== 'offert');
        const offered = validSubscriptions.find(sub => sub.payment_method === 'offert');
        
        setPaidSubscription(paid || null);
        setOfferedSubscription(offered || null);
        
        // 3. Récupérer les détails des plans
        if (paid) {
          const { data: paidPlanData, error: paidPlanError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', paid.plan_id)
            .single();
            
          if (paidPlanError) throw paidPlanError;
          
          setPaidPlan(paidPlanData);
        }
        
        if (offered) {
          const { data: offeredPlanData, error: offeredPlanError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', offered.plan_id)
            .single();
            
          if (offeredPlanError) throw offeredPlanError;
          
          setOfferedPlan(offeredPlanData);
        }
        
        // Si aucun abonnement n'est trouvé, récupérer le plan gratuit par défaut
        if (!paid && !offered) {
          // Récupérer le plan gratuit par défaut
          const { data: freePlanData, error: freePlanError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', 'Gratuit')
            .single();
            
          if (!freePlanError) {
            setPaidPlan(freePlanData);
          }
        }
        
        // Récupérer l'historique des abonnements
        const { data: historyData, error: historyError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans(name, price_monthly, price_yearly)
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });
          
        if (!historyError) {
          setSubscriptionHistory(historyData);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'abonnement:", err.message);
        setError("Impossible de charger les informations d'abonnement.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscriptions();
  }, [currentUser]);

  const handleUpgrade = () => {
    navigate('/abonnements');
  };

  const handleCancelSubscription = async (subscriptionId) => {
    setCancelling(true);
    
    try {
      // Mettre à jour l'abonnement comme inactif
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_active: false,
          is_auto_renew: false,
        })
        .eq('id', subscriptionId);
        
      if (updateError) throw updateError;
      
      // Mettre à jour le type d'utilisateur vers Gratuit seulement si c'était l'abonnement payé
      if (paidSubscription && paidSubscription.id === subscriptionId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('firebase_uid', currentUser.uid)
          .single();
          
        if (userError) throw userError;
        
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ user_type: 'Visiteur' })
          .eq('id', userData.id);
          
        if (updateUserError) throw updateUserError;
      }
      
      setCancelSuccess(true);
      
      // Rafraîchir les données après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'annulation de l'abonnement:", err.message);
      setError("L'annulation de l'abonnement a échoué. Veuillez réessayer plus tard.");
    } finally {
      setCancelling(false);
    }
  };
  
  const toggleHistory = () => {
    setHistoryModalOpen(!historyModalOpen);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Style pour le badge d'abonnement dans l'historique
  const getSubscriptionBadgeStyle = (paymentMethod) => {
    if (paymentMethod === 'offert') {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  // Icône pour le type d'abonnement dans l'historique
  const getSubscriptionIcon = (paymentMethod) => {
    if (paymentMethod === 'offert') {
      return <Gift size={14} className="text-purple-600" />;
    } else {
      return <DollarSign size={14} className="text-green-600" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Historique de vos abonnements</h2>
      
      {/* Section des abonnements actifs */}
      <div className="space-y-6">
        {/* Abonnement payé */}
        {paidSubscription && paidPlan && (
          <div className="border-l-4 border-green-500 rounded-lg bg-white shadow-sm overflow-hidden">
            <div 
              onClick={() => setExpandedPaid(!expandedPaid)}
              className="p-4 flex justify-between items-center cursor-pointer bg-green-50"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    {paidPlan.name} <CheckCircle className="ml-2 h-4 w-4 text-green-600" /> <span className="ml-2 text-green-700">Actif</span>
                  </h3>
                  <p className="text-sm text-gray-600">Pour utilisateurs intensifs</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" /> Du {formatDate(paidSubscription.start_date)} au {formatDate(paidSubscription.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <span className="text-2xl font-bold text-green-700">{paidPlan.price_monthly ? `${paidPlan.price_monthly.toFixed(2)} €` : '0,00 €'}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 ml-2 transform transition-transform ${expandedPaid ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            
            {expandedPaid && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Star className="h-5 w-5 text-green-600 mr-2" />
                      Avantages
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Scans par jour: {paidPlan.max_scan_auto >= 9000 ? 'Illimité' : paidPlan.max_scan_auto}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Scans manuels par jour: {paidPlan.max_scan_manuel >= 9000 ? 'Illimité' : paidPlan.max_scan_manuel}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Recherches par jour: {paidPlan.max_recherche >= 9000 ? 'Illimité' : paidPlan.max_recherche}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Consultation avis par jour: {paidPlan.max_consult_avis >= 9000 ? 'Illimité' : paidPlan.max_consult_avis}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
                      Informations de paiement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-2 text-green-600" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Payé
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renouvellement automatique:</span>
                        <span className={paidSubscription.is_auto_renew ? 'text-green-600' : 'text-red-600'}>
                          {paidSubscription.is_auto_renew ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleUpgrade}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Changer de plan
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCancelModal(true);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  >
                    Annuler l'abonnement
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Abonnement offert */}
        {offeredSubscription && offeredPlan && (
          <div className="border-l-4 border-purple-500 rounded-lg bg-white shadow-sm overflow-hidden">
            <div 
              onClick={() => setExpandedOffered(!expandedOffered)}
              className="p-4 flex justify-between items-center cursor-pointer bg-purple-50"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    {offeredPlan.name} <CheckCircle className="ml-2 h-4 w-4 text-purple-600" /> <span className="ml-2 text-purple-700">Actif</span>
                  </h3>
                  <p className="text-sm text-gray-600">Pour utilisateurs réguliers</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" /> Du {formatDate(offeredSubscription.start_date)} au {formatDate(offeredSubscription.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <span className="text-2xl font-bold text-purple-700">0,99 €</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 ml-2 transform transition-transform ${expandedOffered ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            
            {expandedOffered && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Star className="h-5 w-5 text-purple-600 mr-2" />
                      Avantages
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                        <span>Scans par jour: {offeredPlan.max_scan_auto >= 9000 ? 'Illimité' : offeredPlan.max_scan_auto}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                        <span>Scans manuels par jour: {offeredPlan.max_scan_manuel >= 9000 ? 'Illimité' : offeredPlan.max_scan_manuel}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                        <span>Recherches par jour: {offeredPlan.max_recherche >= 9000 ? 'Illimité' : offeredPlan.max_recherche}</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                        <span>Consultation avis par jour: {offeredPlan.max_consult_avis >= 9000 ? 'Illimité' : offeredPlan.max_consult_avis}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      Informations de paiement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Gift size={14} className="mr-2 text-purple-600" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Offert
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renouvellement automatique:</span>
                        <span className="text-gray-500">
                          Non applicable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Aucun abonnement actif */}
        {!paidSubscription && !offeredSubscription && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Pas d'abonnement actif</h3>
            <p className="mt-2 text-sm text-gray-500">
              Vous utilisez actuellement la version gratuite de l'application.
            </p>
            <div className="mt-6">
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Découvrir nos abonnements
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bouton pour afficher l'historique complet */}
      {subscriptionHistory && subscriptionHistory.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={toggleHistory}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 flex items-center mx-auto"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Voir l'historique complet ({subscriptionHistory.length})
          </button>
        </div>
      )}
      
      {/* Modal de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {!cancelSuccess ? (
              <>
                <h3 className="text-xl font-bold mb-4">Confirmer l'annulation</h3>
                <p className="text-gray-700 mb-6">
                  Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l'accès à toutes les fonctionnalités premium à la fin de votre période de facturation actuelle.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="sm:flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    disabled={cancelling}
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(paidSubscription.id)}
                    className="sm:flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70"
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Annulation...
                      </span>
                    ) : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Abonnement annulé</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Votre abonnement a été annulé avec succès. Vous conserverez l'accès jusqu'à la fin de votre période de facturation actuelle.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal d'historique des abonnements */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center">
                <Calendar className="text-blue-600 mr-2" size={20} />
                Historique complet des abonnements
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptionHistory.map((subscription) => {
                    const now = new Date();
                    const endDate = new Date(subscription.end_date);
                    const isActive = subscription.is_active && endDate > now;
                    
                    return (
                      <tr key={subscription.id} className={isActive ? "bg-green-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.start_date, true)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.end_date, true)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="font-medium text-gray-900">
                            {subscription.subscription_plans?.name || 'Plan inconnu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadgeStyle(subscription.payment_method)}`}>
                            {getSubscriptionIcon(subscription.payment_method)}
                            <span className="ml-1">
                              {subscription.payment_method === 'offert' ? 'Offert' : 'Payé'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircle size={12} className="mr-1" />
                              Inactif
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscription;