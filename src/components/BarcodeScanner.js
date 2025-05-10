// src/components/BarcodeScanner.js - version améliorée avec meilleure gestion des permissions
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onScanComplete, autoStart = false }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const scannerRef = useRef(null);
  const initialized = useRef(false);
  
  // Fonction pour vérifier et demander les permissions de la caméra
  const checkCameraPermission = async () => {
    try {
      // Demander explicitement l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Si on arrive ici, la permission a été accordée
      setHasPermission(true);
      
      // Arrêter le flux vidéo puisque Quagga en créera un nouveau
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      setHasPermission(false);
      return false;
    } finally {
      setPermissionRequested(true);
    }
  };
  
  // Activation du scanner avec Quagga
  const startScanner = async () => {
    if (!scannerRef.current) {
      console.error("Élément DOM manquant pour le scanner");
      return;
    }
    
    // Vérifier les permissions avant de démarrer
    if (hasPermission === null && !permissionRequested) {
      const hasAccess = await checkCameraPermission();
      if (!hasAccess) return;
    }
    
    console.log("Tentative d'initialisation de Quagga...");
    
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
      },
      numOfWorkers: navigator.hardwareConcurrency || 4,
      frequency: 10,
      decoder: {
        readers: ["ean_reader"]
      },
      locate: true
    }, function(err) {
      if (err) {
        console.error("Erreur d'initialisation de Quagga:", err);
        setHasPermission(false);
        setIsScanning(false);
        return;
      }
      
      console.log("Quagga initialisé avec succès");
      initialized.current = true;
      setHasPermission(true);
      
      // Démarrer Quagga
      Quagga.start();
      setIsScanning(true);
      
      // Configuration de l'événement de détection
      Quagga.onDetected((result) => {
        if (result && result.codeResult) {
          const code = result.codeResult.code;
          console.log("Code-barres détecté:", code);
          
          // Arrêter le scan
          stopScanner();
          
          // Appeler le callback avec le code détecté
          if (onScanComplete) {
            onScanComplete(code);
          }
        }
      });
    });
  };
  
  // Arrêt du scanner
  const stopScanner = () => {
    if (initialized.current) {
      Quagga.stop();
      initialized.current = false;
      setIsScanning(false);
    }
  };
  
  // Gestionnaire pour démarrer le scan après une interaction utilisateur
  const handleStartScan = async () => {
    if (hasPermission === false) {
      // Si la permission a déjà été refusée, tenter de la redemander
      const hasAccess = await checkCameraPermission();
      if (!hasAccess) return;
    }
    
    setIsScanning(true);
  };
  
  // Effet pour démarrer le scanner automatiquement si autoStart est true
  // Mais uniquement après une vérification de permission
  useEffect(() => {
    if (autoStart && !initialized.current && !permissionRequested) {
      checkCameraPermission().then(hasAccess => {
        if (hasAccess) {
          // Petit délai pour s'assurer que le DOM est prêt
          setTimeout(() => {
            setIsScanning(true);
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);
  
  // Effet pour démarrer/arrêter le scanner quand isScanning change
  useEffect(() => {
    if (isScanning && !initialized.current) {
      const timeout = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);
  
  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      console.log("Démontage du composant BarcodeScanner");
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={handleStartScan}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
          >
            <Camera className="mr-2" size={20} />
            Scanner un produit
          </button>
          <p className="mt-2 text-green-700 text-sm">
            Scannez le code-barre d'un produit alimentaire ou cosmétique
          </p>
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scannerRef}
            className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] max-w-md mx-auto"
          >
            {/* Cadre de scan - positionné par-dessus le flux vidéo géré par Quagga */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="border-2 border-green-500 w-64 h-40 opacity-70">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {hasPermission === false && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p>L'accès à la caméra a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.</p>
          <button 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
            onClick={checkCameraPermission}
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;