// src/components/HeroEnhanced.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Scan, Star, Shield, Users } from 'lucide-react';

const Hero = () => {
  // États pour les animations séquentielles
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showScanCard, setShowScanCard] = useState(false);
  const [showFeatureCards, setShowFeatureCards] = useState(false);
  const [hoverScan, setHoverScan] = useState(false);

  // Déclencher les animations séquentiellement
  useEffect(() => {
    const titleTimer = setTimeout(() => setShowTitle(true), 100);
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 200);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 300);
    const scanCardTimer = setTimeout(() => setShowScanCard(true), 400);
    const cardsTimer = setTimeout(() => setShowFeatureCards(true), 500);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(buttonsTimer);
      clearTimeout(scanCardTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  // Caractéristiques principales affichées dans les cartes
  const features = [
    {
      id: 'scan',
      icon: <Scan className="text-green-800" size={24} />,
      title: 'Scan Produit',
      description: 'Scannez et accédez aux infos en un instant'
    },
    {
      id: 'reviews',
      icon: <Star className="text-amber-500 fill-amber-500" size={24} />,
      title: 'Avis Vérifiés',
      description: 'Des avis authentifiés par ticket de caisse'
    },
    {
      id: 'community',
      icon: <Users className="text-green-800" size={24} />,
      title: 'Communauté',
      description: 'Partagez votre expérience avec des milliers d\'utilisateurs'
    },
    {
      id: 'trust',
      icon: <Shield className="text-green-800" size={24} />,
      title: 'Fiabilité',
      description: 'Des avis fiables pour des choix éclairés'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-green-50 to-green-100 pt-16 pb-24 overflow-hidden">
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-200 rounded-full opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Partie gauche: Texte et CTA */}
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 
              className={`text-4xl md:text-5xl font-bold text-green-800 mb-6 transition-all duration-700 transform ${
                showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Des avis fiables sur vos produits du quotidien
            </h1>
            
            <p 
              className={`text-xl text-green-700 mb-8 max-w-lg transition-all duration-700 delay-300 transform ${
                showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Scannez, découvrez, partagez. FYDO révolutionne la façon dont vous choisissez vos produits alimentaires et cosmétiques grâce à une communauté d'avis vérifiés.
            </p>
            
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 transform ${
                showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Link 
                to="/recherche-filtre" 
                className="bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                Essayer maintenant <ArrowRight className="ml-2" size={18} />
              </Link>
              
              <a 
                href="#telecharger" 
                className="bg-white hover:bg-gray-50 text-green-800 font-bold py-3 px-6 rounded-lg transition duration-300 border border-green-800 shadow-sm hover:shadow-md"
              >
                Télécharger l'app
              </a>
            </div>
            
            <div 
              className={`mt-8 flex items-center transition-all duration-700 delay-700 ${
                showButtons ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(num => (
                  <div 
                    key={num} 
                    className="w-8 h-8 rounded-full bg-green-700 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="ml-3 text-sm text-green-700">
                <span className="font-bold">1000+</span> avis ajoutés chaque jour
              </p>
            </div>
          </div>
          
          {/* Partie droite: Carte de scan cliquable */}
          <div 
            className={`md:w-1/2 flex justify-center transition-all duration-1000 delay-700 transform ${
              showScanCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            }`}
          >
            <Link 
              to="/recherche-filtre" 
              className="relative"
              onMouseEnter={() => setHoverScan(true)}
              onMouseLeave={() => setHoverScan(false)}
            >
              {/* Effet d'ombre animé */}
              <div className={`absolute inset-0 bg-green-300 rounded-2xl transform transition-all duration-300 ${hoverScan ? 'scale-105 -rotate-2 opacity-20' : 'scale-100 opacity-0'}`}></div>
              
              {/* Carte de scan principale */}
              <div className={`w-80 bg-green-50 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-300 ${hoverScan ? 'shadow-xl transform translate-y-[-5px]' : ''}`}>
                {/* Icône dans un cercle */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Camera size={40} className="text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-green-800 mb-3">Scannez le code-barre</h2>
                
                <p className="text-green-700 mb-6">
                  Découvrez tous les avis utilisateurs en un instant
                </p>
                
                {/* Notation étoiles */}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={24} 
                      className={`${star <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"} mx-0.5`} 
                    />
                  ))}
                </div>
                
                {/* Badge "Essayer" qui apparaît au survol */}
                <div className={`absolute -bottom-3 bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  hoverScan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                  Essayer maintenant
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Cartes de caractéristiques */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-1000 transform ${
            showFeatureCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              style={{ transitionDelay: `${1000 + (index * 150)}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-green-800 mb-2">{feature.title}</h3>
              <p className="text-green-700 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Vague décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ 
        clipPath: 'polygon(0% 0%, 100% 100%, 100% 100%, 0% 100%)' 
      }}></div>
    </section>
  );
};

export default Hero;