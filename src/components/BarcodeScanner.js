// src/components/BarcodeScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import Quagga from 'quagga'; // Assurez-vous d'installer cette dépendance

const BarcodeScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const scannerRef = useRef(null);
  
  // Activation du scanner avec Quagga
const startScanner = () => {
  if (!scannerRef.current) {
    console.error("Élément DOM manquant pour le scanner");
    return;
  }
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment", // Caméra arrière
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
      },
      numOfWorkers: navigator.hardwareConcurrency || 4,
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_128_reader"
        ],
      },
      locate: true,
    }, function(err) {
      if (err) {
        console.error("Erreur d'initialisation de Quagga:", err);
        setHasPermission(false);
        return;
      }
      
      console.log("Quagga initialisé avec succès");
      Quagga.start();
      setIsScanning(true);
      setHasPermission(true);
    });

    // Configuration de l'événement de détection
    Quagga.onDetected((result) => {
      console.log("Résultat brut Quagga :", result);
      if (result.codeResult) {
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
  };
  
  // Arrêt du scanner
  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop();
      setIsScanning(false);
    }
  };
  
  // Nettoyage lors du démontage du composant
useEffect(() => {
  return () => {
    if (isScanning) {
      stopScanner();
    }
  };
}, []);

useEffect(() => {
  if (isScanning) {
    const timeout = setTimeout(() => {
      if (scannerRef.current) {
        startScanner();
      }
    }, 100); // petite attente pour que le DOM soit prêt
    return () => clearTimeout(timeout);
  }
}, [isScanning]);
  
  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={() => setIsScanning(true)}
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
          
          {/* Boutons de contrôle */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={stopScanner}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <X size={20} className="mr-1" /> Annuler
            </button>
          </div>
        </div>
      )}
      
      {hasPermission === false && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          L'accès à la caméra a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;