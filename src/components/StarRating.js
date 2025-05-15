// src/components/StarRating.js
import React from 'react';
import { Star } from 'lucide-react';

/**
 * Composant d'évaluation par étoiles
 * @param {number} value - Valeur actuelle de l'évaluation (0-5)
 * @param {Function} onChange - Fonction appelée lorsque l'évaluation change
 * @param {number} max - Nombre maximum d'étoiles (défaut: 5)
 * @param {string} size - Taille des étoiles ('sm', 'md', 'lg')
 * @param {boolean} readonly - Si true, l'évaluation ne peut pas être modifiée
 * @returns {JSX.Element}
 */
const StarRating = ({ 
  value = 0, 
  onChange, 
  max = 5, 
  size = 'md', 
  readonly = false 
}) => {
  // Déterminer la taille des étoiles
  const starSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size] || 20;
  
  // Classes pour les différents états des étoiles
  const starClasses = {
    base: "transition-colors",
    filled: "text-yellow-400 fill-yellow-400",
    empty: "text-gray-300",
    hover: "text-yellow-300 fill-yellow-300"
  };
  
  // Gérer le clic sur une étoile
  const handleClick = (rating) => {
    if (readonly) return;
    
    // Si on clique sur la valeur actuelle, réinitialiser à 0
    if (rating === value && rating > 0) {
      onChange(0);
    } else {
      onChange(rating);
    }
  };
  
  // Créer un tableau d'étoiles
  const stars = Array.from({ length: max }, (_, index) => {
    const rating = index + 1;
    const isFilled = rating <= value;
    
    return (
      <button
        key={rating}
        type="button"
        onClick={() => handleClick(rating)}
        onKeyDown={(e) => {
          // Permettre la navigation au clavier
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(rating);
          }
        }}
        className={`p-0.5 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        disabled={readonly}
        aria-label={`${rating} ${rating === 1 ? 'étoile' : 'étoiles'}`}
        aria-checked={isFilled}
        tabIndex={readonly ? -1 : 0}
      >
        <Star 
          size={starSize} 
          className={`${starClasses.base} ${isFilled ? starClasses.filled : starClasses.empty}`}
        />
      </button>
    );
  });

  return (
    <div className="flex items-center">
      {stars}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-500">
          {value > 0 ? `${value}/${max}` : ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;