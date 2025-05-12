// server.js - Serveur Express pour servir de proxy aux APIs
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Clé API Claude - utiliser une variable d'environnement
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Configuration du stockage temporaire des fichiers pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration CORS adaptée pour la production
app.use(cors({
  origin: ['https://www.fydo.fr', 'https://fydo.fr', 'http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pour le preflight CORS
app.options('*', cors());

app.use(express.json());

// Point d'API pour la recherche des produits
app.get('/api/products/search', async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Un terme de recherche est requis' });
    }
    
    // Construire l'URL pour OpenFoodFacts
    const url = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page=${page}&page_size=${pageSize}&fields=product_name,code,brands,ingredients_tags,allergens_tags,allergens_hierarchy,allergens,additives_tags,manufacturing_places,origins,categories,categories_tags,ingredients_text,image_url,nutriscore_grade`;
    
    // Faire la requête à OpenFoodFacts
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ProductInfoApp/1.0'
      },
      timeout: 10000 // 10 secondes de timeout
    });
    
    // Renvoyer la réponse au client
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la recherche de produits:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la recherche de produits',
      details: error.message 
    });
  }
});

// Point d'API pour récupérer un produit par code-barres
app.get('/api/products/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Un code-barres est requis' });
    }
    
    // Faire la requête à OpenFoodFacts
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ProductInfoApp/1.0'
      },
      timeout: 10000 // 10 secondes de timeout
    });
    
    // Renvoyer la réponse au client
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du produit',
      details: error.message 
    });
  }
});

// Nouvel endpoint pour analyser une image de ticket de caisse
app.post('/api/analyze-receipt', upload.single('image'), async (req, res) => {
  try {
    // Vérifier si une image a été uploadée
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'Aucune image fournie' 
      });
    }

    // Récupérer le code produit des paramètres de la requête
    const { productCode } = req.body;

    // Lire le fichier image
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Vérifier si la clé API est présente
    if (!CLAUDE_API_KEY) {
      console.error("Clé API Claude manquante");
      
      // Nettoyer le fichier temporaire en cas d'erreur
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        error: "Configuration serveur incomplète: Clé API Claude manquante"
      });
    }

    try {
      console.log("Appel de l'API Claude pour analyser le ticket...");
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
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

                Si plusieurs produits sont présents, trouve celui qui correspond au code ${productCode || 'inconnu'}.
                
                Réponds UNIQUEMENT avec un objet JSON contenant les clés "date", "store" et "price".
                Exemple: {"date": "2023-05-12", "store": "Carrefour", "price": 4.99}
                
                Si tu ne peux pas déterminer une valeur avec certitude, utilise null.`
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      // Extraire les données JSON
      const content = response.data.content[0].text;
      console.log("Réponse brute de Claude:", content);
      
      // Extraction du JSON même s'il est entouré de texte
      const jsonMatch = content.match(/{[\s\S]*}/);
      
      if (!jsonMatch) {
        console.error("Réponse ne contient pas de JSON:", content);
        
        // Nettoyer le fichier temporaire
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({
          success: false,
          error: "Format de réponse invalide"
        });
      }
      
      const jsonStr = jsonMatch[0];
      const extractedData = JSON.parse(jsonStr);
      console.log("Données extraites:", extractedData);
      
      // Nettoyer le fichier temporaire
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      // Renvoyer les données extraites
      return res.json({
        success: true,
        data: {
          date: extractedData.date || null,
          store: extractedData.store || null,
          price: extractedData.price ? parseFloat(extractedData.price) : null
        }
      });
      
    } catch (claudeError) {
      console.error("Erreur lors de l'appel à l'API Claude:", claudeError.response?.data || claudeError.message);
      
      // Nettoyer le fichier temporaire en cas d'erreur
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'analyse du ticket",
        details: claudeError.response?.data?.error?.message || claudeError.message
      });
    }
    
  } catch (error) {
    console.error("Erreur serveur lors de l'analyse du ticket:", error);
    
    // Nettoyer le fichier temporaire en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'analyse du ticket",
      details: error.message
    });
  }
});

// Route de santé pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Clé API Claude ${CLAUDE_API_KEY ? 'présente' : 'MANQUANTE'}`);
});