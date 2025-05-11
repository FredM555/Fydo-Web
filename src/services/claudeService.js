// src/services/claudeService.js
import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Service pour l'analyse des tickets de caisse avec Claude AI
 * Version de debug
 */

// Récupération explicite de la clé API et déboggage des variables d'environnement
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Analyse un ticket de caisse avec Claude AI pour en extraire les informations
 * @param {string} receiptUrl - URL de l'image du ticket de caisse
 * @param {string} productCode - Code-barres du produit recherché
 * @returns {Promise<object>} - Informations extraites du ticket (date, store, price)
 */
export const analyzeReceipt = async (receiptUrl, productCode) => {
  try {
    // DEBUG: Afficher toutes les variables d'environnement commençant par REACT_APP
    console.log("Variables d'environnement disponibles:");
    Object.keys(process.env).filter(key => key.startsWith('REACT_APP')).forEach(key => {
      console.log(`${key}: ${key === 'REACT_APP_CLAUDE_API_KEY' ? '***' + process.env[key].substring(process.env[key].length - 5) : process.env[key]}`);
    });
    
    console.log("Clé Claude API:", CLAUDE_API_KEY ? `Présente (longueur: ${CLAUDE_API_KEY.length}, commence par: ${CLAUDE_API_KEY.substring(0, 4)}...)` : "MANQUANTE");
    
    // Vérifier si l'API key est présente et valide
    if (!CLAUDE_API_KEY) {
      console.error('Erreur critique: Clé API Claude non détectée dans les variables d\'environnement');
      return {
        success: false,
        error: "L'analyse d'image n'est pas disponible actuellement. Veuillez vérifier la configuration."
      };
    }
    
    // Vérifier le format de la clé API (doit commencer par "sk-ant")
    if (!CLAUDE_API_KEY.startsWith('sk-ant')) {
      console.error('Erreur critique: Format de clé API Claude invalide, doit commencer par "sk-ant"');
      return {
        success: false,
        error: "Le format de la clé API est invalide. Veuillez vérifier la configuration."
      };
    }
    
    // Conversion de l'image en base64 pour envoi à Claude
    console.log('Préparation de l\'image pour analyse...');
    const imageBase64 = await fetchAndConvertToBase64(receiptUrl);
    
    // Préparation de la requête à Claude
    console.log('Analyse du ticket en cours...');
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyse ce ticket de caisse et extrait exactement ces informations:

                1. Date d'achat au format YYYY-MM-DD (attention au format européen DD/MM/YYYY)
                2. Nom du magasin/enseigne exactement comme écrit sur le ticket
                3. Prix d'un seul produit (pas le total de la facture)

                Si plusieurs produits sont présents, trouve celui qui correspond au code ${productCode}.
                
                Réponds UNIQUEMENT avec un objet JSON contenant les clés "date", "store" et "price".
                Exemple: {"date": "2023-05-12", "store": "Carrefour", "price": 4.99}
                
                Si tu ne peux pas déterminer une valeur avec certitude, utilise null.`
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ]
      })
    });
    
    // Afficher les détails de la réponse
    console.log(`Réponse API: Status ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Impossible de lire l'erreur");
      console.error("Erreur API Claude complète:", errorText);
      throw new Error(`Erreur lors de l'analyse (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.content || !data.content[0] || !data.content[0].text) {
      console.error("Structure de réponse invalide:", JSON.stringify(data));
      throw new Error("Réponse API invalide");
    }
    
    // Extraction de la réponse JSON de Claude
    const content = data.content[0].text;
    console.log("Réponse brute de Claude:", content);
    
    // Analyse de la réponse JSON
    try {
      // Extraction du JSON même s'il est entouré de texte
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        console.error("Réponse ne contient pas de JSON:", content);
        throw new Error("Format de réponse JSON introuvable");
      }
      
      const jsonStr = jsonMatch[0];
      const extractedData = JSON.parse(jsonStr);
      
      // Validation des données extraites
      if (!extractedData) {
        throw new Error("Données extraites invalides");
      }
      
      console.log("Données extraites du ticket:", extractedData);
      
      return {
        success: true,
        data: {
          date: extractedData.date || null,
          store: extractedData.store || null,
          price: extractedData.price ? parseFloat(extractedData.price) : null
        }
      };
    } catch (jsonError) {
      console.error("Erreur d'analyse JSON:", jsonError, "Contenu:", content);
      return {
        success: false,
        error: "Impossible d'extraire les informations du ticket. Format non reconnu."
      };
    }
  } catch (error) {
    console.error("Erreur critique lors de l'analyse du ticket:", error);
    return {
      success: false,
      error: `L'analyse du ticket a échoué: ${error.message}`
    };
  }
};

/**
 * Récupère une image depuis une URL et la convertit en base64
 * @param {string} url - URL de l'image
 * @returns {Promise<string>} - Représentation base64 de l'image
 */
const fetchAndConvertToBase64 = async (url) => {
  try {
    // Si l'URL est une référence Firebase Storage, obtenir l'URL de téléchargement
    if (url && url.startsWith('gs://')) {
      const storageRef = ref(storage, url);
      url = await getDownloadURL(storageRef);
    }
    
    // Télécharger l'image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement de l'image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Convertir en base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extraire uniquement la partie base64 (après "base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(new Error(`Erreur de lecture du fichier: ${error}`));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erreur lors de la conversion de l'image:", error);
    throw new Error(`Préparation de l'image impossible: ${error.message}`);
  }
};