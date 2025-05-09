// src/pages/SubscriptionPlans.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' ou 'yearly'
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });
        
        if (error) throw error;
        
        setPlans(data);
      } catch (err) {
        console.error('Erreur lors du chargement des plans:', err.message);
        setError('Impossible de charger les plans d\'abonnement. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  const handleSubscribe = (planId) => {
    if (!currentUser) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/login', { state: { redirectTo: `/subscribe/${planId}` } });
      return;
    }
    
    // Rediriger vers la page de paiement avec l'ID du plan
    navigate(`/subscribe/${planId}`, { 
      state: { 
        billingCycle,
        planId
      } 
    });
  };

  // Calcul de l'économie annuelle en pourcentage
  const calculateYearlySavings = (plan) => {
    const monthlyCost = plan.price_monthly * 12;
    const yearlyCost = plan.price_yearly;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  // Rendu d'une caractéristique du plan avec label et valeur séparés
  const renderFeatureWithValue = (label, value, included) => (
    <div className="flex items-center py-2">
      {included ? (
        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
      )}
      <span className={included ? "text-gray-800" : "text-gray-500"}>
        {label}: <span className="font-bold text-green-600">{value}</span>
      </span>
    </div>
  );

  // Rendu d'une caractéristique du plan standard
  const renderFeature = (feature, included) => (
    <div className="flex items-center py-2">
      {included ? (
        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
      )}
      <span className={included ? "text-gray-800" : "text-gray-500"}>{feature}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-4xl my-8" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nos offres d'abonnement
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        {/* Sélecteur de cycle de facturation */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="bg-gray-100 p-1 rounded-full">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-sm text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  billingCycle === 'yearly'
                    ? 'bg-white shadow-sm text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
              </button>
            </div>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`rounded-lg shadow-lg overflow-hidden ${
                plan.name === 'Essential' ? 'border-2 border-green-500 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.name === 'Essential' && (
                <div className="bg-green-500 text-white text-center py-2 text-sm font-bold">
                  RECOMMANDÉ
                </div>
              )}
              
              <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
                <div className="flex justify-center">
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-green-100 text-green-600">
                    {plan.name}
                  </span>
                </div>
                <div className="mt-4 flex justify-center">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {billingCycle === 'monthly' 
                      ? `${plan.price_monthly.toFixed(2)}€` 
                      : `${plan.price_yearly.toFixed(2)}€`}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500 self-end">
                    /{billingCycle === 'monthly' ? 'mois' : 'an'}
                  </span>
                </div>

                {billingCycle === 'yearly' && (
                  <p className="mt-2 text-center text-sm text-green-600 font-medium">
                    Économisez {calculateYearlySavings(plan)}% par rapport au paiement mensuel
                  </p>
                )}
                
                <p className="mt-5 text-lg text-gray-500 text-center">
                  {plan.description}
                </p>
              </div>
              
              <div className="px-6 pt-6 pb-8 bg-gray-50 sm:p-10">
                <ul className="space-y-3">
                  {renderFeatureWithValue(
                    "Scans par jour", 
                    plan.max_scan_auto >= 9000 ? 'Illimité' : plan.max_scan_auto,
                    true
                  )}
                  
                  {renderFeatureWithValue(
                    "Recherche par code", 
                    plan.max_scan_manuel >= 9000 ? 'Illimité' : plan.max_scan_manuel,
                    true
                  )}
                  
                  {renderFeatureWithValue(
                    "Recherche par nom", 
                    plan.max_recherche >= 9000 ? 'Illimité' : plan.max_recherche,
                    true
                  )}

                  {renderFeatureWithValue(
                    "Consultation avis par jour", 
                    plan.max_consult_avis >= 9000 ? 'Illimité' : plan.max_consult_avis,
                    true
                  )}
                  
                  {/* Afficher les fonctionnalités personnalisées depuis le champ JSONB */}
                  {plan.features && Object.entries(plan.features).map(([feature, included]) => (
                    <li key={feature}>
                      {renderFeature(feature, included)}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full px-6 py-3 text-base font-medium rounded-md text-white ${
                      plan.name === 'Essential'
                        ? 'bg-green-600 hover:bg-green-700'
                        : plan.name === 'Gratuit'
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-green-500 hover:bg-green-600'
                    } transition duration-150 ease-in-out`}
                  >
                    {plan.name === 'Gratuit' ? 'Commencer gratuitement' : 'Souscrire maintenant'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Tous nos abonnements incluent un support client 7j/7 et une garantie satisfait ou remboursé de 14 jours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;