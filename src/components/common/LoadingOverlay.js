import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center max-w-md w-full mx-4">
        <svg className="animate-spin h-12 w-12 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-medium text-green-800 mb-2">Recherche en cours...</h3>
        <p className="text-green-600 text-center">Veuillez patienter pendant que nous recherchons les informations du produit</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;