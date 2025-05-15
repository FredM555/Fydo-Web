// src/components/DownloadEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import { Apple, Smartphone, QrCode } from 'lucide-react';

const Download = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showQrAnimation, setShowQrAnimation] = useState(false);
  const sectionRef = useRef(null);

  // Observer pour déclencher l'animation lorsque la section est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animation du QR code après l'apparition de la section
          setTimeout(() => {
            setShowQrAnimation(true);
          }, 1000);
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

  return (
    <section ref={sectionRef} id="telecharger" className="py-20 bg-white relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-50 rounded-full opacity-50"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-50 rounded-full opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-10 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Téléchargez FYDO dès maintenant</h2>
          <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté d'utilisateurs et commencez à faire des choix éclairés pour vos produits du quotidien.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto">
          {/* Téléphone avec app */}
          <div className={`md:w-1/2 mb-10 md:mb-0 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
            <div className="relative max-w-xs mx-auto">
              {/* Fond du téléphone avec effet de profondeur */}
              <div className="absolute inset-2 bg-gradient-to-tr from-green-200 to-green-100 rounded-[36px] transform rotate-3 scale-105 z-0"></div>
              
              {/* Téléphone */}
              <div className="relative w-full aspect-[9/19] border-[12px] border-gray-800 rounded-[36px] overflow-hidden shadow-xl bg-green-600 z-10">
                {/* Encoche du téléphone */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 z-20 flex justify-center items-end">
                  <div className="w-24 h-4 bg-gray-900 rounded-b-xl"></div>
                </div>
                
                {/* Contenu de l'écran */}
                <div className="w-full h-full bg-gradient-to-b from-green-600 to-green-700 p-4 pt-8 flex flex-col">
                  {/* Logo */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white font-bold text-xl">Fydo</div>
                    <div className="text-yellow-300 text-2xl">★</div>
                  </div>
                  
                  {/* Scan Module */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <h3 className="text-white font-bold mb-2">Scanner</h3>
                    <div className="w-full h-32 border-2 border-dashed border-white border-opacity-50 rounded-lg flex items-center justify-center">
                      <Smartphone size={32} className="text-white opacity-70" />
                    </div>
                  </div>
                  
                  {/* Reviews */}
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">Avis vérifiés</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="text-amber-500 text-sm">★</div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Incroyable application qui m'aide à faire de meilleurs choix chaque jour !</p>
                  </div>
                  
                  {/* Fonctionnalités */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="flex justify-around">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center mb-1">
                          <div className="w-5 h-5 text-white">📊</div>
                        </div>
                        <span className="text-xs text-white">Stats</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center mb-1">
                          <div className="w-5 h-5 text-white">👥</div>
                        </div>
                        <span className="text-xs text-white">Profil</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center mb-1">
                          <div className="w-5 h-5 text-white">❤️</div>
                        </div>
                        <span className="text-xs text-white">Favoris</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="w-24 h-1 bg-white opacity-30 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
              
              {/* Badge flottant */}
              <div className="absolute top-14 -right-4 bg-white text-green-800 px-3 py-1 rounded-full shadow-lg text-sm font-bold transform rotate-6 z-20">
                Gratuit !
              </div>
            </div>
          </div>
          
          {/* Boutons de téléchargement et QR code */}
          <div className={`md:w-1/2 md:pl-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
            <h3 className="text-xl font-bold text-green-800 mb-6 text-center md:text-left">Disponible sur iOS et Android</h3>
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
              <a href="/#" className="bg-black text-white rounded-xl px-6 py-3 flex items-center justify-center max-w-xs w-full hover:bg-gray-900 transition-colors shadow-md">
                <Apple size={24} className="mr-3" />
                <div className="text-left">
                  <div className="text-xs">Télécharger sur</div>
                  <div className="text-xl font-semibold">App Store</div>
                </div>
              </a>
              
              <a href="/#" className="bg-black text-white rounded-xl px-6 py-3 flex items-center justify-center max-w-xs w-full hover:bg-gray-900 transition-colors shadow-md">
                <div className="mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20.69V3.31c0-.42.51-.63.81-.33l11.43 8.69c.25.19.25.57 0 .76L3.81 21.02c-.3.23-.81.02-.81-.33z" fill="currentColor"/>
                    <path d="M14 12l2.44 1.862 3.97-3.982c.29-.28.75-.1.75.45v15.34c0 .55-.46.83-.75.55l-3.97-3.98L14 24.001H21c1.66 0 3-1.34 3-3V3.001c0-1.66-1.34-3-3-3h-7L14 12z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs">Télécharger sur</div>
                  <div className="text-xl font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            
            {/* QR Code avec animation */}
            <div className="flex justify-center md:justify-start">
              <div className={`bg-green-50 p-5 rounded-xl max-w-xs w-full transition-all duration-700 transform ${showQrAnimation ? 'shadow-lg scale-100 opacity-100' : 'opacity-70 scale-95'}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <QrCode size={20} className="text-green-700 mr-2" />
                    <p className="text-green-800 font-bold">Scanner le QR Code</p>
                  </div>
                  
                  <div className="w-48 h-48 bg-white p-3 mx-auto mb-3 shadow-sm">
                    <div className={`w-full h-full border border-green-800 flex items-center justify-center ${showQrAnimation ? 'qr-animation' : ''}`}>
                      {/* QR code mockup avec squares animés */}
                      <div className="relative w-full h-full">
                        {/* Coins du QR code */}
                        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-green-800"></div>
                        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-green-800"></div>
                        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-green-800"></div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-green-800"></div>
                        
                        {/* Centre du QR code */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-green-800"></div>
                        
                        {/* Petits carrés */}
                        {showQrAnimation && Array.from({ length: 20 }).map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-3 h-3 bg-green-800"
                            style={{
                              top: `${Math.floor(Math.random() * 85) + 5}%`,
                              left: `${Math.floor(Math.random() * 85) + 5}%`,
                              opacity: 0,
                              animation: `fadeInOut 2s ${i * 0.1}s infinite`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-green-700">pour télécharger l'application</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bannière nombre d'utilisateurs */}
        <div className={`mt-16 bg-gradient-to-r from-green-800 to-green-700 rounded-xl p-6 text-white text-center max-w-3xl mx-auto shadow-md transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <p className="text-lg mb-2">Rejoignez plus de <span className="font-bold text-2xl">10,000+</span> utilisateurs actifs</p>
          <p className="text-sm text-green-100">Une communauté en pleine croissance qui partage des avis authentiques chaque jour</p>
        </div>
      </div>
      
      {/* Styles pour l'animation du QR code */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .qr-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default Download;