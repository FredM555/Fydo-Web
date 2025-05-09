// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search, AlertCircle } from 'lucide-react';

const NotFound = () => {
  // Fonction pour revenir à la page précédente
  const goBack = () => {
    window.history.back();
  };

  return (
    <section className="py-20 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8">
          {/* Icône d'erreur */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={48} className="text-red-500" />
            </div>
          </div>

          {/* Message principal */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page introuvable</h1>
          <p className="text-xl text-gray-600 mb-8">
            Oups ! La page que vous recherchez semble avoir disparu.
          </p>

          {/* Illustration */}
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Fond du code-barres */}
                <rect x="25" y="30" width="150" height="140" fill="white" rx="4" ry="4" stroke="#e2e8f0" strokeWidth="2"/>
                
                {/* Lignes du code-barres brouillées */}
                <rect x="40" y="40" width="5" height="120" fill="#cbd5e0"/>
                <rect x="50" y="40" width="3" height="120" fill="#cbd5e0"/>
                <rect x="60" y="40" width="8" height="120" fill="#cbd5e0"/>
                <rect x="75" y="40" width="2" height="120" fill="#cbd5e0"/>
                <rect x="85" y="40" width="4" height="120" fill="#cbd5e0"/>
                <rect x="95" y="40" width="6" height="120" fill="#cbd5e0"/>
                <rect x="105" y="40" width="3" height="120" fill="#cbd5e0"/>
                <rect x="115" y="40" width="7" height="120" fill="#cbd5e0"/>
                <rect x="130" y="40" width="4" height="120" fill="#cbd5e0"/>
                <rect x="140" y="40" width="5" height="120" fill="#cbd5e0"/>
                <rect x="150" y="40" width="3" height="120" fill="#cbd5e0"/>
                
                {/* X rouge pour indiquer un problème */}
                <line x1="45" y1="45" x2="155" y2="155" stroke="#f56565" strokeWidth="4"/>
                <line x1="155" y1="45" x2="45" y2="155" stroke="#f56565" strokeWidth="4"/>
              </svg>
            </div>
          </div>

          {/* Message d'erreur 404 */}
          <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full mb-8">
            Erreur 404
          </div>

          {/* Suggestions */}
          <p className="text-gray-600 mb-6">
            Vous pouvez retourner à la page d'accueil, essayer une recherche, ou revenir à la page précédente.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <button 
              onClick={goBack}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Retour
            </button>
            
            <Link 
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Home size={18} className="mr-2" />
              Accueil
            </Link>
            
            <Link 
              to="/recherche-filtre"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search size={18} className="mr-2" />
              Recherche
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;