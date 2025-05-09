// src/components/ProductReviews.js
import React, { useState } from 'react';
import { Star, ShoppingBag, ThumbsUp, Flag, Camera } from 'lucide-react';

const ProductReviews = ({ product }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  
  // Données factices pour la démo
  const mockProduct = product || {
    id: 'prod123',
    name: 'Crème Hydratante Naturelle',
    brand: 'NatureCos',
    barcode: '3017620422003',
    category: 'Cosmétique',
    image: 'https://via.placeholder.com/150',
    rating: 4.2,
    reviewCount: 47,
    reviews: [
      {
        id: 'rev1',
        user: 'Sophie M.',
        date: '15/04/2025',
        rating: 5,
        comment: 'Excellente crème hydratante, ma peau est beaucoup plus douce et l\'effet est durable toute la journée !',
        verifiedPurchase: true,
        likes: 8
      },
      {
        id: 'rev2',
        user: 'Thomas L.',
        date: '02/04/2025',
        rating: 4,
        comment: 'Très bonne texture, absorption rapide. Je retire une étoile car le parfum est un peu trop présent à mon goût.',
        verifiedPurchase: true,
        likes: 3
      },
      {
        id: 'rev3',
        user: 'Julie D.',
        date: '28/03/2025',
        rating: 3,
        comment: 'Hydratation correcte mais pas exceptionnelle. Le packaging est pratique.',
        verifiedPurchase: true,
        likes: 1
      }
    ]
  };
  
  // Affichage des étoiles
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };
  
  // Fonction pour ajouter un avis (à implémenter avec Firebase plus tard)
  const handleAddReview = () => {
    // Cette fonction sera implémentée plus tard
    alert("Fonctionnalité d'ajout d'avis à venir avec l'intégration Firebase");
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* En-tête du produit */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 mr-4 overflow-hidden">
            <img 
              src={mockProduct.image} 
              alt={mockProduct.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{mockProduct.name}</h2>
            <p className="text-gray-600">{mockProduct.brand}</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500 font-bold mr-1">{mockProduct.rating.toFixed(1)}</span>
                {renderStars(Math.round(mockProduct.rating))}
              </div>
              <span className="ml-2 text-gray-500">({mockProduct.reviewCount} avis)</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <ShoppingBag size={14} className="mr-1" />
                Catégorie: {mockProduct.category}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'reviews' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Avis ({mockProduct.reviewCount})
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'info' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Informations
        </button>
      </div>
      
      {/* Contenu des onglets */}
      <div className="p-4">
        {activeTab === 'reviews' ? (
          <>
            {/* Résumé des avis */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-green-800">{mockProduct.rating.toFixed(1)}</span>
                    <span className="text-sm text-green-700 ml-1">/5</span>
                  </div>
                  <div className="flex mt-1">
                    {renderStars(Math.round(mockProduct.rating))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-green-700 text-sm font-medium">
                    <ShoppingBag size={14} className="mr-1" />
                    <span>{mockProduct.reviewCount} avis vérifiés</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Tous nos avis sont vérifiés par ticket de caisse
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bouton d'ajout d'avis */}
            <div className="mb-6">
              <button
                onClick={handleAddReview}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <Star size={18} className="mr-2" />
                Donner votre avis
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                *Une preuve d'achat (ticket de caisse) sera demandée
              </p>
            </div>
            
            {/* Liste des avis */}
            <div className="space-y-6">
              {mockProduct.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">{review.user}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  {review.verifiedPurchase && (
                    <div className="flex items-center mt-1 text-green-600 text-xs">
                      <ShoppingBag size={12} className="mr-1" />
                      Achat vérifié
                    </div>
                  )}
                  
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                  
                  <div className="flex mt-3 space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-green-600 text-sm">
                      <ThumbsUp size={14} className="mr-1" />
                      Utile ({review.likes})
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-red-600 text-sm">
                      <Flag size={14} className="mr-1" />
                      Signaler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Onglet Informations
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>Code-barre:</strong> {mockProduct.barcode}
            </p>
            <p className="text-gray-700">
              <strong>Marque:</strong> {mockProduct.brand}
            </p>
            <p className="text-gray-700">
              <strong>Catégorie:</strong> {mockProduct.category}
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Camera size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Ajoutez plus d'informations</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Prenez en photo ce produit pour aider les autres utilisateurs à l'identifier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;