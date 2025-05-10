// src/components/product/BarcodeSearchForm.js
import React, { useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import BarcodeScanner from '../BarcodeScanner';
import { Link } from 'react-router-dom';

/**
 * Formulaire de recherche par code-barres
 */
const BarcodeSearchForm = ({
  barcode,
  setBarcode,
  onSearch,
  onScan,
  isMobile,
  showScanner,
  setShowScanner,
  setBarcodeSource,
  isAuthorized,
  loading
}) => {
  // État pour gérer l'affichage des alertes d'autorisation
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null); // 'scan' ou 'manual_entry'

  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isAuthorized && !isAuthorized('manual_entry')) {
        showAuthorizationAlert('manual_entry');
        return;
      }
      setBarcodeSource('manual_entry');
      onSearch();
    }
  };
  
  // Ouvrir le scanner de code-barres
  const handleOpenCamera = () => {
    if (!isAuthorized('scan')) {
      showAuthorizationAlert('scan');
      return;
    }
    setBarcodeSource('scan');
    setShowScanner(true);
  };
  
  // Lancer la recherche
  const handleSearchClick = () => {
    if (!isAuthorized('manual_entry')) {
      showAuthorizationAlert('manual_entry');
      return;
    }
    setBarcodeSource('manual_entry');
    onSearch();
  };

  // Afficher un message d'alerte pour les fonctions non autorisées
  const showAuthorizationAlert = (type) => {
    setAlertType(type);
    setAlertMessage(
      type === 'scan' 
        ? "Vous avez atteint votre limite quotidienne de scans. Passez à un abonnement supérieur pour continuer." 
        : "Vous avez atteint votre limite quotidienne de recherches manuelles. Passez à un abonnement supérieur pour continuer."
    );
    
    // Masquer l'alerte après 5 secondes
    setTimeout(() => {
      setAlertMessage(null);
      setAlertType(null);
    }, 5000);
  };
  
  // Réinitialiser l'alerte
  const dismissAlert = () => {
    setAlertMessage(null);
    setAlertType(null);
  };
  
  if (showScanner) {
    return (
      <div className="mb-6">
        <BarcodeScanner onScanComplete={onScan} autoStart={true} />
        <button
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors block mx-auto"
          onClick={() => setShowScanner(false)}
        >
          Annuler le scan
        </button>
      </div>
    );
  }
  
  // Message d'alerte
  const alertComponent = alertMessage && (
    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle size={16} className="text-amber-500 mr-2 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-amber-800">{alertMessage}</p>
          <div className="mt-2 flex space-x-2">
            <Link
              to="/abonnements"
              className="px-3 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 transition-colors"
            >
              S'abonner
            </Link>
            <button 
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
              onClick={dismissAlert}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Version desktop
  if (!isMobile) {
    return (
      <div className="mb-6">
        {alertComponent}
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`flex-1 px-4 py-2 border ${alertType === 'manual_entry' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Saisissez le code-barres (ex: 3017620422003)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          <button
            className={`px-4 py-2 ${!isAuthorized('scan') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center`}
            onClick={handleOpenCamera}
            aria-label="Scanner un code-barres"
          >
            <Camera size={20} />
          </button>
          
          <button
            className={`px-4 py-2 ${loading || !isAuthorized('manual_entry') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center min-w-[100px]`}
            onClick={handleSearchClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche...
              </>
            ) : 'Rechercher'}
          </button>
        </div>
      </div>
    );
  }
  
  // Version mobile
  return (
    <div className="mb-6 space-y-2">
      {alertComponent}
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`w-full px-4 py-2 border ${alertType === 'manual_entry' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        placeholder="Saisissez le code-barres (ex: 3017620422003)"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      <div className="flex space-x-2">
        <button
          className={`flex-1 px-4 py-2 ${!isAuthorized('scan') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center`}
          onClick={handleOpenCamera}
          aria-label="Scanner un code-barres"
        >
          <Camera size={18} className="mr-1" />
          <span>Scanner</span>
        </button>
        
        <button
          className={`flex-1 px-4 py-2 ${loading || !isAuthorized('manual_entry') ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center`}
          onClick={handleSearchClick}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recherche...
            </>
          ) : 'Rechercher'}
        </button>
      </div>
    </div>
  );
};

export default BarcodeSearchForm;