// src/pages/FeaturesPage.js
import React from 'react';
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
  Clock, 
  CreditCard,
  CheckCircle,
  BarChart3,
  Camera,
  User,
  Smartphone,
  Layers,
  Lock
} from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Fonctionnalités | Fydo</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de Fydo - Application de scan et d'avis vérifiés sur les produits alimentaires et cosmétiques" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4 text-center">Fonctionnalités</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
            <div className="p-6 md:p-8">
              <p className="text-lg text-gray-700 text-center">
                Découvrez comment Fydo révolutionne votre façon de choisir vos produits alimentaires et cosmétiques.
                Notre application combine technologie avancée et intelligence collective pour vous aider à faire des choix éclairés.
              </p>
            </div>
          </div>
          
          {/* Scan et Recherche */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <Scan className="mr-3" size={28} />
              Scan et Recherche
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Camera className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Scan de code-barres</h3>
                  </div>
                  <p className="text-gray-700">
                    Scannez n'importe quel code-barres de produit alimentaire ou cosmétique pour obtenir instantanément 
                    toutes les informations et les avis. Compatible avec plus de 1 million de produits.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Search className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Recherche avancée</h3>
                  </div>
                  <p className="text-gray-700">
                    Recherchez des produits par nom, marque ou ingrédients. Filtrez par catégorie, 
                    allergènes, régime alimentaire (végan, sans gluten, etc.) ou encore par note moyenne.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Avis Vérifiés */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <Star className="mr-3" size={28} />
              Avis Vérifiés
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Vérification par ticket</h3>
                  </div>
                  <p className="text-gray-700">
                    Tous les avis sur Fydo sont vérifiés par un ticket de caisse. Notre système d'IA analyse le ticket 
                    pour confirmer l'achat, garantissant ainsi l'authenticité des avis que vous consultez.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <BarChart3 className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Notes multicritères</h3>
                  </div>
                  <p className="text-gray-700">
                    Évaluez les produits selon plusieurs critères : goût, texture, rapport qualité-prix, 
                    packaging... Consultez les avis détaillés pour avoir une vision complète de chaque produit.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations Produits */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <Info className="mr-3" size={28} />
              Informations Détaillées
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <ShoppingBag className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Nutrition</h3>
                  </div>
                  <p className="text-gray-700">
                    Accédez aux valeurs nutritionnelles complètes, à la liste des ingrédients, 
                    aux allergènes et au Nutri-Score pour chaque produit alimentaire.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Leaf className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Impact environnemental</h3>
                  </div>
                  <p className="text-gray-700">
                    Visualisez l'Éco-Score et l'empreinte carbone des produits. Identifiez la présence 
                    d'huile de palme et l'impact du packaging sur l'environnement.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Shield className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Composition</h3>
                  </div>
                  <p className="text-gray-700">
                    Pour les cosmétiques, découvrez la liste complète des ingrédients, 
                    identifiez les substances controversées et vérifiez si le produit est testé sur les animaux.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Personnalisation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <User className="mr-3" size={28} />
              Personnalisation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Heart className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Favoris et historique</h3>
                  </div>
                  <p className="text-gray-700">
                    Enregistrez vos produits préférés dans vos favoris pour les retrouver facilement. 
                    Consultez votre historique de recherche et gardez une trace des produits scannés.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Clock className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Suivi d'activité</h3>
                  </div>
                  <p className="text-gray-700">
                    Suivez votre activité sur l'application avec un tableau de bord personnalisé. 
                    Avis publiés, produits scannés, interactions... tout est comptabilisé pour 
                    vous faire gagner des statuts (Bronze, Argent, Or, Diamant).
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formules d'abonnement */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <CreditCard className="mr-3" size={28} />
              Formules d'abonnement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Layers className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Gratuit</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>3 scans de produits par jour</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>5 recherches par nom par jour</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Accès aux informations de base</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Publication d'avis vérifiés</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden relative border-2 border-green-500">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                  POPULAIRE
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Layers className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Essential</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Scans de produits illimité</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Recherches par nom illimitées</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Favoris illimités</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Filtres de recherche avancés</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Historique de recherche 3 mois</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Layers className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700">Premium</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Scans et recherches illimités</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Toutes les fonctionnalités d'Essential</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Historique complet de recherche</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Comparaison de produits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Priorité sur les nouvelles fonctionnalités</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Application Mobile */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
            <div className="md:flex">
              <div className="md:w-2/3 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                  <Smartphone className="mr-3" size={28} />
                  Application Mobile
                </h2>
                <p className="text-gray-700 mb-4">
                  Fydo est disponible sur iOS et Android pour vous accompagner partout. Scannez les produits 
                  directement en magasin pour faire des choix éclairés au moment de l'achat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <a 
                    href="#" 
                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2 fill-current">
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
                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2 fill-current">
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
              </div>
              <div className="md:w-1/3 bg-green-100 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-48 h-96 bg-black rounded-3xl border-8 border-gray-800 relative overflow-hidden">
                      <div className="w-full h-full bg-green-50 flex items-center justify-center">
                        <img 
                          src="/images/app-screenshot.png" 
                          alt="Capture d'écran de l'application Fydo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sécurité et protection des données */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <Lock className="mr-3" size={28} />
                Sécurité et protection des données
              </h2>
              <p className="text-gray-700 mb-4">
                Chez Fydo, nous prenons la sécurité et la confidentialité de vos données très au sérieux.
                Toutes les informations personnelles sont cryptées et nous ne partageons jamais vos données 
                avec des tiers sans votre consentement explicite.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Conformité RGPD</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Chiffrement de bout en bout</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Authentification sécurisée</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Anonymisation des tickets de caisse</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Prêt à rejoindre Fydo ?</h2>
            <p className="text-lg text-gray-700 mb-6">
              Commencez dès maintenant à découvrir des avis vérifiés sur vos produits préférés.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/signup" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Créer un compte
              </a>
              <a 
                href="/recherche-filtre" 
                className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-8 rounded-lg border border-green-600 transition-colors"
              >
                Essayer la recherche
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;