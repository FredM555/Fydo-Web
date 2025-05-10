// src/components/UsageQuotaDisplay.js
import React from 'react';
import { Info } from 'lucide-react';

/**
 * Composant pour afficher les quotas d'utilisation de l'utilisateur
 * @param {Object} userQuotas - Quotas actuels de l'utilisateur
 * @param {Object} userLimits - Limites d'utilisation selon l'abonnement
 * @param {boolean} isSubscriptionLimited - Si l'utilisateur a atteint ses limites
 * @param {function} onUpgrade - Fonction à exécuter lors du clic sur le bouton de mise à niveau
 */
const UsageQuotaDisplay = ({ userQuotas, userLimits, isSubscriptionLimited, onUpgrade }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Votre utilisation aujourd'hui</h3>
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
                }`}>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-gray-600">Codes manuels</p>
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
                }`}>
              </div>
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
                }`}>
              </div>
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
                Vous avez atteint votre limite quotidienne. Pour profiter de plus de fonctionnalités:
              </p>
              <button
                onClick={onUpgrade}
                className="mt-2 px-3 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors"
              >
                Passer à un abonnement supérieur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageQuotaDisplay;