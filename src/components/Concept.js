// src/components/Concept.js
import React, { useState } from 'react';
import { Camera, Star, ShoppingBag, Coffee } from 'lucide-react';

const Concept = () => {
  const [activeSection, setActiveSection] = useState(1);

  const nextSection = () => {
    if (activeSection < 4) {
      setActiveSection(activeSection + 1);
    } else {
      setActiveSection(1);
    }
  };

  return (
    <section id="concept" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Notre Concept</h2>
        
        <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 space-y-8 md:space-y-0">
          <div 
            className={`bg-green-50 p-6 rounded-xl shadow-md max-w-xs w-full cursor-pointer transform transition-transform duration-300 ${activeSection === 1 ? 'scale-105 border-2 border-green-500' : ''}`}
            onClick={() => setActiveSection(1)}
          >
            <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
              <Camera size={32} className="text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-green-800 text-center mb-2">1. Sélection par Scan</h3>
            <p className="text-green-700 text-center">
              Scannez simplement le code-barre du produit pour accéder instantanément à ses informations.
            </p>
          </div>
          
          <div 
            className={`bg-green-50 p-6 rounded-xl shadow-md max-w-xs w-full cursor-pointer transform transition-transform duration-300 ${activeSection === 2 ? 'scale-105 border-2 border-green-500' : ''}`}
            onClick={() => setActiveSection(2)}
          >
            <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
              <Star size={32} className="text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-green-800 text-center mb-2">2. Avis Utilisateurs</h3>
            <p className="text-green-700 text-center">
              Consultez les évaluations sur 5 étoiles et les commentaires des utilisateurs réels.
            </p>
          </div>
          
          <div 
            className={`bg-green-50 p-6 rounded-xl shadow-md max-w-xs w-full cursor-pointer transform transition-transform duration-300 ${activeSection === 3 ? 'scale-105 border-2 border-green-500' : ''}`}
            onClick={() => setActiveSection(3)}
          >
            <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
              <ShoppingBag size={32} className="text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-green-800 text-center mb-2">3. Preuve d'Achat</h3>
            <p className="text-green-700 text-center">
              Garantie de fiabilité: les avis sont vérifiés par tickets de caisse pour plus d'authenticité.
            </p>
          </div>
          
          <div 
            className={`bg-green-50 p-6 rounded-xl shadow-md max-w-xs w-full cursor-pointer transform transition-transform duration-300 ${activeSection === 4 ? 'scale-105 border-2 border-green-500' : ''}`}
            onClick={() => setActiveSection(4)}
          >
            <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
              <Coffee size={32} className="text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-green-800 text-center mb-2">4. Produits Ciblés</h3>
            <p className="text-green-700 text-center">
              Spécialisé dans les produits alimentaires et cosmétiques pour des choix éclairés au quotidien.
            </p>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-green-100 rounded-xl max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            {activeSection === 1 && "Comment fonctionne le scan de produit ?"}
            {activeSection === 2 && "Pourquoi faire confiance aux avis FYDO ?"}
            {activeSection === 3 && "Comment fonctionne la vérification par ticket de caisse ?"}
            {activeSection === 4 && "Quels produits sont disponibles sur FYDO ?"}
          </h3>
          <p className="text-green-700 mb-4">
            {activeSection === 1 && "Grâce à la technologie de reconnaissance optique, FYDO identifie instantanément le produit scanné. Il suffit de pointer la caméra de votre téléphone vers le code-barre, et en quelques secondes vous accédez à toutes les informations et avis sur ce produit."}
            {activeSection === 2 && "Contrairement à de nombreuses plateformes, FYDO assure que chaque avis provient d'un utilisateur ayant réellement acheté le produit. Notre système de notation sur 5 étoiles permet d'évaluer rapidement la satisfaction globale, complétée par des commentaires détaillés."}
            {activeSection === 3 && "Pour donner votre avis, il vous suffit de prendre en photo votre ticket de caisse. Notre système vérifie automatiquement la présence du produit sur le ticket, garantissant ainsi que tous les avis proviennent d'acheteurs réels."}
            {activeSection === 4 && "FYDO se concentre sur deux catégories essentielles de votre quotidien : les produits alimentaires (aliments, boissons, compléments) et les produits cosmétiques (soins, maquillage, parfums). Notre base de données s'enrichit chaque jour grâce à la contribution des utilisateurs."}
          </p>
          <button 
            onClick={nextSection}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </section>
  );
};

export default Concept;