// src/components/FAQEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown,
  HelpCircle,
  Camera, 
  Star, 
  MessageSquare, 
  Shield,
  CreditCard,
  User,
  Globe
} from 'lucide-react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Observer pour déclencher l'animation lorsque la section est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  // Catégories de FAQ
  const categories = [
    { id: 'general', name: 'Questions générales', icon: <HelpCircle size={20} /> },
    { id: 'scan', name: 'Scan et recherche', icon: <Camera size={20} /> },
    { id: 'reviews', name: 'Avis et évaluations', icon: <Star size={20} className="text-amber-500 fill-amber-500" /> },
    { id: 'account', name: 'Compte et profil', icon: <User size={20} /> },
    { id: 'subscription', name: 'Abonnements et paiement', icon: <CreditCard size={20} /> },
    { id: 'data', name: 'Données et confidentialité', icon: <Globe size={20} /> }
  ];

  // Questions par catégorie
  const faqQuestions = {
    general: [
      {
        id: 'what-is-fydo',
        question: "Qu'est-ce que FYDO ?",
        answer: "FYDO est une application communautaire qui vous permet de scanner les codes-barres des produits alimentaires et cosmétiques pour accéder instantanément à leurs informations détaillées et aux avis d'autres utilisateurs. Notre objectif est de vous aider à faire des choix plus éclairés pour vos achats du quotidien."
      },
      {
        id: 'how-fydo-works',
        question: "Comment fonctionne FYDO ?",
        answer: "FYDO fonctionne en 3 étapes simples : 1) Scannez le code-barres d'un produit avec votre smartphone, 2) Consultez les informations nutritionnelles, environnementales et les avis vérifiés des autres utilisateurs, 3) Donnez votre propre avis après achat en téléchargeant une photo de votre ticket de caisse comme preuve."
      },
      {
        id: 'fydo-cost',
        question: "FYDO est-il gratuit ?",
        answer: "FYDO propose une version gratuite avec des fonctionnalités de base ainsi que des abonnements payants (mensuel ou annuel) qui offrent des fonctionnalités supplémentaires comme un nombre illimité de scans, la possibilité de mettre des produits en favoris et d'accéder à davantage d'avis."
      },
      {
        id: 'supported-products',
        question: "Quels types de produits sont supportés par FYDO ?",
        answer: "FYDO se concentre principalement sur les produits alimentaires et cosmétiques disponibles dans le commerce. Notre base de données s'enrichit quotidiennement grâce aux contributions des utilisateurs et à notre partenariat avec OpenFoodFacts."
      }
    ],
    scan: [
      {
        id: 'scan-limit',
        question: "Y a-t-il une limite au nombre de scans que je peux effectuer ?",
        answer: "Le nombre de scans dépend de votre type d'abonnement. Avec un compte gratuit, vous disposez d'un nombre limité de scans par jour. Les abonnements payants offrent un nombre de scans plus élevé, voire illimité avec certaines formules premium."
      },
      {
        id: 'scan-not-working',
        question: "Que faire si le scan du code-barres ne fonctionne pas ?",
        answer: "Si le scan ne fonctionne pas, vous pouvez saisir manuellement le code-barres dans l'onglet de recherche. Assurez-vous que l'éclairage est suffisant et que le code-barres est bien visible. Si un produit n'est pas reconnu, vous pouvez contribuer en ajoutant ses informations à notre base de données."
      },
      {
        id: 'search-by-name',
        question: "Puis-je rechercher un produit par son nom plutôt que par son code-barres ?",
        answer: "Oui, FYDO vous permet de rechercher des produits par leur nom. Utilisez l'onglet de recherche par nom et vous pourrez même appliquer des filtres avancés, comme la recherche par ingrédients inclus ou exclus (par exemple: rechercher des produits SANS gluten ou AVEC du céleri)."
      },
      {
        id: 'unrecognized-product',
        question: "Que faire si un produit n'est pas reconnu ?",
        answer: "Si un produit n'est pas reconnu, vous pouvez l'ajouter à notre base de données en fournissant ses informations de base. Vous contribuerez ainsi à enrichir FYDO pour toute la communauté. Cette fonctionnalité nécessite un compte utilisateur vérifié."
      }
    ],
    reviews: [
      {
        id: 'leave-review',
        question: "Comment puis-je laisser un avis sur un produit ?",
        answer: "Pour laisser un avis, recherchez d'abord le produit concerné, puis cliquez sur le bouton 'Donner mon avis'. Vous pourrez attribuer des notes sur différents critères (goût, quantité, rapport qualité/prix) et laisser un commentaire. Pour renforcer la fiabilité, vous devrez télécharger une photo de votre ticket de caisse prouvant votre achat."
      },
      {
        id: 'review-frequency',
        question: "Combien d'avis puis-je publier ?",
        answer: "Vous pouvez publier un avis par produit et par mois. Cette limitation vise à garantir la qualité et la pertinence des avis. Si vous souhaitez mettre à jour votre avis sur un produit, vous devrez attendre la fin du mois en cours."
      },
      {
        id: 'verified-reviews',
        question: "Qu'est-ce qu'un 'avis vérifié' ?",
        answer: "Un 'avis vérifié' signifie que l'utilisateur a fourni une preuve d'achat (ticket de caisse) qui a été validée par notre système. Ces avis sont considérés comme plus fiables car ils proviennent de personnes ayant réellement acheté et utilisé le produit. Les avis vérifiés sont identifiés par un badge spécial."
      },
      {
        id: 'receipt-sharing',
        question: "Qui peut voir mon ticket de caisse ?",
        answer: "Par défaut, votre ticket de caisse est utilisé uniquement pour vérifier votre achat et n'est pas partagé publiquement. Vous pouvez toutefois autoriser le partage de votre ticket (anonymisé) avec la communauté pour renforcer la crédibilité de votre avis. Dans tous les cas, vos informations personnelles sont protégées."
      }
    ],
    account: [
      {
        id: 'create-account',
        question: "Comment créer un compte FYDO ?",
        answer: "Pour créer un compte, cliquez sur 'Inscription' dans le menu principal. Vous devrez fournir une adresse e-mail valide et créer un mot de passe. Vous pouvez également vous inscrire via votre compte Google ou Facebook pour plus de simplicité. Une fois inscrit, vous pourrez personnaliser votre profil et accéder à toutes les fonctionnalités de FYDO."
      },
      {
        id: 'account-benefits',
        question: "Quels sont les avantages d'avoir un compte ?",
        answer: "Avoir un compte vous permet de publier des avis, de sauvegarder vos produits favoris, de consulter votre historique de recherche, de recevoir des recommandations personnalisées et d'accéder à des fonctionnalités exclusives selon votre abonnement. De plus, vos paramètres et préférences sont sauvegardés entre les sessions."
      },
      {
        id: 'delete-account',
        question: "Comment supprimer mon compte ?",
        answer: "Pour supprimer votre compte, accédez à votre profil, puis aux paramètres du compte, et sélectionnez 'Supprimer mon compte'. Vous devrez confirmer cette action qui est irréversible. Toutes vos données personnelles seront supprimées conformément à notre politique de confidentialité, mais vos avis anonymisés pourront être conservés."
      },
      {
        id: 'history-favorites',
        question: "Comment gérer mon historique et mes favoris ?",
        answer: "Vous pouvez accéder à votre historique de recherche et à vos produits favoris depuis votre profil utilisateur. L'historique vous permet de retrouver facilement les produits consultés précédemment. Pour ajouter un produit à vos favoris, cliquez simplement sur l'icône en forme d'étoile sur la page du produit. Notez que la fonctionnalité de favoris peut nécessiter un abonnement selon votre formule."
      }
    ],
    subscription: [
      {
        id: 'subscription-plans',
        question: "Quels sont les différents plans d'abonnement ?",
        answer: "FYDO propose plusieurs formules d'abonnement : Gratuit (fonctionnalités de base), Essential (notre offre la plus populaire avec un nombre accru de scans et la possibilité d'ajouter des favoris), et Premium (accès illimité à toutes les fonctionnalités). Vous pouvez consulter le détail des offres et leurs tarifs dans la section 'Abonnements' de l'application."
      },
      {
        id: 'change-subscription',
        question: "Comment changer ou annuler mon abonnement ?",
        answer: "Pour modifier ou annuler votre abonnement, accédez à votre profil, puis à 'Mon abonnement'. Vous pourrez y gérer vos options d'abonnement, passer à une formule supérieure ou inférieure, ou annuler le renouvellement automatique. L'annulation prendra effet à la fin de la période en cours, et vous conserverez l'accès aux fonctionnalités premium jusqu'à cette date."
      },
      {
        id: 'payment-methods',
        question: "Quels moyens de paiement sont acceptés ?",
        answer: "FYDO accepte les cartes de crédit/débit (Visa, Mastercard, American Express), ainsi que les paiements via Apple Pay et Google Pay. Toutes les transactions sont sécurisées et vos informations de paiement ne sont jamais stockées sur nos serveurs."
      },
      {
        id: 'refund-policy',
        question: "Quelle est la politique de remboursement ?",
        answer: "FYDO offre une garantie satisfait ou remboursé de 14 jours. Si vous n'êtes pas satisfait de votre abonnement premium, vous pouvez demander un remboursement dans les 14 jours suivant votre souscription. Pour ce faire, contactez notre support client à support@fydo.app en expliquant votre situation."
      }
    ],
    data: [
      {
        id: 'data-sources',
        question: "D'où proviennent les données sur les produits ?",
        answer: "Les données proviennent principalement de la base OpenFoodFacts, que nous enrichissons avec les contributions de notre communauté. Pour les informations nutritionnelles et environnementales, nous utilisons des sources officielles comme les étiquettes des produits et les bases de données Nutri-Score et Eco-Score. Les avis sont générés exclusivement par notre communauté d'utilisateurs."
      },
      {
        id: 'data-update',
        question: "À quelle fréquence les données sont-elles mises à jour ?",
        answer: "Les données de base sont synchronisées quotidiennement avec OpenFoodFacts. Les informations spécifiques à FYDO (avis, notes, prix moyens) sont mises à jour en temps réel. Si vous constatez une information erronée, vous pouvez la signaler via l'option 'Signaler une erreur' sur la page du produit."
      },
      {
        id: 'data-privacy',
        question: "Comment mes données personnelles sont-elles protégées ?",
        answer: "FYDO respecte strictement le RGPD et autres réglementations sur la protection des données. Vos informations personnelles sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite. Les tickets de caisse que vous téléchargez sont anonymisés automatiquement avant tout traitement. Pour plus de détails, consultez notre politique de confidentialité."
      },
      {
        id: 'location-data',
        question: "Pourquoi l'application demande-t-elle l'accès à ma localisation ?",
        answer: "L'accès à votre localisation est optionnel et sert uniquement à enrichir les avis que vous laissez. Cela permet aux autres utilisateurs de savoir dans quelle région un produit a été acheté, ce qui peut être utile car la composition de certains produits varie selon les pays ou régions. Vous pouvez désactiver cette fonctionnalité à tout moment dans les paramètres."
      }
    ]
  };

  // Fonction pour gérer le clic sur une question
  const handleQuestionClick = (questionId) => {
    setActiveQuestion(activeQuestion === questionId ? null : questionId);
  };

  // Style de base pour les boutons de catégorie
  const baseCategoryButtonClass = "flex items-center px-5 py-3 rounded-full transition-all duration-300 text-sm font-medium";
  // Style pour le bouton de catégorie active
  const activeCategoryButtonClass = "bg-white text-green-800 shadow-md";
  // Style pour le bouton de catégorie inactive
  const inactiveCategoryButtonClass = "text-green-800 hover:bg-white hover:shadow-sm";

  // Style spécial pour le bouton de la catégorie des avis (avec étoile ambrée)
  const getReviewsButtonClass = (isActive) => {
    return isActive 
      ? "bg-white text-amber-600 shadow-md" 
      : "text-amber-600 hover:bg-white hover:shadow-sm";
  };

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden" ref={sectionRef}>
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 to-transparent opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-10 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-green-800 mb-3">Foire Aux Questions</h2>
          <p className="text-green-700 max-w-2xl mx-auto">
            Trouvez des réponses aux questions les plus fréquemment posées sur FYDO et son fonctionnement
          </p>
        </div>
        
        {/* Navigation par catégories - Style Pills */}
        <div className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`${baseCategoryButtonClass} ${
                activeCategory === category.id 
                  ? (category.id === 'reviews' ? getReviewsButtonClass(true) : activeCategoryButtonClass)
                  : (category.id === 'reviews' ? getReviewsButtonClass(false) : inactiveCategoryButtonClass)
              }`}
              style={{ transitionDelay: `${isVisible ? 100 + index * 50 : 0}ms` }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Contenu des FAQs */}
        <div className="max-w-3xl mx-auto">
          {Object.keys(faqQuestions).map((categoryId) => (
            <div 
              key={categoryId}
              className={`space-y-3 transition-all duration-500 ${
                activeCategory === categoryId ? 'block' : 'hidden'
              }`}
            >
              {/* Titre de la catégorie avec une ligne décorative */}
              <div className="flex items-center mb-5">
                <h3 className="text-xl font-bold text-green-800 mr-4">
                  {categories.find(cat => cat.id === categoryId)?.name}
                </h3>
                <div className="flex-grow h-0.5 bg-gradient-to-r from-green-200 to-transparent rounded"></div>
              </div>
              
              {faqQuestions[categoryId].map((item, index) => (
                <div 
                  key={item.id}
                  className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${isVisible ? 300 + index * 100 : 0}ms` }}
                >
                  <button
                    onClick={() => handleQuestionClick(item.id)}
                    className={`w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none ${
                      activeQuestion === item.id ? 'bg-green-50' : 'hover:bg-green-50'
                    }`}
                    aria-expanded={activeQuestion === item.id}
                  >
                    <span className="font-medium text-green-800">{item.question}</span>
                    <ChevronDown 
                      className={`text-green-600 transition-transform duration-300 ${
                        activeQuestion === item.id ? 'transform rotate-180' : ''
                      }`} 
                      size={20}
                    />
                  </button>
                  
                  {/* Contenu de la réponse avec animation */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      activeQuestion === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 py-4 border-t border-gray-100 bg-white">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Assistance supplémentaire */}
        <div className={`mt-12 max-w-2xl mx-auto text-center transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl shadow-sm border border-green-100">
            <Shield size={32} className="mx-auto text-green-600 mb-3" />
            <h3 className="text-xl font-bold text-green-800 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="text-green-700 mb-4">
              Notre équipe de support est là pour vous aider avec toutes vos questions.
            </p>
            <a 
              href="mailto:support@fydo.app" 
              className="inline-flex items-center bg-green-800 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-sm hover:shadow-md"
            >
              <MessageSquare size={18} className="mr-2" />
              Contacter notre support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;