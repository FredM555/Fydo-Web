// src/components/PrivacyPolicy.js
import React from 'react';
import { Shield, Database, Eye, Server, Lock, FileText, AlertCircle, Camera, Cpu, User, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Politique de Confidentialité | Fydo</title>
        <meta name="description" content="Politique de confidentialité de Fydo - Comment nous protégeons vos données personnelles" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Politique de Confidentialité</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Shield className="mr-2" size={22} />
                Introduction
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Bienvenue sur Fydo, l'application qui vous permet de scanner, découvrir et partager des avis vérifiés sur vos produits alimentaires et cosmétiques. La protection de vos données personnelles est notre priorité.
                </p>
                
                <p>
                  Cette politique de confidentialité décrit les informations que nous collectons, comment nous les utilisons, les partageons et les protégeons. Veuillez la lire attentivement pour comprendre nos pratiques concernant vos données personnelles.
                </p>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="font-medium text-green-800">Fydo SAS</p>
                  <p className="text-sm">
                    Responsable du traitement des données personnelles<br />
                    123 Avenue des Innovations, 75000 Paris<br />
                    <a href="mailto:dpo@fydo.fr" className="text-green-600 hover:underline">dpo@fydo.fr</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Données collectées */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Database className="mr-2" size={22} />
                Informations que nous collectons
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Données de compte et profil</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Informations d'identification (adresse email, mot de passe sécurisé)</li>
                  <li>Nom d'utilisateur, photo de profil (facultatifs)</li>
                  <li>Statut utilisateur et niveau (bronze, argent, or, diamant)</li>
                  <li>Historique des connexions</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Données d'utilisation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Historique de recherche et de scan de produits</li>
                  <li>Produits ajoutés aux favoris</li>
                  <li>Nombre de scans, de recherches manuelles et par nom</li>
                  <li>Interactions avec l'application (pages consultées, fonctionnalités utilisées)</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Contenu généré par l'utilisateur</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Avis et évaluations publiés sur les produits</li>
                  <li>Photos de tickets de caisse téléchargées comme preuve d'achat</li>
                  <li>Retours et commentaires sur d'autres avis</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Données d'abonnement et de paiement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Type d'abonnement (Gratuit, Essential, Premium)</li>
                  <li>Historique des paiements et transactions</li>
                  <li>Date de début et fin d'abonnement</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Informations techniques</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Type d'appareil et système d'exploitation</li>
                  <li>Adresse IP et identifiants uniques</li>
                  <li>Données de connexion et journaux d'activité</li>
                  <li>Informations sur la session et le navigateur</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Données de localisation</h3>
                <p>
                  Si vous y consentez, nous pouvons collecter votre position géographique pour améliorer les résultats de recherche, enrichir les avis et vous proposer des produits disponibles près de chez vous.
                </p>
              </div>
            </div>
          </div>
          
          {/* Utilisation des données */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Eye className="mr-2" size={22} />
                Comment nous utilisons vos données
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Service et fonctionnalités</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Créer et gérer votre compte Fydo</li>
                  <li>Traiter vos scans de codes-barres et recherches</li>
                  <li>Gérer vos favoris et votre historique de produits</li>
                  <li>Vous permettre de publier et consulter des avis</li>
                  <li>Adapter les fonctionnalités selon votre type d'abonnement</li>
                  <li>Suivre vos quotas d'utilisation (scans, recherches, etc.)</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Vérification des avis</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyser les tickets de caisse pour confirmer l'achat du produit</li>
                  <li>Extraire des informations pertinentes (date d'achat, magasin, prix)</li>
                  <li>Valider l'authenticité des avis pour maintenir la confiance de la communauté</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Gestion des abonnements</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Traiter vos paiements et abonnements</li>
                  <li>Gérer les renouvellements et modifications de forfait</li>
                  <li>Appliquer les limitations correspondant à votre niveau d'abonnement</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Amélioration et personnalisation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyser l'utilisation de l'application pour l'améliorer</li>
                  <li>Personnaliser votre expérience utilisateur</li>
                  <li>Développer de nouvelles fonctionnalités</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Communication</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous envoyer des notifications sur vos avis et activités</li>
                  <li>Vous informer des mises à jour importantes</li>
                  <li>Répondre à vos demandes d'assistance</li>
                </ul>
                
                <p className="mt-4 bg-yellow-50 p-3 rounded-md">
                  <span className="flex items-center text-yellow-700 font-medium mb-1">
                    <AlertCircle size={16} className="mr-1" />
                    Base légale du traitement
                  </span>
                  <span className="text-sm text-yellow-700">
                    Nous traitons vos données sur la base de l'exécution du contrat (fourniture du service Fydo), votre consentement explicite (pour certaines fonctionnalités comme la géolocalisation), et notre intérêt légitime (amélioration de nos services et sécurité).
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Technologies utilisées */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Server className="mr-2" size={22} />
                Technologies et services tiers
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Firebase</h3>
                <p>
                  Nous utilisons Firebase (Google) pour l'authentification des utilisateurs, le stockage des images (tickets de caisse) et les analyses d'utilisation. Les données stockées sur Firebase sont soumises à la <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">politique de confidentialité de Firebase</a>.
                </p>
                
                <h3 className="font-medium text-green-600">Supabase</h3>
                <p>
                  Nous utilisons Supabase pour stocker les données structurées comme les profils utilisateurs, les avis, les favoris et les abonnements. Supabase est hébergé sur AWS (région eu-west-3, Paris) et est conforme au RGPD. Pour plus d'informations, consultez la <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">politique de confidentialité de Supabase</a>.
                </p>
                
                <h3 className="font-medium text-green-600">Claude AI (Anthropic)</h3>
                <p>
                  Nous utilisons Claude AI pour l'analyse des tickets de caisse et l'extraction d'informations pertinentes. Les images sont transmises à Claude AI uniquement pour traitement immédiat et ne sont pas conservées par ce service après analyse. Pour plus d'informations, consultez la <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">politique de confidentialité d'Anthropic</a>.
                </p>
                
                <h3 className="font-medium text-green-600">OpenFoodFacts</h3>
                <p>
                  Pour les informations sur les produits, nous utilisons l'API publique d'OpenFoodFacts. Seules les requêtes de recherche sont transmises, sans aucune donnée personnelle.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-md mt-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note sur les transferts internationaux de données :</strong> Certains de nos prestataires peuvent stocker ou traiter vos données en dehors de l'Union européenne. Dans ces cas, nous nous assurons que des garanties appropriées sont en place pour protéger vos données, comme des clauses contractuelles types approuvées par la Commission européenne.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partage des données */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <User className="mr-2" size={22} />
                Partage de vos données
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Avec d'autres utilisateurs</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Votre nom d'utilisateur et photo de profil sont visibles par les autres utilisateurs</li>
                  <li>Les avis et évaluations que vous publiez sont visibles par la communauté</li>
                  <li>Les tickets de caisse ne sont partagés que si vous cochez explicitement l'option "J'autorise le partage anonymisé de mon ticket de caisse"</li>
                  <li>Votre statut (bronze, argent, or, diamant) peut être visible sur votre profil public</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Avec nos prestataires de services</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Services d'hébergement et de stockage (Firebase, Supabase)</li>
                  <li>Analyse d'image et traitement IA (Claude AI)</li>
                  <li>Traitement des paiements et gestion des abonnements</li>
                  <li>Services d'analyse et de statistiques</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Autres cas de partage</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>En cas d'obligation légale ou réglementaire</li>
                  <li>Pour protéger les droits, la propriété ou la sécurité de Fydo, nos utilisateurs ou le public</li>
                  <li>Dans le cadre d'une transaction commerciale (fusion, acquisition, vente d'actifs) avec engagement de respecter cette politique</li>
                  <li>Avec votre consentement explicite</li>
                </ul>
                
                <p className="mt-4 italic text-sm">
                  Nous ne vendons jamais vos données personnelles à des tiers à des fins publicitaires ou commerciales.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sécurité */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Lock className="mr-2" size={22} />
                Sécurité des données
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte, l'accès non autorisé, la divulgation, l'altération ou la destruction, notamment :
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Chiffrement des données sensibles et mots de passe</li>
                  <li>Authentification à deux facteurs pour les comptes administrateurs</li>
                  <li>Contrôles d'accès stricts et audits réguliers</li>
                  <li>Surveillance continue des systèmes pour détecter les vulnérabilités</li>
                  <li>Formation de notre personnel aux bonnes pratiques de sécurité</li>
                  <li>Anonymisation des tickets de caisse après analyse</li>
                </ul>
                
                <p>
                  Malgré nos efforts, aucun système de sécurité n'est infaillible. En cas de violation de données susceptible de vous porter préjudice, nous vous en informerons dans les délais prévus par la loi.
                </p>
              </div>
            </div>
          </div>
          
          {/* Conservation des données */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Cpu className="mr-2" size={22} />
                Conservation des données
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, sauf obligation légale de conservation plus longue.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 mt-3">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de données</th>
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée de conservation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 px-4">Données du compte et profil</td>
                        <td className="py-2 px-4">Durée de l'existence du compte + 3 mois après suppression</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Avis et évaluations</td>
                        <td className="py-2 px-4">5 ans après publication (sauf demande de suppression)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Images de tickets de caisse</td>
                        <td className="py-2 px-4">1 an après téléchargement</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Historique de scan et recherche</td>
                        <td className="py-2 px-4">1 an après la dernière utilisation de l'application</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Données de paiement et abonnement</td>
                        <td className="py-2 px-4">10 ans (obligations légales comptables)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Logs et données techniques</td>
                        <td className="py-2 px-4">1 an maximum</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="mt-4">
                  À l'issue de ces périodes, les données sont soit supprimées, soit anonymisées de manière irréversible.
                </p>
              </div>
            </div>
          </div>
          
          {/* Vos droits */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <FileText className="mr-2" size={22} />
                Vos droits
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données personnelles :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit d'accès</p>
                    <p className="text-sm">Vous pouvez obtenir une copie des données personnelles que nous détenons à votre sujet.</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit de rectification</p>
                    <p className="text-sm">Vous pouvez demander la correction des données inexactes ou incomplètes.</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit à l'effacement</p>
                    <p className="text-sm">Vous pouvez demander la suppression de vos données dans certaines circonstances.</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit à la limitation</p>
                    <p className="text-sm">Vous pouvez demander la limitation du traitement de vos données.</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit à la portabilité</p>
                    <p className="text-sm">Vous pouvez obtenir vos données dans un format structuré et lisible par machine.</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-700">Droit d'opposition</p>
                    <p className="text-sm">Vous pouvez vous opposer au traitement de vos données dans certaines situations.</p>
                  </div>
                </div>
                
                <h3 className="font-medium text-green-600 mt-4">Comment exercer vos droits</h3>
                <p>
                  Pour exercer l'un de ces droits, vous pouvez nous contacter par email à <a href="mailto:dpo@fydo.fr" className="text-green-600 hover:underline">dpo@fydo.fr</a> ou par courrier à l'adresse : FYDO SAS - DPO, 123 Avenue des Innovations, 75000 Paris.
                </p>
                
                <p>
                  Nous nous efforcerons de répondre à votre demande dans un délai d'un mois. Ce délai peut être prolongé de deux mois supplémentaires si nécessaire, compte tenu de la complexité et du nombre de demandes.
                </p>
                
                <p>
                  Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (Commission Nationale de l'Informatique et des Libertés) via <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">www.cnil.fr</a>.
                </p>
              </div>
            </div>
          </div>
          
          {/* Modifications */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Zap className="mr-2" size={22} />
                Modifications de la politique de confidentialité
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Nous pouvons modifier cette politique de confidentialité périodiquement, notamment pour refléter des changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires. La version la plus récente sera toujours disponible sur notre site web et dans notre application.
                </p>
                
                <p>
                  En cas de modifications substantielles, nous vous en informerons par email ou via une notification dans l'application avant leur entrée en vigueur. Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la manière dont nous protégeons vos informations.
                </p>
                
                <p>
                  Si vous continuez à utiliser nos services après la publication ou l'envoi d'un avis concernant les modifications apportées à cette politique de confidentialité, cela signifie que vous acceptez la politique révisée.
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Camera className="mr-2" size={22} />
                Tickets de caisse et analyse d'image
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  L'une des caractéristiques distinctives de Fydo est la vérification des avis par ticket de caisse. Cette section explique comment nous traitons spécifiquement ces données.
                </p>
                
                <h3 className="font-medium text-green-600">Collecte et stockage</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Les images de tickets de caisse sont téléchargées volontairement par vous pour vérifier vos achats</li>
                  <li>Ces images sont stockées dans Firebase Storage de manière sécurisée</li>
                  <li>Nous conservons une référence à l'image dans notre base de données Supabase</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Analyse par IA</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nous utilisons Claude AI (Anthropic) pour analyser automatiquement les tickets de caisse</li>
                  <li>L'analyse extrait uniquement: la date d'achat, le nom du magasin et le prix du produit</li>
                  <li>L'image est envoyée à Claude AI uniquement pour traitement immédiat et n'est pas conservée par ce service</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Partage et anonymisation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Par défaut, vos tickets de caisse ne sont visibles que par vous et les modérateurs Fydo</li>
                  <li>Si vous cochez l'option "J'autorise le partage anonymisé de mon ticket de caisse", une version anonymisée (sans informations personnelles) peut être visible par d'autres utilisateurs</li>
                  <li>L'anonymisation supprime ou masque: nom, prénom, adresse, numéro de carte de fidélité, et autres identifiants personnels</li>
                </ul>
                
                <div className="bg-yellow-50 p-4 rounded-md mt-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Important :</strong> Avant de télécharger un ticket de caisse, assurez-vous que vous êtes à l'aise avec les informations qu'il contient. Vous pouvez masquer manuellement les informations sensibles avant le téléchargement.
                  </p>
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

export default PrivacyPolicy;