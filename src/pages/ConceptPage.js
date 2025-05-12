// src/page/ConceptPage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { 
  Lightbulb, 
  Target, 
  Users, 
  Shield, 
  Check, 
  Leaf, 
  Star, 
  Search, 
  Zap, 
  BarChart, 
  Lock, 
  UserCheck 
} from 'lucide-react';

const Concept = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Notre Concept | Fydo</title>
        <meta name="description" content="Découvrez le concept de Fydo - Pourquoi et comment nous avons créé la première communauté d'avis vérifiés sur les produits alimentaires et cosmétiques" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Notre Concept</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Lightbulb className="mr-2" size={22} />
                La Genèse de Fydo
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Fydo est né d'un constat simple : il est difficile de faire des choix éclairés lors de nos achats quotidiens, malgré la multitude d'informations disponibles sur les produits alimentaires et cosmétiques.
                </p>
                
                <p>
                  Nos habitudes de consommation évoluent. Nous sommes de plus en plus nombreux à nous préoccuper de la composition des produits, de leur impact environnemental, et de l'éthique des marques que nous soutenons. Pourtant, il reste difficile de s'y retrouver face aux allégations marketing et aux informations parfois contradictoires.
                </p>
                
                <p>
                  C'est pourquoi nous avons créé Fydo, la première plateforme communautaire d'avis vérifiés par ticket de caisse, permettant de scanner et de partager des retours d'expérience authentiques sur les produits du quotidien.
                </p>
              </div>
            </div>
          </div>
          
          {/* Mission */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Target className="mr-2" size={22} />
                Notre Mission
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p className="font-medium text-green-600 text-lg">
                  Rendre la consommation plus transparente, plus éclairée et plus responsable.
                </p>
                
                <p>
                  Fydo s'est donné pour mission de :
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Donner accès à des informations fiables sur les produits, enrichies par l'expérience réelle des consommateurs</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Créer une communauté active et transparente, où chaque avis est vérifié par une preuve d'achat</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Simplifier le processus de décision lors des achats grâce à un système de scan et de recherche intuitif</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Promouvoir une consommation plus consciente en mettant en lumière les aspects nutritionnels, environnementaux et éthiques des produits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Comment ça fonctionne */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-6">
                <Zap className="mr-2" size={22} />
                Comment Fonctionne Fydo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-5 rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">1. Scannez</h3>
                  <p className="text-gray-700">
                    Utilisez votre smartphone pour scanner le code-barres d'un produit alimentaire ou cosmétique. Fydo vous montrera instantanément toutes les informations disponibles.
                  </p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Star className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">2. Découvrez</h3>
                  <p className="text-gray-700">
                    Consultez les avis vérifiés des autres utilisateurs, les informations nutritionnelles, l'impact environnemental et bien plus encore sur chaque produit.
                  </p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">3. Partagez</h3>
                  <p className="text-gray-700">
                    Après avoir essayé un produit, partagez votre propre avis en téléchargeant une photo de votre ticket de caisse comme preuve d'achat.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ce qui nous différencie */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <BarChart className="mr-2" size={22} />
                Ce Qui Nous Différencie
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Des avis vérifiés à 100%</h3>
                    <p>
                      Contrairement à la plupart des plateformes d'avis, chaque avis sur Fydo est lié à un achat réel, vérifié par ticket de caisse. Finis les faux avis ou les témoignages biaisés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <UserCheck className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Une communauté active et reconnue</h3>
                    <p>
                      Notre système de statut utilisateur (Bronze, Argent, Or, Diamant) valorise les contributeurs réguliers et fiables, créant ainsi une communauté engagée et qualitative.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Leaf className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Vision à 360° des produits</h3>
                    <p>
                      Au-delà des avis, Fydo intègre des données nutritionnelles, environnementales (Éco-Score), et la présence d'allergènes, pour une vision complète de chaque produit.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Lock className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Respect de la vie privée</h3>
                    <p>
                      Nous accordons une importance capitale à la protection de vos données. Les tickets sont anonymisés et vous gardez le contrôle sur les informations que vous partagez.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nos valeurs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Users className="mr-2" size={22} />
                Nos Valeurs
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Transparence</h3>
                  <p className="text-gray-700">
                    Nous croyons que l'information claire et vérifiable est essentielle pour faire des choix éclairés.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Authenticité</h3>
                  <p className="text-gray-700">
                    Chaque avis sur Fydo provient d'une expérience réelle et vérifiée.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Communauté</h3>
                  <p className="text-gray-700">
                    Fydo est avant tout une communauté collaborative où chaque contribution compte.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Responsabilité</h3>
                  <p className="text-gray-700">
                    Nous encourageons une consommation plus consciente et respectueuse de l'environnement.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rejoignez-nous */}
          <div className="bg-green-600 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white flex items-center mb-4">
                Rejoignez la communauté Fydo
              </h2>
              
              <p className="text-green-100 mb-4">
                Ensemble, construisons une communauté de consommateurs éclairés et responsables, où chaque avis compte et contribue à des choix plus informés pour tous.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/signup" className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition duration-300 text-center">
                  Créer un compte
                </a>
                <a href="/recherche-filtre" className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300 text-center">
                  Essayer le scan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Concept;