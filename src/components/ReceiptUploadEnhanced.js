// src/components/ReceiptUploadEnhanced.js
import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, FileText, Camera, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadReceipt } from '../services/storageService';
import { formatDate, formatPrice } from '../utils/formatters';

const ReceiptUploadEnhanced = ({ onUploadComplete, productCode = null }) => {
  const { currentUser, userDetails } = useAuth();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const fileInputRef = useRef(null);
  
  // Gestion de la sélection du fichier
  const handleFileChange = async (e) => {
    setError(null);
    
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
      setError("Vous devez être connecté pour télécharger des tickets de caisse.");
      return;
    }
    
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Vérification du type de fichier
    if (!selectedFile.type.includes('image/')) {
      setError("Veuillez sélectionner une image (JPG, PNG)");
      return;
    }
    
    // Vérification de la taille du fichier (max 5 MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("La taille de l'image ne doit pas dépasser 5 MB");
      return;
    }
    
    setFile(selectedFile);
    
    // Création d'un aperçu
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Gestion de l'envoi du fichier vers Firebase et Supabase
  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un ticket de caisse");
      return;
    }
    
    if (!currentUser || !userDetails) {
      setError("Vous devez être connecté pour télécharger des tickets de caisse.");
      return;
    }
    
    setUploading(true);
    setError(null);
    setProgress(0);
    setAiProcessing(true);
    
    // Simulation de progression pendant l'upload
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 80));
    }, 200);
    
    try {
      // Télécharger vers Firebase Storage et enregistrer dans Supabase
      const result = await uploadReceipt(
        file, 
        userDetails.id, 
        currentUser.uid, 
        productCode
      );
      
      clearInterval(progressInterval);
      
      if (!result.success) {
        throw new Error(result.error || "Le téléchargement a échoué. Veuillez réessayer.");
      }
      
      setProgress(90);
      
      // Si Claude a extrait des données, les stocker et les afficher
      if (result.aiData) {
        console.log("Données extraites par Claude:", result.aiData);
        setAiData(result.aiData);
      }
      
      // Terminer le processus avec succès
      setTimeout(() => {
        setProgress(100);
        setAiProcessing(false);
        setUploadSuccess(true);
        
        // Appeler le callback si fourni, en transmettant les données extraites
        if (onUploadComplete) {
          onUploadComplete(result.receipt, result.url, result.aiData);
        }
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Erreur lors du téléchargement:", err);
      setError(err.message || "Le téléchargement a échoué. Veuillez réessayer.");
      setProgress(0);
      setAiProcessing(false);
    } finally {
      setUploading(false);
    }
  };
  
  // Réinitialisation du formulaire
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setUploadSuccess(false);
    setError(null);
    setProgress(0);
    setAiData(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Ouverture de la caméra/galerie
  const handleOpenFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Ouverture directe de la caméra sur mobile
  const handleOpenCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ajouter un ticket de caisse</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Pour valider votre avis, veuillez télécharger une photo de votre ticket de caisse montrant l'achat du produit.
          </p>
          
          <div className="text-xs text-gray-500 flex items-start mb-4">
            <AlertCircle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
            <span>Assurez-vous que le nom du produit et la date d'achat sont clairement visibles</span>
          </div>
        </div>
        
        {!file ? (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              onClick={handleOpenFileSelector}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Cliquez pour sélectionner un fichier ou glissez-déposez une image ici
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG (max. 5 MB)
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleOpenFileSelector}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FileText size={18} className="mr-2" />
                Galerie
              </button>
              
              <button
                type="button"
                onClick={handleOpenCamera}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Camera size={18} className="mr-2" />
                Appareil photo
              </button>
            </div>
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={preview} 
                alt="Aperçu du ticket de caisse" 
                className="w-full h-auto rounded-lg max-h-64 object-contain bg-gray-100"
              />
              
              {!uploadSuccess && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-700 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
              
              {uploadSuccess && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                  <div className="bg-white rounded-full p-2">
                    <Check size={24} className="text-green-600" />
                  </div>
                </div>
              )}
            </div>
            
            {(uploading || aiProcessing) && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {progress < 85 
                    ? "Téléchargement en cours..." 
                    : "Analyse du ticket avec IA..."}
                </p>
              </div>
            )}
            
            {/* Affichage des données extraites par l'IA */}
            {uploadSuccess && aiData && (
              <div className="mt-4 bg-green-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Informations extraites du ticket :
                </h3>
                <div className="space-y-2">
                  {aiData.date && (
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="mr-2 text-green-600" />
                      <span>Date d'achat : <strong>{formatDate(aiData.date)}</strong></span>
                    </div>
                  )}
                  
                  {aiData.store && (
                    <div className="flex items-center text-sm">
                      <ShoppingBag size={16} className="mr-2 text-green-600" />
                      <span>Magasin : <strong>{aiData.store}</strong></span>
                    </div>
                  )}
                  
                  {aiData.price && (
                    <div className="flex items-center text-sm">
                      <DollarSign size={16} className="mr-2 text-green-600" />
                      <span>Prix : <strong>{formatPrice(aiData.price)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!uploadSuccess ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={uploading || aiProcessing}
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleUpload}
                  className={`flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    (uploading || aiProcessing) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={uploading || aiProcessing}
                >
                  {(uploading || aiProcessing) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {progress < 85 ? "Envoi en cours..." : "Analyse en cours..."}
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Valider
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <Check size={18} className="mr-1" />
                  <span className="font-medium">Ticket de caisse validé !</span>
                </div>
                <p className="text-sm text-gray-600">
                  Votre ticket de caisse a bien été enregistré et analysé. Vous pouvez maintenant donner votre avis sur le produit.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 py-2 px-4 text-sm font-medium text-green-700 hover:text-green-800 focus:outline-none"
                >
                  Ajouter un autre ticket
                </button>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptUploadEnhanced;