// src/components/Features.js
import React from 'react';
import { Check } from 'lucide-react';

const Features = () => {
  return (
    <section id="fonctionnalites" className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Pourquoi choisir FYDO ?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4 text-green-600">
              <Check size={24} className="mr-2" />
              <h3 className="font-bold text-lg">Avis fiables</h3>
            </div>
            <p className="text-green-700">
              Tous les avis sont vérifiés par preuve d'achat pour une fiabilité maximale.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4 text-green-600">
              <Check size={24} className="mr-2" />
              <h3 className="font-bold text-lg">Simple et rapide</h3>
            </div>
            <p className="text-green-700">
              Scannez et obtenez toutes les informations en quelques secondes.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4 text-green-600">
              <Check size={24} className="mr-2" />
              <h3 className="font-bold text-lg">Communauté active</h3>
            </div>
            <p className="text-green-700">
              Rejoignez des milliers d'utilisateurs qui partagent leurs expériences.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4 text-green-600">
              <Check size={24} className="mr-2" />
              <h3 className="font-bold text-lg">Mise à jour continue</h3>
            </div>
            <p className="text-green-700">
              Notre base de données s'enrichit chaque jour de nouveaux produits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;