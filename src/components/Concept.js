// src/components/ConceptEnhanced.js
import React, { useState, useEffect } from 'react';
import { Camera, Star, ShoppingBag, Coffee, Shield, Check, ChevronRight } from 'lucide-react';

const Concept = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [animationDone, setAnimationDone] = useState(false);

  // Déclencher l'animation initiale
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const nextSection = () => {
    if (activeSection < 4) {
      setActiveSection(activeSection + 1);
    } else {
      setActiveSection(1);
    }
  };

  const conceptSteps = [
    {
      id: 1,
      icon: <Camera size={32} className="text-green-700" />,
      title: "Sélection par Scan",
      description: "Scannez simplement le code-barres du produit pour accéder instantanément à ses informations."
    },
    {
      id: 2,
      icon: <Star size={32} className="text-amber-600 fill-amber-500" />,
      title: "Avis Utilisateurs",
      description: "Consultez les évaluations sur 5 étoiles et les commentaires des utilisateurs réels."
    },
    {
      id: 3,
      icon: <ShoppingBag size={32} className="text-green-700" />,
      title: "Preuve d'Achat",
      description: "Garantie de fiabilité: les avis sont vérifiés par tickets de caisse pour plus d'authenticité."
    },
    {
      id: 4,
      icon: <Coffee size={32} className="text-green-700" />,
      title: "Produits Ciblés",
      description: "Spécialisé dans les produits alimentaires et cosmétiques pour des choix éclairés au quotidien."
    }
  ];

  const detailedExplanations = {
    1: "Grâce à la technologie de reconnaissance optique, FYDO identifie instantanément le produit scanné. Il suffit de pointer la caméra de votre téléphone vers le code-barres, et en quelques secondes vous accédez à toutes les informations et avis sur ce produit.",
    2: "Contrairement à de nombreuses plateformes, FYDO assure que chaque avis provient d'un utilisateur ayant réellement acheté le produit. Notre système de notation sur 5 étoiles permet d'évaluer rapidement la satisfaction globale, complétée par des commentaires détaillés.",
    3: "Pour donner votre avis, il vous suffit de prendre en photo votre ticket de caisse. Notre système vérifie automatiquement la présence du produit sur le ticket, garantissant ainsi que tous les avis proviennent d'acheteurs réels.",
    4: "FYDO se concentre sur deux catégories essentielles de votre quotidien : les produits alimentaires (aliments, boissons, compléments) et les produits cosmétiques (soins, maquillage, parfums). Notre base de données s'enrichit chaque jour grâce à la contribution des utilisateurs."
  };

  return (
    <section id="concept" className="py-20 bg-white relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-green-50 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 transform ${animationDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Notre Concept</h2>
          <p className="text-green-700 max-w-2xl mx-auto">
            Une approche innovante pour révolutionner vos choix de produits au quotidien avec des avis authentiques et vérifiés
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-start md:space-x-8 space-y-8 md:space-y-0 mb-12">
          {conceptSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`bg-white rounded-xl shadow-md p-6 max-w-xs w-full cursor-pointer transition-all duration-500 hover:shadow-lg ${
                activeSection === step.id 
                  ? 'ring-2 ring-green-600 transform scale-105' 
                  : 'border border-gray-100'
              } ${animationDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              onClick={() => setActiveSection(step.id)}
              style={{ transitionDelay: `${animationDone ? 0 : 300 + index * 100}ms` }}
            >
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto transition-colors ${
                activeSection === step.id ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                {React.cloneElement(step.icon, { 
                  className: activeSection === step.id ? "text-amber-600 fill-amber-500" : "text-green-700"
                })}
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-green-800">
                {step.id}. {step.title}
              </h3>
              <p className="text-center text-green-700">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div 
          className={`bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm p-6 max-w-3xl mx-auto transition-all duration-700 transform ${
            animationDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{ transitionDelay: `${animationDone ? 0 : 800}ms` }}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              {React.cloneElement(conceptSteps[activeSection-1].icon, { 
                size: 24,
                className: "text-amber-600 fill-amber-500"
              })}
            </div>
            <h3 className="text-xl font-bold text-green-800">
              {conceptSteps[activeSection-1].title}
            </h3>
          </div>
          
          <p className="text-green-700 mb-6">
            {detailedExplanations[activeSection]}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:justify-between items-center">
            <div className="flex mb-4 sm:mb-0">
              {[1, 2, 3, 4].map((num) => (
                <button 
                  key={num}
                  onClick={() => setActiveSection(num)}
                  className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                    activeSection === num ? 'bg-amber-500' : 'bg-green-300'
                  }`}
                  aria-label={`Étape ${num}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextSection}
              className="bg-green-800 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              Étape suivante
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Pourquoi choisir Fydo */}
        <div className={`mt-20 transition-all duration-700 transform ${animationDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: `${animationDone ? 0 : 1000}ms` }}>
          <h3 className="text-2xl font-bold text-center text-green-800 mb-8">Pourquoi choisir FYDO ?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Shield size={24} className="text-green-600" />}
              title="Avis fiables"
              description="Tous les avis sont vérifiés par preuve d'achat pour une fiabilité maximale."
              delay={0}
            />
            
            <FeatureCard 
              icon={<Camera size={24} className="text-green-600" />}
              title="Simple et rapide"
              description="Scannez et obtenez toutes les informations en quelques secondes."
              delay={100}
            />
            
            <FeatureCard 
              icon={<Star size={24} className="text-green-600" />}
              title="Communauté active"
              description="Rejoignez des milliers d'utilisateurs qui partagent leurs expériences."
              delay={200}
            />
            
            <FeatureCard 
              icon={<Check size={24} className="text-green-600" />}
              title="Mise à jour continue"
              description="Notre base de données s'enrichit chaque jour de nouveaux produits."
              delay={300}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Composant de carte de fonctionnalité
const FeatureCard = ({ icon, title, description, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200 + delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="font-bold text-lg ml-2 text-green-800">{title}</h3>
      </div>
      <p className="text-green-700">
        {description}
      </p>
    </div>
  );
};

export default Concept;