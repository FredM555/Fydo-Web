// src/components/HowItWorksEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import { Scan, Star, Upload } from 'lucide-react';

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
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

  // Rotation automatique des étapes
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Configuration des étapes
  const steps = [
    {
      number: 1,
      icon: <Scan size={32} className="text-white" />,
      title: "Scannez",
      description: "Utilisez la caméra de votre smartphone pour scanner le code-barres d'un produit alimentaire ou cosmétique.",
      color: "bg-green-600",
      image: "/path/to/scan-image.png" // Facultatif
    },
    {
      number: 2,
      icon: <Star size={32} className="text-white" />,
      title: "Découvrez",
      description: "Consultez les avis vérifiés des autres utilisateurs et la note moyenne sur 5 étoiles.",
      color: "bg-amber-500",
      image: "/path/to/discover-image.png" // Facultatif
    },
    {
      number: 3,
      icon: <Upload size={32} className="text-white" />,
      title: "Partagez",
      description: "Donnez votre propre avis après achat en téléchargeant une photo de votre ticket de caisse comme preuve.",
      color: "bg-green-600",
      image: "/path/to/share-image.png" // Facultatif
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-green-50">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-green-800 mb-2">Comment ça marche ?</h2>
          <p className="text-green-700 max-w-2xl mx-auto">
            FYDO simplifie l'accès à des informations fiables sur les produits que vous consommez au quotidien
          </p>
        </div>
        
        {/* Barre de progression */}
        <div className={`max-w-3xl mx-auto mb-12 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative h-2 bg-green-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-500 ease-in-out"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  activeStep >= step.number 
                    ? step.number === 2 ? 'bg-amber-500 text-white' : 'bg-green-600 text-white' 
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {step.number}
                <span className={`absolute -bottom-6 text-xs font-medium transition-colors duration-300 ${
                  activeStep === step.number ? 'text-green-800' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`bg-white p-6 rounded-xl shadow-md transition-all duration-500 transform ${
                activeStep === step.number 
                  ? 'ring-2 ring-green-600 scale-105 z-10' 
                  : activeStep > step.number 
                    ? 'opacity-70 scale-95' 
                    : 'opacity-50 scale-95'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${isVisible ? (step.number - 1) * 200 : 0}ms` }}
            >
              <div className="flex items-center mb-4">
                <div className={`${step.color} text-white rounded-full w-10 h-10 flex items-center justify-center mr-3`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-green-800">{step.title}</h3>
              </div>
              <p className="text-green-700 mb-6">
                {step.description}
              </p>
              
              {/* Icône illustrative */}
              <div className="flex justify-center">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 ${
                  activeStep === step.number ? 'transform scale-110' : ''
                }`}>
                  {step.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Section explicative supplémentaire */}
        <div className={`mt-16 bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto transition-all duration-700 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h3 className="text-xl font-bold text-green-800 mb-4 text-center">Pourquoi avons-nous créé FYDO ?</h3>
          <p className="text-green-700 mb-4">
            Nous avons constaté que les consommateurs manquaient d'un outil fiable pour partager et consulter des avis authentiques sur les produits qu'ils achètent quotidiennement.
          </p>
          <p className="text-green-700 mb-4">
            Avec FYDO, chaque avis est vérifié par un ticket de caisse, garantissant que les retours d'expérience proviennent de personnes ayant réellement acheté et utilisé le produit.
          </p>
          <p className="text-green-700">
            Notre communauté grandit chaque jour, permettant à chacun de faire des choix plus éclairés pour sa santé et son bien-être.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;