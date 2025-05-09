// src/utils/formatters.js

/**
 * Formate une date en format lisible pour l'affichage
 * @param {string|Date} dateString - La date à formater (ISO string ou objet Date)
 * @param {boolean} includeTime - Inclure ou non l'heure dans le format
 * @returns {string} La date formatée
 */
export const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };
  
  /**
   * Formate un prix en format monétaire
   * @param {number} price - Le prix à formater
   * @param {string} currency - La devise (défaut: EUR)
   * @returns {string} Le prix formaté
   */
  export const formatPrice = (price, currency = 'EUR') => {
    if (price === undefined || price === null) return 'N/A';
    
    try {
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency 
      }).format(price);
    } catch (error) {
      console.error('Erreur lors du formatage du prix:', error);
      return `${price} €`;
    }
  };
  
  /**
   * Calcule la date de fin d'un abonnement
   * @param {number} durationDays - Durée de l'abonnement en jours
   * @param {string|Date} startDate - Date de début (défaut: aujourd'hui)
   * @returns {Date} Date de fin calculée
   */
  export const calculateEndDate = (durationDays, startDate = new Date()) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationDays);
    return end;
  };
  
  /**
   * Calcule l'économie réalisée avec un abonnement annuel par rapport à mensuel
   * @param {number} monthlyPrice - Prix mensuel
   * @param {number} yearlyPrice - Prix annuel
   * @returns {number} Pourcentage d'économie
   */
  export const calculateYearlySavings = (monthlyPrice, yearlyPrice) => {
    if (!monthlyPrice || !yearlyPrice) return 0;
    
    const annualCostMonthly = monthlyPrice * 12;
    const savings = annualCostMonthly - yearlyPrice;
    return Math.round((savings / annualCostMonthly) * 100);
  };
  
  /**
   * Vérifie si un abonnement est actif
   * @param {Object} subscription - L'objet abonnement
   * @returns {boolean} True si l'abonnement est actif
   */
  export const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;
    
    // Vérifier si l'abonnement est marqué comme actif
    if (!subscription.is_active) return false;
    
    // Vérifier si la date de fin n'est pas dépassée
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    return endDate > now;
  };
  
  /**
   * Vérifie si un abonnement va bientôt expirer (dans les 7 jours)
   * @param {Object} subscription - L'objet abonnement
   * @returns {boolean} True si l'abonnement expire bientôt
   */
  export const isSubscriptionExpiringSoon = (subscription) => {
    if (!isSubscriptionActive(subscription)) return false;
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    // Calculer la différence en jours
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays <= 7;
  };
  
  /**
   * Retourne un message d'expiration d'abonnement formaté
   * @param {Object} subscription - L'objet abonnement
   * @returns {string} Message d'expiration
   */
  export const getExpirationMessage = (subscription) => {
    if (!subscription) return '';
    
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    
    if (endDate < now) {
      return `Expiré le ${formatDate(subscription.end_date)}`;
    }
    
    // Calculer la différence en jours
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Expire aujourd'hui";
    } else if (diffDays === 1) {
      return "Expire demain";
    } else if (diffDays < 7) {
      return `Expire dans ${diffDays} jours`;
    } else {
      return `Expire le ${formatDate(subscription.end_date)}`;
    }
  };