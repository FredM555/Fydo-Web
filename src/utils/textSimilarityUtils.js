// src/utils/textSimilarityUtils.js

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * (Nombre minimal d'opérations d'édition pour transformer une chaîne en une autre)
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} - Distance de Levenshtein
 */
export const levenshteinDistance = (str1, str2) => {
  // Normalisation des chaînes
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  // Créer une matrice de taille (a.length+1) x (b.length+1)
  const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  
  // Initialiser la première colonne et la première ligne
  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Remplir la matrice
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Suppression
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  // Retourner la distance
  return matrix[a.length][b.length];
};

/**
 * Calcule la similarité de Jaro-Winkler entre deux chaînes
 * (Mieux adaptée pour comparer des noms courts comme des noms de produits)
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} - Score de similarité entre 0 et 1 (1 = identique)
 */
export const jaroWinklerSimilarity = (str1, str2) => {
  // Normalisation des chaînes
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  
  // Distance maximale pour considérer deux caractères comme "correspondants"
  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  
  // Tableau pour suivre les caractères correspondants dans a
  const aMatches = Array(a.length).fill(false);
  // Tableau pour suivre les caractères correspondants dans b
  const bMatches = Array(b.length).fill(false);
  
  // Compter les caractères correspondants
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);
    
    for (let j = start; j < end; j++) {
      if (!bMatches[j] && a[i] === b[j]) {
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Compter les transpositions
  let transpositions = 0;
  let k = 0;
  
  for (let i = 0; i < a.length; i++) {
    if (aMatches[i]) {
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }
  
  // Calculer la distance de Jaro
  const m = matches;
  const t = transpositions / 2;
  const jaroScore = (m / a.length + m / b.length + (m - t) / m) / 3;
  
  // Amélioration de Winkler - bonus pour les préfixes communs (max 4)
  let prefixLength = 0;
  for (let i = 0; i < Math.min(a.length, b.length, 4); i++) {
    if (a[i] === b[i]) prefixLength++;
    else break;
  }
  
  // Score final de Jaro-Winkler (p = 0.1 est le facteur de mise à l'échelle standard)
  return jaroScore + prefixLength * 0.1 * (1 - jaroScore);
};

/**
 * Calcule la similarité en mots entre deux chaînes
 * (Basée sur le nombre de mots en commun)
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} - Score de similarité entre 0 et 1
 */
export const wordSimilarity = (str1, str2) => {
  // Normalisation et séparation en mots
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Compter les mots en commun
  let commonWords = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      // Si le mot est identique ou inclus
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        commonWords++;
        break;
      }
    }
  }
  
  // Calculer score basé sur la proportion de mots en commun
  return commonWords / Math.max(words1.length, words2.length);
};

/**
 * Calcule un score de correspondance combiné entre deux textes
 * @param {string} text1 - Premier texte (ex: désignation du ticket)
 * @param {string} text2 - Deuxième texte (ex: nom du produit)
 * @returns {number} - Score de similarité entre 0 et 1 (1 = forte correspondance)
 */
export const calculateMatchScore = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  
  // Nettoyer et normaliser les textes
  const clean1 = text1.toLowerCase().trim();
  const clean2 = text2.toLowerCase().trim();
  
  // Si l'un des textes contient l'autre, score élevé
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    return 0.9 + (0.1 * Math.min(1, Math.min(clean1.length, clean2.length) / 10));
  }
  
  // Calcul des différents scores
  const jaroScore = jaroWinklerSimilarity(clean1, clean2);
  const wordScore = wordSimilarity(clean1, clean2);
  
  // Distance de Levenshtein normalisée (transformée en similarité)
  const maxLength = Math.max(clean1.length, clean2.length);
  const levenScore = maxLength > 0 
    ? 1 - (levenshteinDistance(clean1, clean2) / maxLength) 
    : 0;
  
  // Combinaison pondérée des scores
  // On donne plus de poids à la similarité par mots et à Jaro-Winkler
  return 0.5 * jaroScore + 0.3 * wordScore + 0.2 * levenScore;
};

/**
 * Trouve l'article du ticket qui correspond le mieux au produit
 * @param {Array} receiptItems - Liste des articles du ticket
 * @param {Object} product - Produit avec son nom et autres informations
 * @param {number} threshold - Seuil minimal pour considérer une correspondance (0-1)
 * @returns {Object} - Meilleur article correspondant avec son score
 */
export const findBestMatchingItem = (receiptItems, product, threshold = 0.4) => {
  if (!receiptItems || !receiptItems.length || !product || !product.product_name) {
    return { item: null, score: 0 };
  }
  
  const productName = product.product_name;
  let bestMatch = null;
  let bestScore = 0;
  
  // Parcourir tous les articles du ticket
  for (const item of receiptItems) {
    // Calculer le score pour cet article
    const score = calculateMatchScore(item.designation, productName);
    
    // Conserver si c'est le meilleur score jusqu'à présent
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }
  
  // Ne retourner une correspondance que si le score dépasse le seuil
  return {
    item: bestScore >= threshold ? bestMatch : null,
    score: bestScore
  };
};

export default {
  calculateMatchScore,
  findBestMatchingItem,
  jaroWinklerSimilarity,
  levenshteinDistance,
  wordSimilarity
};