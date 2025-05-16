// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai";
// Configuration CORS - Ajoutez vos domaines de production ici
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "https://fydo.app",
  "https://www.fydo.fr" // Autre exemple de domaine de production
];
// Fonction pour ajouter les en-têtes CORS à une réponse
const addCorsHeaders = (response, origin)=>{
  const headers = new Headers(response.headers);
  // Si l'origine est autorisée, utiliser cette origine spécifique
  // Sinon, utiliser * (mais attention, cela ne fonctionnera pas avec credentials: true)
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400"); // 24 heures
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
// Fonction principale qui traite les requêtes
Deno.serve(async (req)=>{
  // Récupérer l'origine de la requête
  const origin = req.headers.get("Origin") || "";
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, {
      status: 204
    }), origin);
  }
  try {
    // Vérification de la méthode HTTP
    if (req.method !== "POST") {
      return addCorsHeaders(new Response(JSON.stringify({
        error: "Méthode non autorisée"
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }), origin);
    }
    // Récupération de la clé API OpenAI avec vérification
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return addCorsHeaders(new Response(JSON.stringify({
        error: "Clé API OpenAI non configurée",
        debug: "La variable d'environnement OPENAI_API_KEY n'est pas définie"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }), origin);
    }
    // Log sécurisé pour débogage (ne montre que les premiers caractères)
    console.log("API Key commence par:", apiKey.substring(0, 7) + "...");
    let receiptImage;
    let imageType;
    let base64Image;
    let codeProduit;
    let searchItem;
    // Vérifier le Content-Type pour déterminer comment traiter la requête
    const contentType = req.headers.get("Content-Type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Méthode originale avec formData
      const formData = await req.formData();
      receiptImage = formData.get("receipt");
      // Récupération des nouveaux paramètres
      codeProduit = formData.get("CodeProduit") || "";
      searchItem = formData.get("SearchItem") || "";
      // Vérification que l'image a bien été envoyée
      if (!receiptImage || !(receiptImage instanceof File)) {
        return addCorsHeaders(new Response(JSON.stringify({
          error: "Image de ticket requise"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
      // Préparation de l'image pour l'API d'OpenAI
      const imageData = await receiptImage.arrayBuffer();
      base64Image = btoa(new Uint8Array(imageData).reduce((data, byte)=>data + String.fromCharCode(byte), ""));
      imageType = receiptImage.type;
    } else if (contentType.includes("application/json")) {
      // Nouvelle méthode avec JSON contenant une URL
      const data = await req.json();
      if (!data.imageUrl) {
        return addCorsHeaders(new Response(JSON.stringify({
          error: "URL d'image requise dans le champ 'imageUrl'"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
      // Récupération des nouveaux paramètres
      codeProduit = data.CodeProduit || "";
      searchItem = data.SearchItem || "";
      // Télécharger l'image depuis l'URL
      try {
        console.log("Téléchargement de l'image depuis:", data.imageUrl);
        const imageResponse = await fetch(data.imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Impossible de télécharger l'image: ${imageResponse.status}`);
        }
        // Récupérer le type MIME et les données de l'image
        imageType = imageResponse.headers.get("Content-Type") || "image/jpeg";
        const imageData = await imageResponse.arrayBuffer();
        base64Image = btoa(new Uint8Array(imageData).reduce((data, byte)=>data + String.fromCharCode(byte), ""));
        console.log("Image téléchargée avec succès, type:", imageType);
      } catch (error) {
        console.error("Erreur de téléchargement:", error);
        return addCorsHeaders(new Response(JSON.stringify({
          error: `Erreur lors du téléchargement de l'image: ${error.message}`
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
    } else {
      return addCorsHeaders(new Response(JSON.stringify({
        error: "Content-Type non supporté. Utilisez multipart/form-data ou application/json"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }), origin);
    }
    // Configuration du client OpenAI avec gestion d'erreur améliorée
    try {
      const openai = new OpenAI({
        apiKey: apiKey
      });
      // Création du prompt optimisé avec les nouveaux paramètres
      const promptText = `
      Analyser ce ticket de caisse et en extraire les informations suivantes au format JSON:
      {
        "receipt": {
          "enseigne": {
            "nom": "Nom du commerce ou de l'entreprise qui a émis le document",
            "adresse1": "Première ligne de l'adresse (rue, numéro)",
            "adresse2": "Seconde ligne de l'adresse (complément si présent, sinon laisser vide)",
            "code_postal": "Code postal au format numérique",
            "ville": "Nom de la ville en majuscules",
            "siret": "Numéro SIRET à 14 chiffres sans espaces"
          },
          "date": "Date du document au format YYYY-MM-DD",
          "totalHt": "total hors taxe",
          "total": "total"
        },
        "articles": [
          {
            "designation": "Nom de l'article",
            "quantite": "mettre toujours 1",
            "prix_unitaire": "Prix unitaire en format numérique",
            "prix_total": "Prix total en format numérique"
          }
        ]
      }
      
      Consignes d'extraction:
      - "article" = toutes les lignes du ticket de caisse
      - Ignorer les accents lors de la recherche de l'article spécifié
      - Si certaines informations sont absentes, retourner null pour ces champs
      - Pour l'adresse, séparer précisément les deux lignes si elles existent
      - Vérifier que le SIRET est au format valide (14 chiffres)
      - Pour la date, convertir tous les formats au format standardisé YYYY-MM-DD
      - Retourne uniquement un JSON valide sans explications supplémentaires
      - la quantite est souvent absente dans ce cas mettre 1`;
      // Préparation de l'image en base64 pour OpenAI
      const base64ImageWithPrefix = `data:${imageType};base64,${base64Image}`;
      // Envoi de l'image à OpenAI pour analyse
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText
              },
              {
                type: "image_url",
                image_url: {
                  url: base64ImageWithPrefix
                }
              }
            ]
          }
        ],
        max_tokens: 10000
      });
      // Extraction du JSON de la réponse
      let jsonResponse;
      try {
        // Obtenir la réponse texte
        const textContent = response.choices[0].message.content;
        // Extraction du JSON si GPT a ajouté des Markdown ou autres textes
        const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || textContent.match(/```\n([\s\S]*?)\n```/) || [
          null,
          textContent
        ];
        jsonResponse = JSON.parse(jsonMatch[1] || textContent);
      } catch (e) {
        // Si la réponse ne peut pas être parsée comme JSON, on renvoie la réponse brute
        return addCorsHeaders(new Response(JSON.stringify({
          error: "Impossible de parser la réponse comme JSON",
          raw_response: response.choices[0].message.content
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
      // Retourner le résultat au format JSON avec les en-têtes CORS
      return addCorsHeaders(new Response(JSON.stringify(jsonResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive"
        }
      }), origin);
    } catch (error) {
      // Gestion spécifique des erreurs d'authentification OpenAI
      if (error.status === 401 || error.error && error.error.type === "authentication_error") {
        return addCorsHeaders(new Response(JSON.stringify({
          error: "Erreur d'authentification OpenAI",
          details: error.message,
          suggestion: "Vérifiez que votre clé API OpenAI est correcte et active"
        }), {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
      // Autres erreurs OpenAI API
      if (error.status || error.error) {
        return addCorsHeaders(new Response(JSON.stringify({
          error: "Erreur API OpenAI",
          status: error.status,
          details: error.message,
          error_type: error.error ? error.error.type : "unknown"
        }), {
          status: error.status || 500,
          headers: {
            "Content-Type": "application/json"
          }
        }), origin);
      }
      // Erreurs génériques
      return addCorsHeaders(new Response(JSON.stringify({
        error: "Erreur serveur",
        details: error.message || "Une erreur s'est produite"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }), origin);
    }
  } catch (error) {
    // Gestion des erreurs générales
    console.error("Erreur:", error);
    return addCorsHeaders(new Response(JSON.stringify({
      error: error.message || "Une erreur s'est produite"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    }), origin);
  }
});
