// src/pages/ConceptPage.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Lightbulb, 
  Target, 
  Users, 
  Shield, 
  Check, 
  Camera, 
  Star, 
  MessageSquare, 
  ShoppingBag,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const ConceptPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Principales caractéristiques de Fydo
  const keyFeatures = [
    {
      id: 'scanning',
      icon: <Camera size={24} className="text-green-800" />,
      title: "Scan instantané",
      description: "Scannez simplement le code-barres d'un produit alimentaire ou cosmétique pour accéder à toutes ses informations et aux avis des utilisateurs."
    },
    {
      id: 'reviews',
      icon: <Star size={24} className="text-amber-500 fill-amber-500" />,
      title: "Avis vérifiés",
      description: "Chaque avis est lié à un achat réel, vérifié par ticket de caisse, garantissant des retours d'expérience authentiques."
    },
    {
      id: 'sharing',
      icon: <MessageSquare size={24} className="text-green-800" />,
      title: "Partagez votre expérience",
      description: "Donnez votre avis sur les produits que vous achetez et aidez d'autres consommateurs à faire de meilleurs choix."
    },
    {
      id: 'verification',
      icon: <Shield size={24} className="text-green-800" />,
      title: "Preuve d'achat",
      description: "Notre système de vérification par ticket de caisse assure que tous les avis proviennent de véritables acheteurs."
    }
  ];

  // Sections de contenu détaillé
  const contentSections = [
    {
      id: 'mission',
      icon: <Target size={28} />,
      title: "Notre Mission",
      content: (
        <div className="space-y-4">
          <p className="text-green-800 text-lg font-medium">
            Permettre aux consommateurs de partager leurs retours d'expérience authentiques sur les produits du quotidien.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                <Check className="text-green-800" size={16} />
              </div>
              <p className="text-gray-700">
                Créer un espace où les consommateurs peuvent s'exprimer sur la qualité, le goût, le rapport qualité-prix et d'autres critères pertinents sur leurs achats quotidiens.
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                <Check className="text-green-800" size={16} />
              </div>
              <p className="text-gray-700">
                Garantir la fiabilité de chaque avis grâce à la vérification par ticket de caisse, éliminant ainsi les doutes sur leur authenticité.
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                <Check className="text-green-800" size={16} />
              </div>
              <p className="text-gray-700">
                Aider les marques à comprendre les attentes réelles de leurs clients pour mieux y répondre à travers leurs produits.
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                <Check className="text-green-800" size={16} />
              </div>
              <p className="text-gray-700">
                Faciliter le choix des consommateurs en leur donnant accès à des retours d'expérience pertinents avant leurs achats.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'howItWorks',
      icon: <Lightbulb size={28} />,
      title: "Comment ça fonctionne",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Camera className="text-green-800" size={24} />
            </div>
            <h3 className="font-semibold text-green-800 mb-2">1. Scannez</h3>
            <p className="text-gray-700">
              Utilisez votre smartphone pour scanner le code-barres d'un produit alimentaire ou cosmétique et découvrez ce que d'autres consommateurs en pensent.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Star className="text-amber-600 fill-amber-500" size={24} />
            </div>
            <h3 className="font-semibold text-green-800 mb-2">2. Découvrez</h3>
            <p className="text-gray-700">
              Accédez aux avis détaillés sur le rapport qualité-prix, le goût, la texture - des retours d'expérience réels basés sur des achats vérifiés.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <MessageSquare className="text-green-800" size={24} />
            </div>
            <h3 className="font-semibold text-green-800 mb-2">3. Partagez</h3>
            <p className="text-gray-700">
              Après avoir essayé un produit, donnez votre propre avis. Un simple scan de votre ticket de caisse authentifie votre évaluation et la rend précieuse.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'community',
      icon: <Users size={28} />,
      title: "Une communauté de confiance",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Fydo est une communauté collaborative où chaque membre contribue à améliorer l'expérience collective. Notre système de statut valorise les contributeurs réguliers et fiables :
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-amber-600">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <Star className="text-amber-600 fill-amber-600" size={20} />
                </div>
                <h4 className="font-semibold text-amber-800">Bronze</h4>
              </div>
              <p className="text-sm text-gray-600">
                Niveau débutant pour les nouveaux membres qui commencent à partager leurs avis.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-gray-400">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <Star className="text-gray-500 fill-gray-500" size={20} />
                </div>
                <h4 className="font-semibold text-gray-700">Argent</h4>
              </div>
              <p className="text-sm text-gray-600">
                Contributeurs actifs avec des avis réguliers et appréciés par la communauté.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-yellow-500">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <Star className="text-yellow-600 fill-yellow-500" size={20} />
                </div>
                <h4 className="font-semibold text-yellow-800">Or</h4>
              </div>
              <p className="text-sm text-gray-600">
                Membres expérimentés reconnus pour la qualité et la pertinence de leurs contributions.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-blue-400">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Star className="text-blue-600 fill-blue-500" size={20} />
                </div>
                <h4 className="font-semibold text-blue-700">Diamant</h4>
              </div>
              <p className="text-sm text-gray-600">
                Experts et contributeurs d'élite dont les avis sont particulièrement valorisés.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      icon: <ShoppingBag size={28} />,
      title: "Produits ciblés",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Fydo se concentre sur deux catégories essentielles qui font partie de votre quotidien :
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <ShoppingBag className="text-green-800" size={16} />
                </div>
                Produits alimentaires
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Aliments préparés et transformés</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Boissons et produits laitiers</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Snacks et confiseries</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Compléments alimentaires</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <ShoppingBag className="text-green-800" size={16} />
                </div>
                Produits cosmétiques
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Soins de la peau et du corps</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Maquillage et produits de beauté</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Parfums et eaux de toilette</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight size={16} className="text-green-600 mr-1" />
                  <span className="text-gray-700">Produits d'hygiène personnelle</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-green-50 pt-20 pb-12">
      <Helmet>
        <title>Notre Concept | Fydo</title>
        <meta name="description" content="Découvrez comment Fydo permet aux consommateurs de partager leurs expériences authentiques sur les produits alimentaires et cosmétiques du quotidien" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de page avec animation subtile */}
          <div className="text-center mb-12 opacity-0 animate-fade-in">
            <h1 className="text-4xl font-bold text-green-800 mb-4">Notre Concept</h1>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Une communauté qui révolutionne vos choix de produits grâce à des avis authentiques et vérifiés
            </p>
          </div>
          
          {/* Bannière à propos du concept */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 mb-6 md:mb-0">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    La Genèse de Fydo
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Fydo est né d'un constat simple : les consommateurs n'ont que très peu d'occasions de partager leurs expériences authentiques sur les produits qu'ils achètent au quotidien.
                  </p>
                  <p className="text-green-700 font-medium mb-4">
                    Qui n'a jamais été déçu par un changement de recette d'un produit favori ou enchanté par une découverte qui mérite d'être partagée ?
                  </p>
                  <p className="text-gray-700">
                    C'est pourquoi nous avons créé Fydo, la première plateforme communautaire d'avis vérifiés par ticket de caisse, permettant aux consommateurs de partager leurs expériences réelles.
                  </p>
                </div>
                <div className="w-full md:w-1/2 md:pl-8 flex justify-center">
                  <div className="w-64 h-64 bg-green-100 rounded-full flex items-center justify-center p-6 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-200 to-green-50 animate-slow-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-green-800 font-bold text-3xl mb-1">Fydo</div>
                      <div className="text-amber-500 text-4xl">★</div>
                      <p className="text-sm text-green-700 mt-3 max-w-[150px] mx-auto">
                        La communauté qui révolutionne vos choix de produits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Caractéristiques clés - grille en 4 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {keyFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-green-800 mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          {/* Sections de contenu accordéon */}
          <div className="space-y-4">
            {contentSections.map((section) => (
              <div 
                key={section.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300"
              >
                <button 
                  className={`w-full text-left p-6 flex items-center justify-between focus:outline-none ${
                    activeSection === section.id ? 'bg-green-50 border-b border-green-100' : ''
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      activeSection === section.id ? 'bg-amber-100' : 'bg-green-50'
                    }`}>
                      {/* Clone l'icône et applique le remplissage (fill) lorsque la section est active */}
                      {React.cloneElement(section.icon, { 
                        className: activeSection === section.id 
                          ? "text-amber-600 fill-amber-500" 
                          : "text-green-800"
                      })}
                    </div>
                    <h2 className="text-xl font-semibold text-green-800">{section.title}</h2>
                  </div>
                  <ArrowRight 
                    size={20} 
                    className={`transition-transform ${
                      activeSection === section.id 
                        ? 'text-amber-600 transform rotate-90' 
                        : 'text-green-800'
                    }`} 
                  />
                </button>
                
                {activeSection === section.id && (
                  <div className="p-6 animate-fade-in">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Bannière d'appel à l'action */}
          <div className="mt-10 bg-gradient-to-r from-green-800 to-green-700 rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Rejoignez la communauté Fydo
              </h2>
              <p className="text-green-100 mb-6 text-center max-w-xl mx-auto">
                Partagez vos expériences avec des milliers d'autres consommateurs et contribuez à améliorer les produits que nous utilisons tous les jours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="bg-white text-green-800 font-medium py-3 px-6 rounded-lg hover:bg-green-50 transition-colors text-center"
                >
                  Créer un compte
                </a>
                <a 
                  href="/recherche-filtre" 
                  className="bg-amber-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors text-center"
                >
                  Essayer le scan
                </a>
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
        
        @keyframes slowPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slow-pulse {
          animation: slowPulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ConceptPage;