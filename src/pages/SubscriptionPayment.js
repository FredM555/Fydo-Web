// src/pages/SubscriptionPayment.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const SubscriptionPayment = () => {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const billingCycle = location.state?.billingCycle || 'monthly';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Formulaire de paiement
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    acceptTerms: false
  });

  useEffect(() => {
    // Rediriger vers la connexion si non connecté
    if (!currentUser) {
      navigate('/login', { state: { redirectTo: `/subscribe/${planId}` } });
      return;
    }

    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
        
        if (error) throw error;
        
        setPlan(data);
      } catch (err) {
        console.error('Erreur lors du chargement du plan:', err.message);
        setError("Impossible de charger les détails de l'abonnement. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Formatage du numéro de carte
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formatage de la date d'expiration
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });
  };

  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setFormData({
      ...formData,
      expiryDate: formattedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Dans une application réelle, vous intégreriez ici un service de paiement comme Stripe
      // Simulation d'un délai de traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculer la date de fin basée sur la durée du plan
      const startDate = new Date();
      const endDate = new Date();
      
      if (billingCycle === 'monthly') {
        endDate.setDate(endDate.getDate() + plan.duration_days);
      } else {
        // Pour l'abonnement annuel, on multiplie la durée par 12
        endDate.setDate(endDate.getDate() + (plan.duration_days * 12));
      }
      
      // Créer l'abonnement dans Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', currentUser.uid)
        .single();
        
      if (userError) throw userError;
      
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: userData.id,
            firebase_uid: currentUser.uid,
            plan_id: planId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
            payment_status: 'completed',
            payment_method: 'card',
            is_auto_renew: true
          }
        ]);
        
      if (subscriptionError) throw subscriptionError;
      
      // Mettre à jour le type d'utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: plan.name })
        .eq('id', userData.id);
        
      if (updateError) throw updateError;
      
      setPaymentSuccess(true);
    } catch (err) {
      console.error("Erreur lors du traitement du paiement:", err.message);
      setError("Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !paymentSuccess) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-4xl my-8" role="alert">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/abonnements')}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Retour aux abonnements
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Paiement réussi!</h2>
          <p className="mt-2 text-gray-600">
            Merci pour votre abonnement à notre offre {plan.name}. Votre abonnement est maintenant actif.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="mt-6 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
          >
            Accéder à mon profil
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour afficher une caractéristique avec une valeur
  const renderFeatureWithValue = (label, value) => (
    <li className="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>
        {label}: <span className="font-bold text-green-600">{value}</span>
      </span>
    </li>
  );

  // Fonction pour afficher une caractéristique standard
  const renderFeature = (feature) => (
    <li className="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{feature}</span>
    </li>
  );

  return (
    <div className="max-w-4xl mx-auto my-12 p-4 md:p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Résumé de la commande */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Résumé de votre abonnement</h2>
          
          <div className="border-t border-b border-gray-200 py-4 my-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Plan</span>
              <span className="font-bold text-green-600">{plan?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Cycle de facturation</span>
              <span>{billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Prix</span>
              <span className="font-bold">
                {billingCycle === 'monthly' 
                  ? `${plan?.price_monthly.toFixed(2)}€ /mois` 
                  : `${plan?.price_yearly.toFixed(2)}€ /an`}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Ce qui est inclus:</h3>
            <ul className="space-y-2">
              {renderFeatureWithValue(
                "Scans par jour", 
                plan?.max_scan_auto >= 9000 ? 'Illimité' : plan?.max_scan_auto
              )}
              
              {renderFeatureWithValue(
                "Scans manuels par jour", 
                plan?.max_scan_manuel >= 9000 ? 'Illimité' : plan?.max_scan_manuel
              )}
              
              {renderFeatureWithValue(
                "Recherches produit par jour", 
                plan?.max_recherche >= 9000 ? 'Illimité' : plan?.max_recherche
              )}

              {renderFeatureWithValue(
                "Consultation avis par jour", 
                plan?.max_consult_avis >= 9000 ? 'Illimité' : plan?.max_consult_avis
              )}
              
              {/* Fonctionnalités supplémentaires */}
              {plan?.features && Object.entries(plan.features)
                .filter(([_, included]) => included)
                .map(([feature, _]) => (
                <li key={feature} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Formulaire de paiement */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations de paiement</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="cardName" className="block text-gray-700 font-medium mb-2">
                Nom sur la carte
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                Numéro de carte
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="expiryDate" className="block text-gray-700 font-medium mb-2">
                  Date d'expiration
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleExpiryDateChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-gray-700 font-medium mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  J'accepte les <a href="/terms" className="text-green-600 hover:text-green-800">Conditions d'utilisation</a> et la <a href="/privacy" className="text-green-600 hover:text-green-800">Politique de confidentialité</a>
                </label>
              </div>
              {error && !formData.acceptTerms && (
                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total à payer</span>
                <span className="font-bold text-xl">
                  {billingCycle === 'monthly' 
                    ? `${plan?.price_monthly.toFixed(2)}€` 
                    : `${plan?.price_yearly.toFixed(2)}€`}
                </span>
              </div>
              
              <button
                type="submit"
                className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  processing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  'Payer maintenant'
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Paiement sécurisé. Votre abonnement sera actif immédiatement après confirmation du paiement.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;