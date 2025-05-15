// src/components/Contact.js
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Star,
  ChevronRight,
  Users,
  Shield
} from 'lucide-react';

const Contact = () => {
  // États pour le formulaire
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'support',
    privacy: false
  });
  
  const [formStatus, setFormStatus] = useState({
    status: null, // 'success', 'error', or null
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les animations
  const [isVisible, setIsVisible] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
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
  
  // Gestion des changements d'entrée du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ status: null, message: '' });
    
    // Simulation d'une soumission pour la démo
    setTimeout(() => {
      setIsSubmitting(false);
      setFormStatus({
        status: 'success',
        message: 'Votre message a été envoyé avec succès. Notre équipe vous répondra dans les plus brefs délais.'
      });
      
      // Réinitialiser le formulaire
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'support',
        privacy: false
      });
    }, 1500);
  };
  
  // Gestion du clic sur une FAQ
  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };
  
  // Questions fréquentes
  const faqQuestions = [
    {
      id: 'subscription',
      question: "Comment modifier mon abonnement ?",
      answer: "Vous pouvez modifier votre abonnement à tout moment depuis la section \"Mon Abonnement\" de votre profil. Les changements prendront effet à la prochaine date de facturation."
    },
    {
      id: 'delete-review',
      question: "Comment supprimer un avis que j'ai publié ?",
      answer: "Rendez-vous dans la section \"Mes Avis\" de votre profil, localisez l'avis que vous souhaitez supprimer et cliquez sur l'icône de corbeille. La suppression est immédiate et définitive."
    },
    {
      id: 'moderation',
      question: "Comment contester la modération d'un avis ?",
      answer: "Si l'un de vos avis a été refusé par notre équipe de modération, vous recevrez une notification avec le motif. Pour contester cette décision, utilisez le formulaire de contact en sélectionnant la catégorie \"Support technique\"."
    },
    {
      id: 'receipts',
      question: "Quels formats de tickets de caisse sont acceptés ?",
      answer: "Nous acceptons les photos de tickets de caisse au format JPG ou PNG, avec une taille maximale de 5 MB. Assurez-vous que le nom du produit, la date d'achat et le nom du magasin sont clairement visibles sur l'image."
    },
    {
      id: 'missing-product',
      question: "Un produit manque dans la base de données, que faire ?",
      answer: "Si vous ne trouvez pas un produit dans notre base de données, vous pouvez nous le signaler via le formulaire de contact en sélectionnant la catégorie \"Suggestion ou feedback\". N'oubliez pas d'inclure le code-barres du produit dans votre message."
    }
  ];

  // Informations de contact
  const contactDetails = [
    {
      id: 'email',
      icon: <Mail className="text-green-600" size={20} />,
      title: 'Email',
      content: <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a>
    },
    {
      id: 'phone',
      icon: <Phone className="text-green-600" size={20} />,
      title: 'Téléphone',
      content: <>
        <p>+33 (0)1 23 45 67 89</p>
        <p className="text-sm text-gray-500">Du lundi au vendredi, 9h-18h</p>
      </>
    },
    {
      id: 'address',
      icon: <MapPin className="text-green-600" size={20} />,
      title: 'Adresse',
      content: <>
        <p>FYDO SAS</p>
        <p>123 Avenue des Innovations</p>
        <p>75000 Paris, France</p>
      </>
    },
    {
      id: 'response',
      icon: <Clock className="text-green-600" size={20} />,
      title: 'Délai de réponse',
      content: <p>Nous nous efforçons de répondre à toutes les demandes sous 48 heures ouvrées.</p>
    }
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-green-50 pt-20 pb-16 relative overflow-hidden">
      <Helmet>
        <title>Contact | Fydo</title>
        <meta name="description" content="Contactez l'équipe Fydo pour toute question, suggestion ou demande d'assistance" />
      </Helmet>
      
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-200 rounded-full opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* En-tête de page avec animation subtile */}
          <div className={`text-center mb-12 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl font-bold text-green-800 mb-4">Contactez-nous</h1>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre expérience Fydo
            </p>
          </div>
          
          {/* Bannière d'introduction */}
          <div className={`bg-white rounded-xl shadow-sm overflow-hidden mb-10 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-3/4 mb-6 md:mb-0">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Comment pouvons-nous vous aider ?
                  </h2>
                  <p className="text-green-700">
                    Vous avez une question, une suggestion ou vous avez besoin d'aide avec Fydo ? N'hésitez pas à nous contacter par l'un des moyens ci-dessous ou en utilisant le formulaire de contact.
                  </p>
                </div>
                <div className="w-full md:w-1/4 md:pl-8 flex justify-center">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={40} className="text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Informations de contact */}
            <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-green-800 flex items-center mb-6">
                    <Shield className="mr-2" size={20} />
                    Nos coordonnées
                  </h2>
                  
                  <div className="space-y-6 text-gray-700">
                    {contactDetails.map((detail, index) => (
                      <div 
                        key={detail.id}
                        className="flex items-start"
                        style={{ transitionDelay: `${400 + index * 100}ms` }}
                      >
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          {detail.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-green-800">{detail.title}</h3>
                          {detail.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-green-800 mb-3">Suivez-nous</h3>
                    <div className="flex space-x-3">
                      <a href="https://facebook.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                        <Facebook size={20} />
                      </a>
                      <a href="https://twitter.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                        <Twitter size={20} />
                      </a>
                      <a href="https://instagram.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                        <Instagram size={20} />
                      </a>
                      <a href="https://linkedin.com/company/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Formulaire de contact */}
            <div className={`md:col-span-2 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-green-800 flex items-center mb-6">
                    <Send className="mr-2" size={20} />
                    Formulaire de contact
                  </h2>
                  
                  {formStatus.status === 'success' ? (
                    <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-start border-l-4 border-green-600">
                      <CheckCircle className="text-green-600 mr-3 flex-shrink-0 mt-1" size={20} />
                      <p className="text-green-800">{formStatus.message}</p>
                    </div>
                  ) : formStatus.status === 'error' ? (
                    <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start border-l-4 border-red-600">
                      <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-1" size={20} />
                      <p className="text-red-800">{formStatus.message}</p>
                    </div>
                  ) : null}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-green-800 mb-1">Nom complet</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                          placeholder="Jean Dupont"
                          required
                          value={formState.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-green-800 mb-1">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                          placeholder="votre@email.fr"
                          required
                          value={formState.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-green-800 mb-1">Sujet</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                          placeholder="Sujet de votre message"
                          required
                          value={formState.subject}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-green-800 mb-1">Catégorie</label>
                        <div className="relative">
                          <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                            value={formState.category}
                            onChange={handleInputChange}
                          >
                            <option value="support">Support technique</option>
                            <option value="feedback">Suggestion ou feedback</option>
                            <option value="business">Partenariat commercial</option>
                            <option value="subscription">Abonnement</option>
                            <option value="bug">Signaler un bug</option>
                            <option value="other">Autre demande</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronRight size={16} className="transform rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-green-800 mb-1">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        placeholder="Détaillez votre demande ici..."
                        required
                        value={formState.message}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    
                    <div className="flex items-start">
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-0.5"
                        required
                        checked={formState.privacy}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                        J'accepte que les informations saisies soient utilisées pour traiter ma demande conformément à la <a href="/politique-confidentialite" className="text-amber-600 hover:underline">Politique de Confidentialité</a>.
                      </label>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className={`w-full sm:w-auto px-8 py-3 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send size={18} className="mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section FAQ */}
          <div className={`mb-10 transition-all duration-700 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-green-800 flex items-center">
                    <HelpCircle className="mr-2" size={20} />
                    Questions fréquentes
                  </h2>
                  
                  <a href="/faq" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center">
                    Voir toutes les questions
                    <ChevronRight size={16} className="ml-1" />
                  </a>
                </div>
                
                <div className="space-y-3">
                  {faqQuestions.map((question, index) => (
                    <div 
                      key={question.id}
                      className={`bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-300 transform ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      } hover:shadow-md`}
                      style={{ transitionDelay: `${800 + index * 100}ms` }}
                    >
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none ${
                          activeQuestion === question.id ? 'bg-green-50' : ''
                        }`}
                        aria-expanded={activeQuestion === question.id}
                      >
                        <span className="font-medium text-green-800">{question.question}</span>
                        <ChevronRight 
                          className={`text-green-600 transition-transform duration-300 ${
                            activeQuestion === question.id ? 'transform rotate-90' : ''
                          }`} 
                          size={18}
                        />
                      </button>
                      
                      {/* Contenu de la réponse avec animation */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          activeQuestion === question.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-5 py-4 border-t border-gray-100 bg-green-50">
                          <p className="text-green-700">{question.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Carte et bannière finale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte */}
            <div className={`md:col-span-2 transition-all duration-700 delay-900 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-green-800 flex items-center mb-4">
                    <MapPin className="mr-2" size={20} />
                    Nos bureaux
                  </h2>
                  
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-3">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937604!2d2.292292615472316!3d48.85836507928686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1651571621947!5m2!1sfr!2sfr" 
                      width="100%" 
                      height="300" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Carte des bureaux Fydo"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  
                  <p className="text-green-700 text-sm">
                    Nos bureaux sont ouverts du lundi au vendredi de 9h à 18h. Merci de prendre rendez-vous avant de vous déplacer.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bannière rejoindre la communauté */}
            <div className={`transition-all duration-700 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl shadow-sm overflow-hidden h-full">
                <div className="p-6 text-white flex flex-col h-full">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Rejoignez-nous
                  </h2>
                  
                  <p className="text-green-50 mb-6 flex-grow">
                    Devenez membre de la communauté Fydo et partagez vos avis sur les produits que vous consommez au quotidien. Aidez d'autres utilisateurs à faire des choix éclairés.
                  </p>
                  
                  <div className="flex items-center justify-center bg-white bg-opacity-20 p-3 rounded-lg">
                    <Star size={24} className="text-amber-400 fill-amber-400 mr-2" />
                    <p className="text-white font-medium">Plus de 100 000 avis vérifiés</p>
                  </div>
                  
                  <div className="mt-6">
                    <a 
                      href="/signup" 
                      className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-center text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Créer un compte gratuitement
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;