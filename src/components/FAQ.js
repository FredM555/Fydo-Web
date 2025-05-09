// src/components/FAQ.js
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Camera, Star, ShoppingBag, User, CreditCard } from 'lucide-react';

const FAQ = () => {
  // État pour suivre quelle catégorie est ouverte
  const [openCategory, setOpenCategory] = useState('general');
  // État pour suivre quelles questions sont ouvertes
  const [openQuestions, setOpenQuestions] = useState({});

  // Fonction pour basculer l'état d'une catégorie
  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // Fonction pour basculer l'état d'une question
  const toggleQuestion = (id) => {
    setOpenQuestions({
      ...openQuestions,
      [id]: !openQuestions[id]
    });
  };

  // Données des FAQs organisées par catégorie
  const faqData = {
    general: {
      icon: <HelpCircle className="text-green-600" />,
      title: "Questions générales",
      questions: [
        {
          id: "what-is-fydo",
          question: "Qu'est-ce que FYDO ?",
          answer: "FYDO est une application communautaire qui vous permet de scanner les codes-barres des produits alimentaires et cosmétiques pour accéder instantanément à leurs informations détaillées et aux avis d'autres utilisateurs. Notre objectif est de vous aider à faire des choix plus éclairés pour vos achats du quotidien."
        },
        {
          id: "how-fydo-works",
          question: "Comment fonctionne FYDO ?",
          answer: "FYDO fonctionne en 3 étapes simples : 1) Scannez le code-barres d'un produit avec votre smartphone, 2) Consultez les informations nutritionnelles, environnementales et les avis vérifiés des autres utilisateurs, 3) Donnez votre propre avis après achat en téléchargeant une photo de votre ticket de caisse comme preuve."
        },
        {
          id: "fydo-cost",
          question: "FYDO est-il gratuit ?",
          answer: "FYDO propose une version gratuite avec des fonctionnalités de base ainsi que des abonnements payants (mensuel ou annuel) qui offrent des fonctionnalités supplémentaires comme un nombre illimité de scans, la possibilité de mettre des produits en favoris et d'accéder à davantage d'avis."
        },
        {
          id: "supported-products",
          question: "Quels types de produits sont supportés par FYDO ?",
          answer: "FYDO se concentre principalement sur les produits alimentaires et cosmétiques disponibles dans le commerce. Notre base de données s'enrichit quotidiennement grâce aux contributions des utilisateurs et à notre partenariat avec OpenFoodFacts."
        }
      ]
    },
    scan: {
      icon: <Camera className="text-green-600" />,
      title: "Scan et recherche",
      questions: [
        {
          id: "scan-limit",
          question: "Y a-t-il une limite au nombre de scans que je peux effectuer ?",
          answer: "Le nombre de scans dépend de votre type d'abonnement. Avec un compte gratuit, vous disposez d'un nombre limité de scans par jour. Les abonnements payants offrent un nombre de scans plus élevé, voire illimité avec certaines formules premium."
        },
        {
          id: "scan-not-working",
          question: "Que faire si le scan du code-barres ne fonctionne pas ?",
          answer: "Si le scan ne fonctionne pas, vous pouvez saisir manuellement le code-barres dans l'onglet de recherche. Assurez-vous que l'éclairage est suffisant et que le code-barres est bien visible. Si un produit n'est pas reconnu, vous pouvez contribuer en ajoutant ses informations à notre base de données."
        },
        {
          id: "search-by-name",
          question: "Puis-je rechercher un produit par son nom plutôt que par son code-barres ?",
          answer: "Oui, FYDO vous permet de rechercher des produits par leur nom. Utilisez l'onglet de recherche par nom et vous pourrez même appliquer des filtres avancés, comme la recherche par ingrédients inclus ou exclus (par exemple: rechercher des produits SANS gluten ou AVEC du céleri)."
        },
        {
          id: "unrecognized-product",
          question: "Que faire si un produit n'est pas reconnu ?",
          answer: "Si un produit n'est pas reconnu, vous pouvez l'ajouter à notre base de données en fournissant ses informations de base. Vous contribuerez ainsi à enrichir FYDO pour toute la communauté. Cette fonctionnalité nécessite un compte utilisateur vérifié."
        }
      ]
    },
    reviews: {
      icon: <Star className="text-green-600" />,
      title: "Avis et évaluations",
      questions: [
        {
          id: "leave-review",
          question: "Comment puis-je laisser un avis sur un produit ?",
          answer: "Pour laisser un avis, recherchez d'abord le produit concerné, puis cliquez sur le bouton 'Donner mon avis'. Vous pourrez attribuer des notes sur différents critères (goût, quantité, rapport qualité/prix) et laisser un commentaire. Pour renforcer la fiabilité, vous devrez télécharger une photo de votre ticket de caisse prouvant votre achat."
        },
        {
          id: "review-frequency",
          question: "Combien d'avis puis-je publier ?",
          answer: "Vous pouvez publier un avis par produit et par mois. Cette limitation vise à garantir la qualité et la pertinence des avis. Si vous souhaitez mettre à jour votre avis sur un produit, vous devrez attendre la fin du mois en cours."
        },
        {
          id: "verified-reviews",
          question: "Qu'est-ce qu'un 'avis vérifié' ?",
          answer: "Un 'avis vérifié' signifie que l'utilisateur a fourni une preuve d'achat (ticket de caisse) qui a été validée par notre système. Ces avis sont considérés comme plus fiables car ils proviennent de personnes ayant réellement acheté et utilisé le produit. Les avis vérifiés sont identifiés par un badge spécial."
        },
        {
          id: "receipt-sharing",
          question: "Qui peut voir mon ticket de caisse ?",
          answer: "Par défaut, votre ticket de caisse est utilisé uniquement pour vérifier votre achat et n'est pas partagé publiquement. Vous pouvez toutefois autoriser le partage de votre ticket (anonymisé) avec la communauté pour renforcer la crédibilité de votre avis. Dans tous les cas, vos informations personnelles sont protégées."
        }
      ]
    },
    account: {
      icon: <User className="text-green-600" />,
      title: "Compte et profil",
      questions: [
        {
          id: "create-account",
          question: "Comment créer un compte FYDO ?",
          answer: "Pour créer un compte, cliquez sur 'Inscription' dans le menu principal. Vous devrez fournir une adresse e-mail valide et créer un mot de passe. Vous pouvez également vous inscrire via votre compte Google ou Facebook pour plus de simplicité. Une fois inscrit, vous pourrez personnaliser votre profil et accéder à toutes les fonctionnalités de FYDO."
        },
        {
          id: "account-benefits",
          question: "Quels sont les avantages d'avoir un compte ?",
          answer: "Avoir un compte vous permet de publier des avis, de sauvegarder vos produits favoris, de consulter votre historique de recherche, de recevoir des recommandations personnalisées et d'accéder à des fonctionnalités exclusives selon votre abonnement. De plus, vos paramètres et préférences sont sauvegardés entre les sessions."
        },
        {
          id: "delete-account",
          question: "Comment supprimer mon compte ?",
          answer: "Pour supprimer votre compte, accédez à votre profil, puis aux paramètres du compte, et sélectionnez 'Supprimer mon compte'. Vous devrez confirmer cette action qui est irréversible. Toutes vos données personnelles seront supprimées conformément à notre politique de confidentialité, mais vos avis anonymisés pourront être conservés."
        },
        {
          id: "history-favorites",
          question: "Comment gérer mon historique et mes favoris ?",
          answer: "Vous pouvez accéder à votre historique de recherche et à vos produits favoris depuis votre profil utilisateur. L'historique vous permet de retrouver facilement les produits consultés précédemment. Pour ajouter un produit à vos favoris, cliquez simplement sur l'icône en forme d'étoile sur la page du produit. Notez que la fonctionnalité de favoris peut nécessiter un abonnement selon votre formule."
        }
      ]
    },
    subscription: {
      icon: <CreditCard className="text-green-600" />,
      title: "Abonnements et paiement",
      questions: [
        {
          id: "subscription-plans",
          question: "Quels sont les différents plans d'abonnement ?",
          answer: "FYDO propose plusieurs formules d'abonnement : Gratuit (fonctionnalités de base), Essential (notre offre la plus populaire avec un nombre accru de scans et la possibilité d'ajouter des favoris), et Premium (accès illimité à toutes les fonctionnalités). Vous pouvez consulter le détail des offres et leurs tarifs dans la section 'Abonnements' de l'application."
        },
        {
          id: "change-subscription",
          question: "Comment changer ou annuler mon abonnement ?",
          answer: "Pour modifier ou annuler votre abonnement, accédez à votre profil, puis à 'Mon abonnement'. Vous pourrez y gérer vos options d'abonnement, passer à une formule supérieure ou inférieure, ou annuler le renouvellement automatique. L'annulation prendra effet à la fin de la période en cours, et vous conserverez l'accès aux fonctionnalités premium jusqu'à cette date."
        },
        {
          id: "payment-methods",
          question: "Quels moyens de paiement sont acceptés ?",
          answer: "FYDO accepte les cartes de crédit/débit (Visa, Mastercard, American Express), ainsi que les paiements via Apple Pay et Google Pay. Toutes les transactions sont sécurisées et vos informations de paiement ne sont jamais stockées sur nos serveurs."
        },
        {
          id: "refund-policy",
          question: "Quelle est la politique de remboursement ?",
          answer: "FYDO offre une garantie satisfait ou remboursé de 14 jours. Si vous n'êtes pas satisfait de votre abonnement premium, vous pouvez demander un remboursement dans les 14 jours suivant votre souscription. Pour ce faire, contactez notre support client à support@fydo.app en expliquant votre situation."
        }
      ]
    },
    data: {
      icon: <ShoppingBag className="text-green-600" />,
      title: "Données et confidentialité",
      questions: [
        {
          id: "data-sources",
          question: "D'où proviennent les données sur les produits ?",
          answer: "Les données proviennent principalement de la base OpenFoodFacts, que nous enrichissons avec les contributions de notre communauté. Pour les informations nutritionnelles et environnementales, nous utilisons des sources officielles comme les étiquettes des produits et les bases de données Nutri-Score et Eco-Score. Les avis sont générés exclusivement par notre communauté d'utilisateurs."
        },
        {
          id: "data-update",
          question: "À quelle fréquence les données sont-elles mises à jour ?",
          answer: "Les données de base sont synchronisées quotidiennement avec OpenFoodFacts. Les informations spécifiques à FYDO (avis, notes, prix moyens) sont mises à jour en temps réel. Si vous constatez une information erronée, vous pouvez la signaler via l'option 'Signaler une erreur' sur la page du produit."
        },
        {
          id: "data-privacy",
          question: "Comment mes données personnelles sont-elles protégées ?",
          answer: "FYDO respecte strictement le RGPD et autres réglementations sur la protection des données. Vos informations personnelles sont chiffrées et ne sont jamais partagées avec des tiers sans votre consentement explicite. Les tickets de caisse que vous téléchargez sont anonymisés automatiquement avant tout traitement. Pour plus de détails, consultez notre politique de confidentialité."
        },
        {
          id: "location-data",
          question: "Pourquoi l'application demande-t-elle l'accès à ma localisation ?",
          answer: "L'accès à votre localisation est optionnel et sert uniquement à enrichir les avis que vous laissez. Cela permet aux autres utilisateurs de savoir dans quelle région un produit a été acheté, ce qui peut être utile car la composition de certains produits varie selon les pays ou régions. Vous pouvez désactiver cette fonctionnalité à tout moment dans les paramètres."
        }
      ]
    }
  };

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-4">Foire Aux Questions</h2>
        <p className="text-center text-green-700 mb-12 max-w-2xl mx-auto">
          Trouvez des réponses aux questions les plus fréquemment posées sur FYDO et son fonctionnement
        </p>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            {/* Navigation des catégories */}
            <div className="flex flex-wrap bg-green-100 overflow-x-auto">
              {Object.keys(faqData).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center px-4 py-3 text-sm md:text-base transition-colors whitespace-nowrap ${
                    openCategory === category 
                      ? 'bg-white text-green-700 font-medium border-t-2 border-green-600' 
                      : 'text-green-800 hover:bg-green-50'
                  }`}
                >
                  <span className="mr-2">{faqData[category].icon}</span>
                  <span>{faqData[category].title}</span>
                </button>
              ))}
            </div>
            
            {/* Contenu des FAQs */}
            <div className="p-6">
              {Object.keys(faqData).map((category) => (
                <div 
                  key={category} 
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    openCategory === category ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 hidden'
                  }`}
                >
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    {faqData[category].icon}
                    <span className="ml-2">{faqData[category].title}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {faqData[category].questions.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(item.id)}
                          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                        >
                          <span className="font-medium text-gray-800">{item.question}</span>
                          <ChevronDown 
                            className={`text-green-600 transition-transform ${
                              openQuestions[item.id] ? 'transform rotate-180' : ''
                            }`} 
                            size={18}
                          />
                        </button>
                        <div 
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            openQuestions[item.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="p-4 bg-white">
                            <p className="text-gray-700">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Assistance supplémentaire */}
          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-4">Vous n'avez pas trouvé votre réponse ?</p>
            <a 
              href="mailto:support@fydo.app" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
            >
              Contacter notre support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;