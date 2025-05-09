// src/components/BarcodeScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

// Ce composant sera utilisé plus tard lorsque vous intégrerez la fonctionnalité de scan
// Vous aurez besoin d'installer une bibliothèque comme 'quagga' ou 'zxing'
// npm install quagga

const BarcodeScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Activation de la caméra
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setHasPermission(true);
        
        // Dans une application réelle, vous intégreriez ici la bibliothèque 
        // de reconnaissance de code-barre (Quagga, ZXing, etc.)
      }
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      setHasPermission(false);
    }
  };
  
  // Arrêt de la caméra
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsScanning(false);
    }
  };
  
  // Simulation d'un scan réussi (pour démonstration)
  const simulateScan = () => {
    // Dans l'application réelle, cette fonction serait remplacée par
    // l'événement de détection de code-barre par Quagga ou ZXing
    const mockBarcode = "3017620422003"; // Code EAN-13 d'exemple
    
    stopScanner();
    if (onScanComplete) {
      onScanComplete(mockBarcode);
    }
  };
  
  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanner();
      }
    };
  }, [isScanning]);
  
  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="text-center">
          <button
            onClick={startScanner}
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
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] max-w-md mx-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Cadre de scan */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-green-500 w-64 h-40 opacity-70">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Boutons de contrôle */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={stopScanner}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <X size={20} />
            </button>
            
            {/* Bouton de simulation pour démonstration */}
            <button
              onClick={simulateScan}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Simuler un scan
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