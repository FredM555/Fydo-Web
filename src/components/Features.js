// src/components/FeaturesEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import { Check, Star, Users, Clock, Shield, Zap, Award } from 'lucide-react';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const sectionRef = useRef(null);

  // Observer pour déclencher l'animation lorsque la section est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Auto-rotation des fonctionnalités
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % features.length;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  // Liste des fonctionnalités principales
  const features = [
    {
      id: 'verified',
      icon: <Check size={24} className="text-green-600" />,
      title: "Avis fiables",
      description: "Tous les avis sont vérifiés par preuve d'achat pour une fiabilité maximale.",
      color: "bg-green-100",
      highlight: "bg-green-200"
    },
    {
      id: 'fast',
      icon: <Zap size={24} className="text-green-600" />,
      title: "Simple et rapide",
      description: "Scannez et obtenez toutes les informations en quelques secondes.",
      color: "bg-green-100",
      highlight: "bg-green-200"
    },
    {
      id: 'community',
      icon: <Users size={24} className="text-green-600" />,
      title: "Communauté active",
      description: "Rejoignez des milliers d'utilisateurs qui partagent leurs expériences.",
      color: "bg-green-100",
      highlight: "bg-green-200"
    },
    {
      id: 'rewards',
      icon: <Award size={24} className="text-amber-600" />,
      title: "Système de récompenses",
      description: "Gagnez des badges et des statuts en fonction de vos contributions à la communauté.",
      color: "bg-amber-50",
      highlight: "bg-amber-100"
    }
  ];

  // Avantages supplémentaires
  const benefits = [
    {
      icon: <Star size={20} className="text-amber-500 fill-amber-500" />,
      title: "Notes détaillées",
      description: "Évaluations sur plusieurs critères pour une vision complète du produit."
    },
    {
      icon: <Shield size={20} className="text-green-600" />,
      title: "Sécurité des données",
      description: "Vos informations personnelles sont toujours protégées et sécurisées."
    },
    {
      icon: <Clock size={20} className="text-green-600" />,
      title: "Mise à jour continue",
      description: "Notre base de données s'enrichit chaque jour de nouveaux produits."
    }
  ];

  return (
    <section ref={sectionRef} id="fonctionnalites" className="py-20 bg-green-50 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-200 rounded-full transform -translate-y-1/2 opacity-30"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-green-200 rounded-full transform translate-y-1/2 opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-green-800 mb-3">Pourquoi choisir FYDO ?</h2>
          <p className="text-green-700 max-w-2xl mx-auto">
            Une application conçue pour vous aider à faire des choix éclairés dans votre quotidien
          </p>
        </div>
        
        {/* Fonctionnalités principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${activeFeature === index ? feature.highlight : feature.color} p-6 rounded-xl shadow-sm transition-all duration-500 transform ${
                isVisible 
                  ? `opacity-100 translate-y-0 ${activeFeature === index ? 'scale-105' : 'scale-100'}`
                  : 'opacity-0 translate-y-20'
              } hover:shadow-md cursor-pointer`}
              style={{ transitionDelay: `${isVisible ? index * 150 : 0}ms` }}
              onClick={() => setActiveFeature(index)}
            >
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="font-bold text-lg ml-2 text-green-800">{feature.title}</h3>
              </div>
              <p className="text-green-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Section témoignage */}
        <div className={`mb-16 max-w-4xl mx-auto transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gradient-to-br from-green-600 to-green-700 p-6 flex flex-col justify-center">
                <div className="text-white mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} className="text-amber-400 fill-amber-400 mr-1" />
                    ))}
                  </div>
                </div>
                <p className="text-white text-lg italic mb-4">
                  "FYDO a complètement changé ma façon de choisir mes produits. Je fais confiance aux avis et je partage mes propres expériences régulièrement."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white font-bold mr-3">M</div>
                  <div>
                    <p className="text-white font-bold">Marie L.</p>
                    <p className="text-green-100 text-sm">Utilisatrice depuis 6 mois</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">Les avantages exclusifs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        {benefit.icon}
                        <h4 className="font-semibold text-green-800 ml-2">{benefit.title}</h4>
                      </div>
                      <p className="text-sm text-green-700">{benefit.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Award size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">Programme de fidélité</h4>
                      <p className="text-sm text-amber-700">
                        Obtenez des badges spéciaux et évoluez de Bronze à Diamant en partageant des avis de qualité. Chaque contribution compte et renforce votre statut dans la communauté.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-800 mb-2">10,000+</div>
              <p className="text-green-700">Utilisateurs actifs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-800 mb-2">50,000+</div>
              <p className="text-green-700">Produits référencés</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-800 mb-2">100,000+</div>
              <p className="text-green-700">Avis vérifiés</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;