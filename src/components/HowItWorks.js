// src/components/HowItWorks.js
import React from 'react';

const HowItWorks = () => {
  return (
    <section className="py-16 bg-green-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Comment ça marche ?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
              <h3 className="text-xl font-bold text-green-800">Scannez</h3>
            </div>
            <p className="text-green-700">
              Utilisez la caméra de votre smartphone pour scanner le code-barre d'un produit alimentaire ou cosmétique.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</div>
              <h3 className="text-xl font-bold text-green-800">Découvrez</h3>
            </div>
            <p className="text-green-700">
              Consultez les avis vérifiés des autres utilisateurs et la note moyenne sur 5 étoiles.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</div>
              <h3 className="text-xl font-bold text-green-800">Partagez</h3>
            </div>
            <p className="text-green-700">
              Donnez votre propre avis après achat en téléchargeant une photo de votre ticket de caisse comme preuve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;