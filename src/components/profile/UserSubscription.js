// src/components/profile/UserSubscription.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, AlertCircle, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { formatDate } from '../../utils/formatters';

const UserSubscription = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchUserSubscription = async () => {
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
        
        // 2. Récupérer l'abonnement actif de l'utilisateur
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userData.id)
          .eq('is_active', true)
          .order('end_date', { ascending: false })
          .limit(1)
          .single();
          
        if (subscriptionError && subscriptionError.code !== 'PGRST116') { // Code pour "no rows returned"
          throw subscriptionError;
        }
        
        setSubscription(subscriptionData);
        
        // 3. Si un abonnement existe, récupérer les détails du plan
        if (subscriptionData) {
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', subscriptionData.plan_id)
            .single();
            
          if (planError) throw planError;
          
          setPlan(planData);
        } else {
          // Récupérer le plan gratuit par défaut
          const { data: freePlanData, error: freePlanError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', 'Gratuit')
            .single();
            
          if (!freePlanError) {
            setPlan(freePlanData);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'abonnement:", err.message);
        setError("Impossible de charger les informations d'abonnement.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, [currentUser]);

  const handleUpgrade = () => {
    navigate('/abonnements');
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    
    try {
      // Mettre à jour l'abonnement comme inactif
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_active: false,
          is_auto_renew: false,
        })
        .eq('id', subscription.id);
        
      if (updateError) throw updateError;
      
      // Mettre à jour le type d'utilisateur vers Gratuit
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Votre abonnement</h2>
      
      {subscription ? (
        <div>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-600">
                  {plan?.name || 'Plan'}
                </span>
                <h3 className="text-lg font-bold mt-2">{plan?.description || 'Abonnement actif'}</h3>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold">
                  {subscription.payment_status === 'completed' ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      Actif
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-600">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      En attente
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Expire le {formatDate(subscription.end_date)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Star className="h-5 w-5 text-green-600 mr-2" />
                Avantages
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                  <span>{plan?.max_receipts} tickets de caisse par mois</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                  <span>{plan?.max_products} produits à suivre</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                  <span>Durée de {plan?.duration_days} jours</span>
                </li>
                
                {/* Fonctionnalités supplémentaires */}
                {plan?.features && Object.entries(plan.features)
                  .filter(([_, included]) => included)
                  .map(([feature, _]) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                Détails du paiement
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de début:</span>
                  <span>{formatDate(subscription.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prochaine facturation:</span>
                  <span>{formatDate(subscription.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode de paiement:</span>
                  <span className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {subscription.payment_method === 'card' ? 'Carte bancaire' : subscription.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Renouvellement auto:</span>
                  <span className={subscription.is_auto_renew ? 'text-green-600' : 'text-red-600'}>
                    {subscription.is_auto_renew ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Changer de plan
            </button>
            
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              Annuler l'abonnement
            </button>
          </div>
          
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
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={cancelling}
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70"
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
        </div>
      ) : (
        <div className="text-center py-8">
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
  );
};

export default UserSubscription;