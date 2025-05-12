// src/components/LegalNotice.js
import React from 'react';
import { Mail, Map, Phone, Clock, Shield, FileText, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet';

const LegalNotice = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Mentions Légales | Fydo</title>
        <meta name="description" content="Mentions légales de Fydo - Plateforme de recherche et d'avis vérifiés sur les produits" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Mentions Légales</h1>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <FileText className="mr-2" size={22} />
                Édition du site
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Le présent site <strong>www.fydo.fr</strong> est édité par :
                </p>
                
                <div className="pl-4 border-l-2 border-green-100">
                  <p><strong>FYDO SAS</strong></p>
                  <p>Société par actions simplifiée au capital de 10 000 €</p>
                  <p>Immatriculée au RCS de Paris sous le numéro SIRET : 123 456 789 00012</p>
                  <p>Code APE : 6201Z - Programmation informatique</p>
                  <p>TVA Intracommunautaire : FR 12 123456789</p>
                  <p>Siège social : 123 Avenue des Innovations, 75000 Paris</p>
                </div>
                
                <p>
                  <strong>Directeur de la publication :</strong> Jean Dupont, Président de FYDO SAS
                </p>
                
                <div className="flex items-center mt-2">
                  <Mail size={18} className="text-green-600 mr-2" />
                  <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Map className="mr-2" size={22} />
                Hébergement
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Le site www.fydo.fr est hébergé par :
                </p>
                
                <div className="pl-4 border-l-2 border-green-100">
                  <p><strong>Vercel Inc.</strong></p>
                  <p>340 S Lemon Ave #4133</p>
                  <p>Walnut, CA 91789</p>
                  <p>États-Unis</p>
                  <p><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">https://vercel.com</a></p>
                </div>
                
                <p>
                  Les bases de données sont hébergées par :
                </p>
                
                <div className="pl-4 border-l-2 border-green-100">
                  <p><strong>Supabase</strong></p>
                  <p>Infrastructure hébergée sur Amazon Web Services (AWS) dans la région eu-west-3 (Paris, France)</p>
                  <p><a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">https://supabase.com</a></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <BookOpen className="mr-2" size={22} />
                Propriété intellectuelle
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  L'ensemble du site www.fydo.fr, y compris sa structure, son design, ses textes, ses images, ses logos, et autres éléments constitutifs, est la propriété exclusive de FYDO SAS ou fait l'objet d'une autorisation d'utilisation. 
                </p>
                
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de FYDO SAS.
                </p>
                
                <p>
                  Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                </p>
                
                <p>
                  Les marques et logos présents sur le site sont des marques déposées par FYDO SAS ou par des tiers. Toute reproduction, usage ou apposition de ces marques sans autorisation préalable et écrite de leurs titulaires respectifs constitue un acte de contrefaçon.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Shield className="mr-2" size={22} />
                Protection des données personnelles
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  FYDO SAS s'engage à respecter la confidentialité des données personnelles communiquées par les utilisateurs du site internet et à les traiter dans le respect du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l'égard du traitement des données à caractère personnel et à la libre circulation de ces données (RGPD) et de la Loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, modifiée.
                </p>
                
                <p>
                  Les informations recueillies font l'objet d'un traitement informatique destiné à :
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gérer les comptes utilisateurs et les abonnements</li>
                  <li>Traiter les avis et évaluations de produits</li>
                  <li>Améliorer l'expérience utilisateur et les fonctionnalités du service</li>
                  <li>Assurer la sécurité du site et prévenir la fraude</li>
                </ul>
                
                <p className="mt-4">
                  <strong>Responsable du traitement :</strong> FYDO SAS, représentée par Jean Dupont, joignable à l'adresse électronique suivante : <a href="mailto:dpo@fydo.fr" className="text-green-600 hover:underline">dpo@fydo.fr</a>
                </p>
                
                <p>
                  Conformément à la réglementation en vigueur, vous disposez des droits suivants sur vos données :
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Droit d'accès</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition</li>
                </ul>
                
                <p className="mt-4">
                  Pour exercer ces droits ou pour toute question relative au traitement de vos données, vous pouvez contacter notre Délégué à la Protection des Données à l'adresse suivante : <a href="mailto:dpo@fydo.fr" className="text-green-600 hover:underline">dpo@fydo.fr</a>
                </p>
                
                <p>
                  Si vous estimez, après nous avoir contactés, que vos droits « Informatique et Libertés » ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL.
                </p>
                
                <p>
                  Pour plus d'informations sur la façon dont nous traitons vos données, veuillez consulter notre <a href="/politique-confidentialite" className="text-green-600 hover:underline">Politique de Confidentialité</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Clock className="mr-2" size={22} />
                Cookies
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Le site www.fydo.fr peut être amené à utiliser des cookies. Un cookie est un petit fichier d'information envoyé sur votre navigateur et enregistré au sein de votre terminal (ordinateur, smartphone, etc.). Les cookies utilisés sur notre site ont pour finalité de :
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Permettre la navigation sur notre site et l'utilisation de ses fonctionnalités</li>
                  <li>Mesurer l'audience du site et comprendre comment les visiteurs utilisent le site</li>
                  <li>Personnaliser votre expérience et vous fournir des contenus adaptés à vos intérêts</li>
                </ul>
                
                <p className="mt-4">
                  Vous pouvez à tout moment paramétrer votre navigateur pour refuser l'utilisation de cookies ou être alerté lorsqu'un cookie est envoyé sur votre terminal.
                </p>
                
                <p>
                  Pour plus d'informations sur les cookies et leur gestion, veuillez consulter notre <a href="/politique-cookies" className="text-green-600 hover:underline">Politique de Cookies</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Phone className="mr-2" size={22} />
                Contact et réclamations
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Pour toute question, demande d'information ou réclamation, l'utilisateur peut contacter FYDO SAS :
                </p>
                
                <ul className="list-none space-y-3 pl-1">
                  <li className="flex items-center">
                    <Mail size={18} className="text-green-600 mr-3" />
                    <span>Par email : <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a></span>
                  </li>
                  <li className="flex items-center">
                    <Map size={18} className="text-green-600 mr-3" />
                    <span>Par courrier : FYDO SAS - 123 Avenue des Innovations, 75000 Paris</span>
                  </li>
                  <li className="flex items-center">
                    <Phone size={18} className="text-green-600 mr-3" />
                    <span>Par téléphone : 01 23 45 67 89 (du lundi au vendredi, de 9h à 18h)</span>
                  </li>
                </ul>
                
                <p className="mt-4">
                  En cas de non-réponse ou de réponse insatisfaisante dans un délai de 30 jours, l'utilisateur peut saisir le médiateur de la consommation :
                </p>
                
                <div className="pl-4 border-l-2 border-green-100 mt-2">
                  <p><strong>Médiation de la consommation</strong></p>
                  <p>Centre de Médiation et d'Arbitrage de Paris (CMAP)</p>
                  <p>39 avenue Franklin Roosevelt, 75008 Paris</p>
                  <p><a href="https://www.cmap.fr" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">www.cmap.fr</a></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Dernière mise à jour : 12 mai 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;