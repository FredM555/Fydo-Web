// src/components/product/UsageQuotaDisplay.js
import React, { useEffect, useState } from 'react';
import { Info, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSubscription } from '../../services/subscriptionService';

/**
 * Composant pour afficher les quotas d'utilisation de l'utilisateur
 * - Pour l'abonnement "Gratuit" : affichage complet des quotas
 * - Pour les autres abonnements : onglet collapse qui se déploie au clic
 */
const UsageQuotaDisplay = ({ 
  userQuotas, 
  userLimits, 
  isSubscriptionLimited, 
  onUpgrade
}) => {
  // Utiliser le contexte d'authentification pour accéder à l'utilisateur connecté
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Effet pour charger l'abonnement actif depuis la base de données
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer directement depuis la table user_subscriptions
        const { subscription, plan } = await getUserSubscription(currentUser.uid);
        
        console.log("Abonnement récupéré:", subscription);
        console.log("Plan récupéré:", plan);
        
        setUserSubscription(subscription);
        setUserPlan(plan);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'abonnement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser]);

  // Pendant le chargement, afficher un placeholder ou rien
  if (loading) {
    return null;
  }

  // Ne rien afficher si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return null;
  }

  // Récupérer le nom du plan correctement
  const planName = userPlan?.name || "Gratuit";
  const isFreeAccount = planName.toLowerCase() === 'gratuit';
  
  // Style et classe conditionnels pour l'onglet premium
  const toggleBgColor = isExpanded ? 'bg-green-50' : 'bg-white';
  const toggleBorderColor = isExpanded ? 'border-green-200' : 'border-gray-200';

  // Pour l'abonnement gratuit, on affiche tout comme avant
  if (isFreeAccount) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Votre utilisation aujourd'hui</h3>
            <div className="flex items-center mt-1">
              <Crown size={14} className="text-amber-500 mr-1" />
              <span className="text-xs text-gray-600">
                Abonnement actuel: <span className="font-medium">{planName}</span>
              </span>
            </div>
          </div>
          <Link
            to="/abonnements"
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
          >
            S'abonner
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-gray-600">Scans avec caméra</p>
            <div className="mt-1 relative pt-1">
              <div className="flex mb-1 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {userQuotas.scanAuto}/{userLimits.maxScanAuto}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                <div 
                  style={{ width: `${Math.min((userQuotas.scanAuto / Math.max(userLimits.maxScanAuto, 1)) * 100, 100)}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    userQuotas.scanAuto >= userLimits.maxScanAuto ? 'bg-red-500' : 'bg-green-500'
                  }`}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Codes saisis</p>
            <div className="mt-1 relative pt-1">
              <div className="flex mb-1 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {userQuotas.scanManual}/{userLimits.maxScanManual}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                <div 
                  style={{ width: `${Math.min((userQuotas.scanManual / Math.max(userLimits.maxScanManual, 1)) * 100, 100)}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    userQuotas.scanManual >= userLimits.maxScanManual ? 'bg-red-500' : 'bg-green-500'
                  }`}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Recherches par nom</p>
            <div className="mt-1 relative pt-1">
              <div className="flex mb-1 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {userQuotas.searchName}/{userLimits.maxSearchName}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                <div 
                  style={{ width: `${Math.min((userQuotas.searchName / Math.max(userLimits.maxSearchName, 1)) * 100, 100)}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    userQuotas.searchName >= userLimits.maxSearchName ? 'bg-red-500' : 'bg-green-500'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {isSubscriptionLimited && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start">
              <Info size={16} className="text-amber-500 mr-2 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800">
                  Vous avez atteint votre limite quotidienne. Pour profiter de plus de fonctionnalités :
                </p>
                <Link
                  to="/abonnements"
                  className="mt-2 px-3 py-1 inline-block bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors"
                >
                  Passer à un abonnement supérieur
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Pour les autres abonnements, on affiche un onglet déployable
  return (
    <div className={`rounded-lg shadow-sm mb-6 border ${toggleBorderColor} transition-colors`}>
      {/* En-tête d'onglet (toujours visible) */}
      <div 
        className={`${toggleBgColor} p-4 rounded-lg cursor-pointer transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Crown size={16} className="text-green-600 mr-2" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Abonnement {planName}</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {isExpanded ? 'Cliquez pour masquer vos quotas' : 'Cliquez pour voir vos quotas et limites'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/abonnements"
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors mr-3"
            >
              Gérer
            </Link>
            {isExpanded ? 
              <ChevronUp size={18} className="text-gray-600" /> : 
              <ChevronDown size={18} className="text-gray-600" />
            }
          </div>
        </div>
      </div>
      
      {/* Contenu de l'onglet (visible uniquement si déployé) */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Scans avec caméra</p>
              <div className="mt-1 relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {userQuotas.scanAuto}/{userLimits.maxScanAuto === 9999 ? '∞' : userLimits.maxScanAuto}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                  <div 
                    style={{ width: userLimits.maxScanAuto === 9999 ? '10%' : `${Math.min((userQuotas.scanAuto / Math.max(userLimits.maxScanAuto, 1)) * 100, 100)}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Codes saisis</p>
              <div className="mt-1 relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {userQuotas.scanManual}/{userLimits.maxScanManual === 9999 ? '∞' : userLimits.maxScanManual}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                  <div 
                    style={{ width: userLimits.maxScanManual === 9999 ? '10%' : `${Math.min((userQuotas.scanManual / Math.max(userLimits.maxScanManual, 1)) * 100, 100)}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Recherches par nom</p>
              <div className="mt-1 relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {userQuotas.searchName}/{userLimits.maxSearchName === 9999 ? '∞' : userLimits.maxSearchName}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                  <div 
                    style={{ width: userLimits.maxSearchName === 9999 ? '10%' : `${Math.min((userQuotas.searchName / Math.max(userLimits.maxSearchName, 1)) * 100, 100)}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Avantages du plan */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Avantages de votre abonnement {planName}</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {userLimits.maxScanAuto >= 9999 && (
                <li className="flex items-center">
                  <span className="text-green-500 mr-1">✓</span> Scans illimités avec caméra
                </li>
              )}
              {userLimits.maxScanManual >= 9999 && (
                <li className="flex items-center">
                  <span className="text-green-500 mr-1">✓</span> Saisie manuelle de codes illimitée
                </li>
              )}
              {userLimits.maxSearchName >= 9999 && (
                <li className="flex items-center">
                  <span className="text-green-500 mr-1">✓</span> Recherches par nom illimitées
                </li>
              )}
              {/* Afficher d'autres avantages selon le plan */}
              <li className="flex items-center">
                <span className="text-green-500 mr-1">✓</span> Accès à toutes les fonctionnalités premium
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-1">✓</span> Support prioritaire
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageQuotaDisplay;