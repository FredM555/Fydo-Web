// src/components/Hero.js
import React from 'react';
import { ArrowRight, Camera, Star } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-green-100 to-green-200 py-16">
      {/* Conteneur principal avec les mêmes marges que le header pour s'aligner sur les lignes jaunes */}
      <div className="mx-auto" style={{ maxWidth: '1380px', padding: '0 80px' }}>
        <div className="flex justify-between items-start">
          {/* Colonne de gauche - Contenu principal, aligné exactement avec la ligne jaune */}
          <div className="w-1/2 pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
              Des avis fiables sur vos produits préférés
            </h1>
            <p className="text-xl text-green-700 mb-6">
              Scannez, découvrez, partagez. FYDO révolutionne la façon dont vous choisissez vos produits alimentaires et cosmétiques.
            </p>
            <div className="flex space-x-4">
              <a href="#telecharger" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center">
                Télécharger <ArrowRight className="ml-2" size={18} />
              </a>
              <a href="#concept" className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition duration-300">
                En savoir plus
              </a>
            </div>
          </div>
          
          {/* Colonne de droite - Carte scanner, alignée exactement avec la ligne jaune droite */}
          <div className="w-1/2 flex justify-end">
            <Link 
              to="/recherche-filtre?openScanner=true" 
              className="relative w-64 h-96 bg-white rounded-3xl shadow-xl p-4 border-8 border-gray-100 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="w-full h-full bg-green-50 rounded-2xl flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <Camera size={48} className="text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-green-800 text-lg font-bold mb-2">Scannez le code-barre</h3>
                  <p className="text-green-600">
                    Découvrez tous les avis utilisateurs en un instant
                  </p>
                  <div className="flex justify-center mt-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={24} 
                          className={star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;