// src/components/common/AuthRequiredScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AuthRequiredScreen = ({ redirectPath = '/recherche-filtre' }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <Lock size={48} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Connexion requise</h2>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour accéder à cette fonctionnalité.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/login', { state: { redirectTo: redirectPath } })}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/signup', { state: { redirectTo: redirectPath } })}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredScreen;