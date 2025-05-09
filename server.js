// server.js - Serveur Express pour servir de proxy à l'API OpenFoodFacts
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

// Activer CORS pour toutes les requêtes
app.use(cors());

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

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});