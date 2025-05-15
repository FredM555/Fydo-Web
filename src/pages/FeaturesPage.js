// src/pages/FeaturesPage.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Scan, 
  Star, 
  Search, 
  Info, 
  Heart, 
  ShoppingBag, 
  Leaf, 
  Shield, 
  Camera, 
  Smartphone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Users
} from 'lucide-react';

const FeaturesPage = () => {
  const [activeSection, setActiveSection] = useState('scan');
  const [expandedFeatures, setExpandedFeatures] = useState({});

  const toggleSection = (section) => {
    setActiveSection(section === activeSection ? null : section);
  };

  const toggleFeature = (id) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Définition des catégories principales de fonctionnalités
  const featureCategories = [
    {
      id: 'scan',
      title: 'Scan & Recherche',
      icon: <Scan size={24} />,
      description: 'Découvrez les produits instantanément par scan ou recherche',
      phoneImage: '/mockups/scan-screen.png', // Chemin vers l'image du mockup
      color: 'green',
      featureList: [
        {
          id: 'barcode-scan',
          title: 'Scan de code-barres',
          icon: <Camera size={20} />,
          description: 'Utilisez l\'appareil photo de votre smartphone pour scanner n\'importe quel code-barres de produit alimentaire ou cosmétique et accéder instantanément à toutes ses informations et avis.'
        },
        {
          id: 'name-search',
          title: 'Recherche par nom',
          icon: <Search size={20} />,
          description: 'Recherchez des produits par nom, marque ou ingrédients spécifiques. Utilisez nos filtres avancés pour une recherche précise.'
        },
        {
          id: 'advanced-filters',
          title: 'Filtres avancés',
          icon: <BarChart3 size={20} />,
          description: 'Filtrez les résultats par catégorie, présence ou absence d\'ingrédients (SANS gluten, AVEC cacao), valeurs nutritionnelles, ou encore par évaluation moyenne.'
        },
        {
          id: 'offline-history',
          title: 'Historique hors-ligne',
          icon: <Clock size={20} />,
          description: 'Consultez votre historique de recherche même sans connexion internet, avec toutes les informations essentielles des produits précédemment scannés.'
        }
      ]
    },
    {
      id: 'reviews',
      title: 'Avis Vérifiés',
      icon: <Star size={24} />,
      description: 'Consultez et partagez des avis 100% authentiques',
      phoneImage: '/mockups/reviews-screen.png',
      color: 'amber',
      featureList: [
        {
          id: 'verified-reviews',
          title: 'Vérification par ticket',
          icon: <CheckCircle size={20} />,
          description: 'Chaque avis sur Fydo est lié à un achat réel, vérifié par photo de ticket de caisse. Cette méthode garantit l\'authenticité des avis que vous consultez.'
        },
        {
          id: 'multi-criteria',
          title: 'Évaluation multicritères',
          icon: <BarChart3 size={20} />,
          description: 'Évaluez les produits selon plusieurs critères : goût, texture, rapport qualité-prix, packaging... Obtenez une vision complète de chaque produit.'
        },
        {
          id: 'user-photos',
          title: 'Photos des utilisateurs',
          icon: <Camera size={20} />,
          description: 'Partagez des photos de vos produits pour aider d\'autres consommateurs à se faire une idée plus précise de ce qu\'ils achètent.'
        },
        {
          id: 'badges',
          title: 'Badges de confiance',
          icon: <Shield size={20} />,
          description: 'Notre système de badges (Bronze, Argent, Or, Diamant) vous permet d\'identifier facilement les avis des utilisateurs les plus fiables et expérimentés.'
        }
      ]
    },
    {
      id: 'product-info',
      title: 'Informations Détaillées',
      icon: <Info size={24} />,
      description: 'Tout savoir sur les produits que vous consommez',
      phoneImage: '/mockups/product-info-screen.png',
      color: 'blue',
      featureList: [
        {
          id: 'nutritional-info',
          title: 'Nutrition complète',
          icon: <Leaf size={20} />,
          description: 'Accédez aux valeurs nutritionnelles détaillées, à la liste complète des ingrédients, aux allergènes et au Nutri-Score pour chaque produit alimentaire.'
        },
        {
          id: 'eco-impact',
          title: 'Impact environnemental',
          icon: <Leaf size={20} />,
          description: 'Visualisez l\'Éco-Score et l\'empreinte carbone des produits. Identifiez la présence d\'huile de palme et l\'impact du packaging sur l\'environnement.'
        },
        {
          id: 'ingredient-analysis',
          title: 'Analyse des ingrédients',
          icon: <AlertTriangle size={20} />,
          description: 'Identifiez facilement les additifs, conservateurs et ingrédients controversés. Comprenez rapidement ce que vous consommez réellement.'
        },
        {
          id: 'price-comparison',
          title: 'Comparaison de prix',
          icon: <ShoppingBag size={20} />,
          description: 'Comparez les prix moyens d\'un même produit entre différentes enseignes grâce aux données partagées par notre communauté.'
        }
      ]
    },
    {
      id: 'personalization',
      title: 'Personnalisation',
      icon: <Heart size={24} />,
      description: 'Une expérience sur mesure selon vos préférences',
      phoneImage: '/mockups/personalization-screen.png',
      color: 'pink',
      featureList: [
        {
          id: 'favorites',
          title: 'Liste de favoris',
          icon: <Heart size={20} />,
          description: 'Enregistrez vos produits préférés pour les retrouver facilement. Organisez-les en catégories personnalisées pour un accès rapide.'
        },
        {
          id: 'preferences',
          title: 'Préférences alimentaires',
          icon: <Shield size={20} />,
          description: 'Définissez vos allergies, régimes alimentaires (végétarien, sans gluten, etc.) et préférences pour recevoir des alertes personnalisées sur les produits.'
        },
        {
          id: 'activity',
          title: 'Suivi d\'activité',
          icon: <Users size={20} />,
          description: 'Suivez votre activité sur l\'application avec un tableau de bord personnalisé. Avis publiés, produits scannés, interactions... tout est comptabilisé.'
        },
        {
          id: 'recommendations',
          title: 'Recommandations',
          icon: <Star size={20} />,
          description: 'Recevez des suggestions de produits basées sur vos habitudes de consommation et vos avis précédents.'
        }
      ]
    }
  ];

  // Composant pour le mockup de téléphone
  const PhoneMockup = ({ imageUrl, alt, color, category }) => {
    // Contenu spécifique à chaque catégorie
    const getCategoryContent = () => {
      switch(category) {
        case 'scan':
          return (
            <div className="w-full h-full flex flex-col bg-gradient-to-b from-green-500 to-green-600 rounded-[28px] p-4">
              <div className="bg-black bg-opacity-20 h-8 w-full rounded-t-xl mb-6"></div>
              
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <div className="w-12 h-12 text-green-600">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3H5C3.89543 3 3 3.89543 3 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M16 12L12 16L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 17V19C3 20.1046 3.89543 21 5 21H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-white mb-6">
                <h3 className="text-2xl font-bold mb-1">Scan produit</h3>
                <p className="text-sm opacity-90">Pointez la caméra vers le code-barres</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-48 border-2 border-dashed border-white border-opacity-50 rounded-xl flex items-center justify-center">
                  <Camera size={40} className="text-white opacity-60" />
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <div className="w-16 h-1 bg-white bg-opacity-30 rounded-full"></div>
              </div>
            </div>
          );
          
        case 'reviews':
          return (
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-amber-400 to-amber-600 rounded-[28px] p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="text-white font-bold text-lg">Fydo</div>
                <div className="text-amber-300 text-2xl">★</div>
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-4 shadow-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-amber-700 font-bold">A</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">Amaury L.</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={10} className={`${n <= 4 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-700">
                  Ce produit est vraiment excellent ! La qualité est au rendez-vous et le rapport qualité-prix est imbattable.
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Vérifié ✓</span>
                  <span className="text-xs text-gray-500">Il y a 2 jours</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-700 font-bold">S</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">Sophie M.</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={10} className={`${n <= 5 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-700">
                  J'utilise ce produit régulièrement et je suis très satisfaite. Je le recommande vivement !
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Vérifié ✓</span>
                  <span className="text-xs text-gray-500">Il y a 5 jours</span>
                </div>
              </div>
              
              <div className="mt-auto h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-sm">
                Voir plus d'avis
              </div>
            </div>
          );
          
        case 'product-info':
          return (
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-400 to-blue-600 rounded-[28px] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-bold text-lg">Fydo</div>
                <Info size={18} className="text-white" />
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-4 flex items-center">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <ShoppingBag size={24} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Produit</div>
                  <div className="font-bold text-sm">Yaourt nature bio</div>
                  <div className="text-xs text-gray-500">125g</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-4">
                <div className="text-xs font-semibold text-blue-800 mb-2">INFORMATION NUTRITIONNELLE</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs">
                    <div className="font-medium">Calories</div>
                    <div className="text-gray-600">120 kcal</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">Protéines</div>
                    <div className="text-gray-600">4.5g</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">Glucides</div>
                    <div className="text-gray-600">12g</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">Lipides</div>
                    <div className="text-gray-600">3.5g</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <div className="flex-1 bg-white rounded-xl p-2 text-center">
                  <div className="text-3xl font-bold text-green-600">B</div>
                  <div className="text-xs">Nutri-Score</div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-2 text-center">
                  <div className="text-3xl font-bold text-amber-600">C</div>
                  <div className="text-xs">Eco-Score</div>
                </div>
              </div>
              
              <div className="mt-auto h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-sm">
                Voir détails complets
              </div>
            </div>
          );
          
        case 'personalization':
          return (
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-pink-400 to-pink-600 rounded-[28px] p-4">
              <div className="flex items-center justify-between mb-5">
                <div className="text-white font-bold text-lg">Fydo</div>
                <Heart size={18} className="text-white fill-white" />
              </div>
              
              <div className="text-center text-white mb-6">
                <h3 className="font-bold text-xl mb-1">Mes Préférences</h3>
                <p className="text-sm opacity-75">Personnalisez votre expérience Fydo</p>
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield size={16} className="text-pink-500 mr-2" />
                    <span className="text-sm">Allergies</span>
                  </div>
                  <div className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    3 définies
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart size={16} className="text-pink-500 mr-2" />
                    <span className="text-sm">Favoris</span>
                  </div>
                  <div className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    12 produits
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star size={16} className="text-pink-500 mr-2" />
                    <span className="text-sm">Mes Avis</span>
                  </div>
                  <div className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    8 avis
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users size={16} className="text-pink-500 mr-2" />
                    <span className="text-sm">Statut</span>
                  </div>
                  <div className="flex items-center">
                    <Star size={12} className="text-amber-500 fill-amber-500 mr-1" />
                    <span className="text-xs font-medium">Bronze</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-sm">
                Modifier mes préférences
              </div>
            </div>
          );
          
        default:
          // Fallback générique avec le logo Fydo
          return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b ${
              color === 'amber' ? 'from-amber-400 to-amber-600' : 
              color === 'blue' ? 'from-blue-400 to-blue-600' : 
              color === 'pink' ? 'from-pink-400 to-pink-600' : 
              'from-green-400 to-green-600'
            } rounded-[28px] p-6`}>
              <div className="w-24 h-24 mb-6">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M140,60 C160,80 160,120 140,140 L125,140 C145,120 145,80 125,60 L140,60 Z" fill="#ffffff" />
                    <path d="M60,60 C40,80 40,120 60,140 L75,140 C55,120 55,80 75,60 L60,60 Z" fill="#ffffff" />
                    <rect x="70" y="60" width="60" height="80" rx="5" fill="#f0e6d2" />
                    <path d="M75,70 L85,70 M95,70 L125,70 M75,85 L125,85 M75,100 L95,100 M105,100 L125,100 M75,115 L125,115" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                    <path d="M150,40 L130,60 L150,80 L170,60 Z" fill="#ffd700" />
                  </g>
                  <text x="100" y="180" fontSize="32" fontWeight="bold" fill="#ffffff" textAnchor="middle">Fydo</text>
                </svg>
              </div>
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Fydo</h3>
                <p className="text-lg">Découvrez. Partagez. Choisissez.</p>
              </div>
            </div>
          );
      }
    };

    // Si une image est fournie, on l'utilise, sinon on affiche le contenu spécifique à la catégorie
    const mockupContent = imageUrl ? (
      <img 
        src={imageUrl} 
        alt={alt} 
        className="w-full h-full object-cover rounded-[28px]"
        onError={(e) => {
          e.target.onerror = null;
          // Si l'image ne charge pas, on affiche le contenu de la catégorie
          e.target.style.display = 'none';
          e.target.parentNode.appendChild(document.createComment('Fallback to category content'));
        }}
      />
    ) : getCategoryContent();

    return (
      <div className="relative max-w-[240px] mx-auto">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-green-100 rounded-[45px] transform -rotate-6 scale-105 opacity-30"></div>
        <div className="relative w-full aspect-[9/19] border-[12px] border-gray-800 rounded-[36px] overflow-hidden shadow-xl bg-white">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 z-10 flex justify-center items-end">
            <div className="w-24 h-4 bg-gray-900 rounded-b-xl"></div>
          </div>
          {/* Si l'image ne charge pas, le contenu spécifique à la catégorie s'affichera */}
          {imageUrl ? (
            <div className="w-full h-full">
              {mockupContent}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center" id="category-content-container">
                {!imageUrl.startsWith('http') && getCategoryContent()}
              </div>
            </div>
          ) : (
            <div className="w-full h-full">{getCategoryContent()}</div>
          )}
        </div>
      </div>
    );
  };

  // Composant pour les téléchargements d'application
  const AppDownloads = () => (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
      <a 
        href="#" 
        className="inline-flex items-center bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2 fill-current">
          <path d="M17.707,10.708L16.293,9.294L13,12.587L9.707,9.294L8.293,10.708L11.586,14.001L8.293,17.294L9.707,18.708L13,15.415 L16.293,18.708L17.707,17.294L14.414,14.001L17.707,10.708z" />
          <path d="M18.5,0.5h-13C4.119,0.5,3,1.619,3,3v18c0,1.381,1.119,2.5,2.5,2.5h13c1.381,0,2.5-1.119,2.5-2.5V3 C21,1.619,19.881,0.5,18.5,0.5z M19,21c0,0.276-0.224,0.5-0.5,0.5h-13C5.224,21.5,5,21.276,5,21V3c0-0.276,0.224-0.5,0.5-0.5h13 C18.776,2.5,19,2.724,19,3V21z" />
        </svg>
        <div className="text-left">
          <div className="text-xs">Télécharger sur</div>
          <div className="text-sm font-semibold">App Store</div>
        </div>
      </a>
      <a 
        href="#" 
        className="inline-flex items-center bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2 fill-current">
          <path d="M3,20.5C3,21.327,3.673,22,4.5,22h0c0.351,0,0.677-0.119,0.939-0.319l0.032-0.025l7.61-7.61l-2.549-2.549L3.02,19.51 l-0.025,0.032C2.795,19.803,2.676,20.149,2.676,20.5C2.675,20.5,3,20.5,3,20.5z" />
          <path d="M13.253,10.503L22.661,1.66c0.223-0.205,0.359-0.501,0.359-0.83c0-0.618-0.501-1.118-1.118-1.118 c-0.329,0-0.625,0.136-0.83,0.359l-0.069,0.072l-9.4,9.4L13.253,10.503z" />
          <path d="M13.408,14.373l2.548,2.548l7.61-7.61c0.025-0.032,0.319-0.358,0.319-0.939c0-0.828-0.673-1.5-1.5-1.5 c-0.351,0-0.677,0.119-0.939,0.318l-0.033,0.026L13.408,14.373z" />
          <path d="M9.11,10.502l2.549,2.549l7.61-7.61c0.025-0.032,0.319-0.358,0.319-0.939c0-0.828-0.673-1.5-1.5-1.5 c-0.351,0-0.677,0.119-0.939,0.318l-0.033,0.026L9.11,10.502z" />
        </svg>
        <div className="text-left">
          <div className="text-xs">Télécharger sur</div>
          <div className="text-sm font-semibold">Google Play</div>
        </div>
      </a>
    </div>
  );

  // Composant pour les fonctionnalités individuelles avec expansion
  const FeatureItem = ({ feature, isExpanded, onToggle }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200">
      <button 
        onClick={() => onToggle(feature.id)}
        className="w-full text-left p-4 flex items-center justify-between focus:outline-none hover:bg-green-50 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-3">
            {React.cloneElement(feature.icon, { 
              className: isExpanded ? "text-amber-600 fill-amber-500" : "text-green-800",
              size: 18
            })}
          </div>
          <h3 className="text-md font-medium text-green-800">{feature.title}</h3>
        </div>
        {isExpanded ? 
          <ChevronUp size={18} className="text-amber-600" /> : 
          <ChevronDown size={18} className="text-green-800" />
        }
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 bg-white animate-fade-in">
          <p className="text-gray-700 pl-12">{feature.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 pt-20 pb-12">
      <Helmet>
        <title>Fonctionnalités | Fydo</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de Fydo - Application de scan et d'avis vérifiés sur les produits alimentaires et cosmétiques" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* En-tête de page */}
          <div className="text-center mb-12 opacity-0 animate-fade-in">
            <h1 className="text-4xl font-bold text-green-800 mb-4">Fonctionnalités</h1>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Découvrez comment Fydo révolutionne votre façon de choisir vos produits alimentaires et cosmétiques
            </p>
          </div>
          
          {/* Section application mobile */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <Smartphone size={24} className="text-green-800 mr-2" />
                  <h2 className="text-2xl font-bold text-green-800">Application Mobile</h2>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Fydo est disponible sur iOS et Android pour vous accompagner partout. Scannez les produits directement en magasin pour faire des choix éclairés au moment de l'achat.
                </p>
                
                <AppDownloads />
              </div>
              
              <div className="md:w-2/5 bg-green-50 flex items-center justify-center p-6">
                <PhoneMockup color="green" />
              </div>
            </div>
          </div>
          
          {/* Onglets de navigation pour les catégories de fonctionnalités */}
          <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
            <div className="flex flex-wrap">
              {featureCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleSection(category.id)}
                  className={`flex-1 min-w-[150px] py-4 flex flex-col items-center justify-center space-y-1 transition-colors ${
                    activeSection === category.id 
                      ? 'bg-green-50 border-b-2 border-green-800' 
                      : 'text-gray-700 hover:bg-green-50 border-b border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeSection === category.id ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    {React.cloneElement(category.icon, { 
                      className: activeSection === category.id ? "text-amber-600 fill-amber-500" : "text-green-800",
                      size: 20
                    })}
                  </div>
                  <span className={`text-sm font-medium ${
                    activeSection === category.id ? 'text-green-800' : 'text-gray-700'
                  }`}>{category.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Contenu de la catégorie sélectionnée */}
          {featureCategories.map((category) => (
            <div 
              key={category.id}
              className={`transition-all duration-300 ${activeSection === category.id ? 'block' : 'hidden'}`}
            >
              <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="lg:w-1/2">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">{category.title}</h2>
                  <p className="text-green-700 mb-6">{category.description}</p>
                  
                  <div className="space-y-3">
                    {category.featureList.map((feature) => (
                      <FeatureItem 
                        key={feature.id}
                        feature={feature}
                        isExpanded={expandedFeatures[feature.id]}
                        onToggle={toggleFeature}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="lg:w-1/2 flex items-center justify-center">
                  <div className="relative w-full max-w-sm">
                    <PhoneMockup 
                      imageUrl={category.phoneImage} 
                      alt={`${category.title} sur mobile`} 
                      color={category.color}
                      category={category.id}
                    />
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-green-50">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        {React.cloneElement(category.icon, { 
                          className: "text-green-800 fill-green-700",
                          size: 32
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Bannière d'appel à l'action */}
          <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Prêt à rejoindre la communauté Fydo ?
              </h2>
              <p className="text-green-100 mb-6 text-center max-w-xl mx-auto">
                Commencez dès maintenant à découvrir des avis vérifiés sur vos produits préférés et partagez votre expérience.
              </p>
              <div className="flex justify-center">
                <AppDownloads />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Composant pour l'icône de l'horloge (manquant dans la liste)
const Clock = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default FeaturesPage;