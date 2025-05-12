// src/components/Contact.js
import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, AlertCircle, CheckCircle, HelpCircle, Clock, Facebook, Twitter, Instagram, Linkedin, GitHub } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Contact = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'support'
  });
  
  const [formStatus, setFormStatus] = useState({
    status: null, // 'success', 'error', or null
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ status: null, message: '' });
    
    // Ici normalement on enverrait les données à un backend
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
        category: 'support'
      });
    }, 1500);
  };
  
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Contact | Fydo</title>
        <meta name="description" content="Contactez l'équipe Fydo pour toute question, suggestion ou demande d'assistance" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Contactez-nous</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <p className="text-gray-700">
                Vous avez une question, une suggestion ou vous avez besoin d'aide avec Fydo ? Notre équipe est là pour vous. N'hésitez pas à nous contacter par l'un des moyens ci-dessous ou en utilisant le formulaire de contact.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Informations de contact */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-1">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                  <MessageCircle className="mr-2" size={22} />
                  Nos coordonnées
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Mail className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Phone className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p>+33 (0)1 23 45 67 89</p>
                      <p className="text-sm text-gray-500">Du lundi au vendredi, 9h-18h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p>FYDO SAS</p>
                      <p>123 Avenue des Innovations</p>
                      <p>75000 Paris, France</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Clock className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Délai de réponse</h3>
                      <p>Nous nous efforçons de répondre à toutes les demandes sous 48 heures ouvrées.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium text-green-700 mb-3">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                      <Facebook size={20} />
                    </a>
                    <a href="https://twitter.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                      <Twitter size={20} />
                    </a>
                    <a href="https://instagram.com/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                      <Instagram size={20} />
                    </a>
                    <a href="https://linkedin.com/company/fydoapp" target="_blank" rel="noopener noreferrer" className="bg-green-100 p-2 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Formulaire de contact */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-2">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                  <Send className="mr-2" size={22} />
                  Formulaire de contact
                </h2>
                
                {formStatus.status === 'success' ? (
                  <div className="bg-green-50 p-4 rounded-md mb-6 flex items-start">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-1" size={18} />
                    <p className="text-green-700">{formStatus.message}</p>
                  </div>
                ) : formStatus.status === 'error' ? (
                  <div className="bg-red-50 p-4 rounded-md mb-6 flex items-start">
                    <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-1" size={18} />
                    <p className="text-red-700">{formStatus.message}</p>
                  </div>
                ) : null}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Jean Dupont"
                        required
                        value={formState.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="votre@email.fr"
                        required
                        value={formState.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Sujet de votre message"
                        required
                        value={formState.subject}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <select
                        id="category"
                        name="category"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                      required
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                      J'accepte que les informations saisies soient utilisées pour traiter ma demande conformément à la <a href="/politique-confidentialite" className="text-green-600 hover:underline">Politique de Confidentialité</a>.
                    </label>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          
          {/* Section FAQ */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <HelpCircle className="mr-2" size={22} />
                Questions fréquentes
              </h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-green-600">Comment modifier mon abonnement ?</h3>
                  <p className="text-gray-700 mt-1">
                    Vous pouvez modifier votre abonnement à tout moment depuis la section "Mon Abonnement" de votre profil. Les changements prendront effet à la prochaine date de facturation.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-green-600">Comment supprimer un avis que j'ai publié ?</h3>
                  <p className="text-gray-700 mt-1">
                    Rendez-vous dans la section "Mes Avis" de votre profil, localisez l'avis que vous souhaitez supprimer et cliquez sur l'icône de corbeille. La suppression est immédiate et définitive.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-green-600">Comment contester la modération d'un avis ?</h3>
                  <p className="text-gray-700 mt-1">
                    Si l'un de vos avis a été refusé par notre équipe de modération, vous recevrez une notification avec le motif. Pour contester cette décision, utilisez le formulaire de contact ci-dessus en sélectionnant la catégorie "Support technique".
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-green-600">Quels formats de tickets de caisse sont acceptés ?</h3>
                  <p className="text-gray-700 mt-1">
                    Nous acceptons les photos de tickets de caisse au format JPG ou PNG, avec une taille maximale de 5 MB. Assurez-vous que le nom du produit, la date d'achat et le nom du magasin sont clairement visibles sur l'image.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-green-600">Un produit manque dans la base de données, que faire ?</h3>
                  <p className="text-gray-700 mt-1">
                    Si vous ne trouvez pas un produit dans notre base de données, vous pouvez nous le signaler via le formulaire de contact en sélectionnant la catégorie "Suggestion ou feedback". N'oubliez pas d'inclure le code-barres du produit dans votre message.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a href="/faq" className="inline-block text-green-600 hover:text-green-700 hover:underline">
                  Voir toutes les questions fréquentes →
                </a>
              </div>
            </div>
          </div>
          
          {/* Carte */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <MapPin className="mr-2" size={22} />
                Nos bureaux
              </h2>
              
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937604!2d2.292292615472316!3d48.85836507928686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1651571621947!5m2!1sfr!2sfr" 
                  width="100%" 
                  height="400" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte des bureaux Fydo"
                  className="rounded-lg"
                ></iframe>
              </div>
              
              <div className="mt-4 text-gray-700">
                <p className="text-sm">
                  Nos bureaux sont ouverts du lundi au vendredi de 9h à 18h. Merci de prendre rendez-vous avant de vous déplacer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;