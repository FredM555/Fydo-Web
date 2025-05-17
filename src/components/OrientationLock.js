// src/components/OrientationLock.js - Version améliorée
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RotateCcw, Smartphone } from 'lucide-react'; // Importer les icônes

/**
 * Composant amélioré pour forcer l'orientation portrait sur mobile
 * Inclut une notification élégante et une animation
 */
const OrientationLock = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Fonction pour détecter si l'appareil est en mode paysage
  const checkOrientation = () => {
    // Vérifier si window existe (pour éviter les erreurs SSR)
    if (typeof window !== 'undefined') {
      // Détecter le type d'appareil (mobile ou non)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Utiliser matchMedia pour détecter l'orientation
      const isLandscapeMode = window.matchMedia('(orientation: landscape)').matches;
      
      // Appliquer seulement sur mobile
      if (isMobile && isLandscapeMode) {
        setIsLandscape(true);
        // Montrer le message après un court délai
        setTimeout(() => setShowMessage(true), 500);
      } else {
        setIsLandscape(false);
        setShowMessage(false);
      }
    }
  };

  useEffect(() => {
    // Vérifier l'orientation initiale
    checkOrientation();

    // Ajouter un écouteur d'événement pour les changements d'orientation
    const handleOrientationChange = () => {
      checkOrientation();
    };

    // Écouter les événements de changement d'orientation
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Nettoyage
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return (
    <>
      {/* Utiliser Helmet pour ajouter les meta tags */}
      <Helmet>
        {/* Meta tag pour suggérer l'orientation portrait aux navigateurs mobiles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <meta name="screen-orientation" content="portrait" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="orientation" content="portrait" />

        {/* Styles CSS pour forcer l'orientation portrait */}
        <style type="text/css">{`
          @media screen and (max-width: 767px) and (orientation: landscape) {
            html {
              transform: rotate(-90deg);
              transform-origin: left top;
              width: 100vh;
              height: 100vw;
              overflow-x: hidden;
              position: absolute;
              top: 100%;
              left: 0;
            }
            
            body {
              overflow-x: hidden;
              overflow-y: auto;
            }
          }
        `}</style>
      </Helmet>

      {/* Message d'avertissement élégant pour les utilisateurs en mode paysage */}
      {isLandscape && (
        <div 
          className={`orientation-message ${showMessage ? 'visible' : ''} flex items-center justify-center`}
          onClick={() => setShowMessage(false)}
        >
          <Smartphone size={18} className="rotate-device-icon mr-2" />
          <span>Pour une meilleure expérience, veuillez utiliser votre appareil en mode portrait</span>
          <RotateCcw size={16} className="ml-2 cursor-pointer" onClick={() => setShowMessage(false)} />
        </div>
      )}
    </>
  );
};

export default OrientationLock;