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
  UserCheck,
  MessageSquare,
  Share2,
  RefreshCw
} from 'lucide-react';

const Concept = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Notre Concept | Fydo</title>
        <meta name="description" content="Découvrez comment Fydo permet aux consommateurs de partager leurs expériences authentiques sur les produits alimentaires et cosmétiques du quotidien" />
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
                  Fydo est né d'un constat simple : les consommateurs n'ont que très peu d'occasions de partager leurs expériences authentiques sur les produits qu'ils achètent au quotidien.
                </p>
                
                <p className="font-medium text-green-700">
                  Qui n'a jamais été déçu par un changement de recette d'un produit favori, surpris par un rapport qualité-prix décevant, ou au contraire enchanté par une découverte qui mérite d'être partagée ?
                </p>
                
                <p>
                  Jusqu'à présent, ces précieux retours d'expérience restaient souvent confinés à notre cercle proche, sans possibilité d'être entendus par d'autres consommateurs ou par les marques elles-mêmes.
                </p>
                
                <p>
                  C'est pourquoi nous avons créé Fydo, la première plateforme communautaire d'avis vérifiés par ticket de caisse, permettant aux consommateurs de partager leurs expériences réelles sur les produits alimentaires et cosmétiques, et ainsi d'aider à l'amélioration continue de notre quotidien.
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
                  Permettre aux consommateurs de partager leurs retours d'expérience authentiques sur les produits du quotidien.
                </p>
                
                <p>
                  Fydo s'est donné pour mission de :
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Créer un espace où les consommateurs peuvent s'exprimer sur la qualité, le goût, le rapport qualité-prix et d'autres critères pertinents sur leurs achats quotidiens</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Garantir la fiabilité de chaque avis grâce à la vérification par ticket de caisse, éliminant ainsi les doutes sur leur authenticité</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Aider les marques à comprendre les attentes réelles de leurs clients pour mieux y répondre à travers leurs produits</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Faciliter le choix des consommateurs en leur donnant accès à des retours d'expérience pertinents avant leurs achats</span>
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
                    Utilisez votre smartphone pour scanner le code-barres d'un produit alimentaire ou cosmétique. Découvrez ce que d'autres consommateurs pensent de sa nouvelle recette, de son goût ou de son efficacité.
                  </p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Star className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">2. Découvrez</h3>
                  <p className="text-gray-700">
                    Accédez aux avis détaillés sur le rapport qualité-prix, le goût après reformulation, la texture d'un cosmétique - des retours d'expérience réels basés sur des achats vérifiés.
                  </p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">3. Partagez votre avis</h3>
                  <p className="text-gray-700">
                    Après avoir essayé un produit, donnez votre propre retour d'expérience. Un simple scan de votre ticket de caisse authentifie votre avis, le rendant encore plus précieux pour la communauté et les marques.
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
                    <h3 className="font-medium text-blue-800 mb-1">Des avis 100% vérifiés</h3>
                    <p>
                      Chaque avis sur Fydo est lié à un achat réel, vérifié par ticket de caisse. Cette approche garantit des retours d'expérience authentiques, basés sur une utilisation réelle du produit.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Share2 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Un canal de communication direct</h3>
                    <p>
                      Fydo crée un pont entre consommateurs et marques, permettant aux premiers d'exprimer leurs impressions réelles et aux secondes de mieux comprendre comment leurs produits sont perçus au quotidien.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <UserCheck className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Une communauté de confiance</h3>
                    <p>
                      Notre système de statut (Bronze, Argent, Or, Diamant) valorise les contributeurs réguliers et fiables, créant ainsi un cercle vertueux où les avis les plus utiles sont mis en avant.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <RefreshCw className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Un catalyseur d'amélioration</h3>
                    <p>
                      Quand des consommateurs notent qu'un changement de recette déplaît ou qu'un packaging pose problème, les marques peuvent réagir et adapter leurs produits. Fydo favorise ainsi un dialogue constructif pour de meilleurs produits.
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
                    Nous croyons que la transparence dans les retours d'expérience bénéficie autant aux consommateurs qu'aux marques soucieuses de s'améliorer.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Authenticité</h3>
                  <p className="text-gray-700">
                    Chaque avis sur Fydo provient d'une expérience réelle et vérifiée, garantissant la pertinence des informations partagées.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Communauté</h3>
                  <p className="text-gray-700">
                    Fydo est une communauté collaborative où chaque contribution enrichit l'expérience de tous et participe à l'amélioration des produits.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-2">Amélioration continue</h3>
                  <p className="text-gray-700">
                    Nous croyons que le feedback constructif des consommateurs est l'un des meilleurs moteurs de progrès pour les produits du quotidien.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exemples concrets */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Lightbulb className="mr-2" size={22} />
                Situations où Fydo est utile
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>Fydo vous aide lorsque :</p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Vous remarquez qu'une marque a changé la recette de votre biscuit préféré et vous voulez savoir si d'autres consommateurs l'ont également constaté</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Vous hésitez entre deux shampoings et souhaitez connaître l'avis de personnes qui les ont réellement utilisés sur des critères comme l'efficacité ou le parfum</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Vous trouvez qu'un produit a un rapport qualité-prix discutable et vous voulez partager cette observation pour aider d'autres consommateurs</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Vous avez découvert un excellent produit et souhaitez le faire connaître à d'autres personnes avec des goûts similaires</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Rejoignez-nous */}
          <div className="bg-green-600 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white flex items-center mb-4">
                Partagez vos expériences avec Fydo
              </h2>
              
              <p className="text-green-100 mb-4">
                Rejoignez notre communauté et contribuez à améliorer les produits que nous utilisons tous les jours. Votre expérience compte et peut réellement faire la différence.
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