// src/components/TermsOfService.js
import React from 'react';
import { FileText, User, Star, AlertCircle, CreditCard, Shield, Scale, Clock, Edit, Eye, Briefcase, Award } from 'lucide-react';
import { Helmet } from 'react-helmet';

const TermsOfService = () => {
  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Conditions d'Utilisation | Fydo</title>
        <meta name="description" content="Conditions d'utilisation de Fydo - Droits et obligations concernant l'usage de notre plateforme" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-6">Conditions Générales d'Utilisation</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <FileText className="mr-2" size={22} />
                Introduction et acceptation
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Bienvenue sur Fydo, la plateforme de référence pour scanner, découvrir et partager des avis vérifiés sur les produits alimentaires et cosmétiques. Les présentes Conditions Générales d'Utilisation (ci-après dénommées "CGU") établissent les règles régissant l'utilisation de notre service.
                </p>
                
                <p>
                  <span className="font-medium">IMPORTANT : </span> 
                  En créant un compte ou en utilisant notre application, vous reconnaissez avoir lu, compris et accepté l'ensemble des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-md mt-2">
                  <p className="text-sm text-blue-700">
                    Les présentes CGU constituent un contrat légalement contraignant entre vous, en tant qu'utilisateur, et FYDO SAS, société par actions simplifiée au capital de 10 000 €, immatriculée au RCS de Paris sous le numéro SIRET 123 456 789 00012, dont le siège social est situé 123 Avenue des Innovations, 75000 Paris.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description du service */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Eye className="mr-2" size={22} />
                Description du service
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Fydo est une application permettant aux utilisateurs d'accéder à des informations sur les produits alimentaires et cosmétiques via le scan de codes-barres ou la recherche par nom, de consulter et de publier des avis vérifiés, et de suivre leurs produits favoris.
                </p>
                
                <h3 className="font-medium text-green-600">Fonctionnalités principales</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Scan de codes-barres et recherche de produits</li>
                  <li>Accès aux informations détaillées sur les produits (composition, valeurs nutritionnelles, impact environnemental)</li>
                  <li>Consultation d'avis d'autres utilisateurs</li>
                  <li>Publication d'avis vérifiés par tickets de caisse</li>
                  <li>Enregistrement de produits favoris</li>
                  <li>Suivi de l'historique de recherche</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Formules d'abonnement</h3>
                <p>
                  Fydo propose plusieurs formules d'abonnement avec différents niveaux de fonctionnalités :
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 mt-2">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Formule</th>
                        <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Caractéristiques</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 px-3 font-medium">Gratuit</td>
                        <td className="py-2 px-3">Accès limité aux fonctionnalités de base, nombre restreint de scans et de recherches</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Essential</td>
                        <td className="py-2 px-3">Nombre plus élevé de scans et recherches, favoris illimités, filtre avancé</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Premium</td>
                        <td className="py-2 px-3">Accès illimité à toutes les fonctionnalités, priorité sur les nouvelles fonctionnalités</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="mt-3">
                  Le détail complet des fonctionnalités incluses dans chaque formule est disponible sur la page <a href="/abonnements" className="text-green-600 hover:underline">Abonnements</a> de notre application.
                </p>
              </div>
            </div>
          </div>
          
          {/* Création de compte */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <User className="mr-2" size={22} />
                Inscription et compte utilisateur
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Conditions d'inscription</h3>
                <p>
                  Pour créer un compte sur Fydo, vous devez :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Être âgé d'au moins 18 ans ou avoir l'autorisation d'un parent ou tuteur légal</li>
                  <li>Fournir des informations exactes, complètes et à jour</li>
                  <li>Accepter les présentes CGU et notre Politique de Confidentialité</li>
                  <li>Créer un mot de passe sécurisé et le garder confidentiel</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Responsabilité du compte</h3>
                <p>
                  Vous êtes responsable de toutes les activités qui se produisent sous votre compte. Vous vous engagez à :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ne pas partager vos identifiants de connexion</li>
                  <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                  <li>Vous déconnecter à la fin de chaque session sur des appareils partagés</li>
                  <li>Maintenir à jour vos informations de contact</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Statut utilisateur</h3>
                <p>
                  Fydo attribue des statuts à ses utilisateurs en fonction de leur activité et contribution :
                </p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-amber-50 p-3 rounded-md flex items-center">
                    <Award size={18} className="text-amber-600 mr-2" />
                    <div>
                      <p className="font-medium text-amber-800">Bronze</p>
                      <p className="text-xs text-amber-700">Statut initial de tous les utilisateurs</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md flex items-center">
                    <Award size={18} className="text-gray-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-700">Argent</p>
                      <p className="text-xs text-gray-600">Après 10 avis vérifiés</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-md flex items-center">
                    <Award size={18} className="text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">Or</p>
                      <p className="text-xs text-yellow-700">Après 50 avis vérifiés</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md flex items-center">
                    <Award size={18} className="text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-blue-800">Diamant</p>
                      <p className="text-xs text-blue-700">Après 100 avis vérifiés et 1 an d'ancienneté</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md mt-4">
                  <p className="flex items-start text-sm text-yellow-700">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>Fydo se réserve le droit de refuser l'inscription, de suspendre ou de résilier un compte à sa seule discrétion, notamment en cas de violation des présentes CGU.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Règles d'utilisation */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Shield className="mr-2" size={22} />
                Règles d'utilisation du service
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  En utilisant Fydo, vous vous engagez à respecter les règles suivantes :
                </p>
                
                <h3 className="font-medium text-green-600">Comportements interdits</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Publier des avis non authentiques ou trompeurs</li>
                  <li>Télécharger des tickets de caisse falsifiés ou qui ne vous appartiennent pas</li>
                  <li>Utiliser un langage offensant, diffamatoire, discriminatoire ou inapproprié</li>
                  <li>Usurper l'identité d'une autre personne ou entité</li>
                  <li>Tenter de contourner les limitations techniques ou les restrictions d'accès</li>
                  <li>Utiliser des robots, scrapers ou autres moyens automatisés pour accéder au service</li>
                  <li>Vendre, louer ou transférer votre compte ou vos droits d'accès</li>
                  <li>Utiliser l'application à des fins illégales ou non autorisées</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Publication d'avis</h3>
                <p>
                  Les avis publiés sur Fydo doivent :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Être basés sur votre expérience personnelle avec le produit</li>
                  <li>Être objectifs et honnêtes</li>
                  <li>Être vérifiables par ticket de caisse (preuve d'achat)</li>
                  <li>Respecter les droits de propriété intellectuelle des tiers</li>
                  <li>Respecter la vie privée des autres utilisateurs ou des tiers</li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-md mt-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Politique de modération : </span>
                    Fydo se réserve le droit de modérer, éditer ou supprimer tout avis ne respectant pas ces principes, contenant des propos illicites ou inappropriés, ou jugés non conformes à l'esprit de la plateforme. La modération est effectuée a posteriori sur signalement ou à l'initiative de Fydo.
                  </p>
                </div>
                
                <h3 className="font-medium text-green-600 mt-4">Limitations d'usage selon l'abonnement</h3>
                <p>
                  Votre abonnement détermine votre accès aux fonctionnalités et le nombre d'actions que vous pouvez effectuer :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Le nombre de scans de codes-barres par jour</li>
                  <li>Le nombre de recherches par nom de produit</li>
                  <li>L'accès aux filtres avancés de recherche</li>
                  <li>Le nombre de produits favoris que vous pouvez enregistrer</li>
                  <li>La consultation de l'historique de recherche</li>
                </ul>
                
                <p>
                  Le dépassement des limites associées à votre formule d'abonnement peut entraîner des restrictions temporaires d'accès à certaines fonctionnalités.
                </p>
              </div>
            </div>
          </div>
          
          {/* Contenu utilisateur */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Star className="mr-2" size={22} />
                Contenu généré par l'utilisateur
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Les avis, commentaires, photos de tickets de caisse et autres contenus que vous publiez sur Fydo sont considérés comme du "Contenu Utilisateur".
                </p>
                
                <h3 className="font-medium text-green-600">Propriété du contenu</h3>
                <p>
                  Vous conservez la propriété des droits que vous pouvez détenir sur votre Contenu Utilisateur, mais vous accordez à Fydo une licence mondiale, non exclusive, transférable, sous-licenciable, gratuite pour utiliser, reproduire, modifier, adapter, publier, traduire, créer des œuvres dérivées, distribuer et afficher ce contenu sur notre plateforme et dans nos communications.
                </p>
                
                <h3 className="font-medium text-green-600">Vérification des avis</h3>
                <p>
                  Pour garantir l'authenticité des avis, Fydo vérifie les achats via les tickets de caisse. En téléchargeant votre ticket, vous :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Confirmez être le propriétaire légitime du ticket de caisse</li>
                  <li>Acceptez qu'il soit analysé automatiquement pour extraire la date d'achat, le magasin et le prix</li>
                  <li>Comprenez que le ticket sera stocké de manière sécurisée selon notre Politique de Confidentialité</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Responsabilité du contenu</h3>
                <p>
                  Vous êtes entièrement responsable du Contenu Utilisateur que vous soumettez et des conséquences de sa publication. Vous garantissez que :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous possédez tous les droits nécessaires sur le contenu que vous publiez</li>
                  <li>Votre contenu n'enfreint pas les droits de tiers (droits d'auteur, marques, vie privée, etc.)</li>
                  <li>Votre contenu est exact et non trompeur</li>
                  <li>Votre contenu ne contient pas de virus, logiciels malveillants ou tout autre élément nuisible</li>
                </ul>
                
                <div className="bg-red-50 p-4 rounded-md mt-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Important : </span>
                    Fydo peut refuser ou retirer tout Contenu Utilisateur qui viole les présentes CGU ou qu'elle juge inapproprié, sans préavis ni justification. La décision de Fydo est définitive et sans recours.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abonnements et paiements */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <CreditCard className="mr-2" size={22} />
                Abonnements, paiements et facturation
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Offres d'abonnement</h3>
                <p>
                  Fydo propose différentes formules d'abonnement payantes, en plus de l'offre gratuite. Les tarifs, durées et fonctionnalités incluses sont indiqués sur la page Abonnements de l'application et peuvent être modifiés à tout moment.
                </p>
                
                <h3 className="font-medium text-green-600">Conditions de paiement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Les prix sont indiqués en euros et incluent la TVA applicable</li>
                  <li>Les paiements sont traités par des prestataires de services de paiement sécurisés</li>
                  <li>Les abonnements sont renouvelés automatiquement à la fin de chaque période, sauf résiliation</li>
                  <li>Vous autorisez Fydo à prélever le montant de votre abonnement selon la périodicité choisie</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Résiliation et remboursement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte</li>
                  <li>L'annulation prendra effet à la fin de la période en cours, sans remboursement au prorata</li>
                  <li>En cas d'annulation, vous conservez l'accès à votre abonnement jusqu'à la fin de la période payée</li>
                  <li>Conformément au droit de rétractation, vous disposez de 14 jours après la souscription pour demander un remboursement</li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-md mt-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Périodes d'essai : </span>
                    Fydo peut proposer des périodes d'essai gratuit. À l'issue de cette période, si vous ne résiliez pas votre abonnement, celui-ci sera automatiquement converti en abonnement payant. Une autorisation de paiement peut être demandée lors de l'inscription, mais aucun prélèvement ne sera effectué avant la fin de la période d'essai.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Propriété intellectuelle */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Briefcase className="mr-2" size={22} />
                Propriété intellectuelle
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  La plateforme Fydo, son contenu original, ses fonctionnalités et son design sont la propriété exclusive de FYDO SAS et sont protégés par les lois françaises et internationales sur la propriété intellectuelle.
                </p>
                
                <h3 className="font-medium text-green-600">Marques et logos</h3>
                <p>
                  Le nom "Fydo", le logo et toutes les marques associées sont des marques déposées appartenant à FYDO SAS. Aucune utilisation de ces marques n'est autorisée sans l'autorisation écrite préalable de FYDO SAS.
                </p>
                
                <h3 className="font-medium text-green-600">Données et informations</h3>
                <p>
                  Les informations sur les produits accessibles via notre service proviennent en partie de bases de données ouvertes comme OpenFoodFacts et d'autres sources publiques. Ces informations sont complétées et enrichies par les avis et contributions de nos utilisateurs. Fydo ne garantit pas l'exactitude, l'exhaustivité ou la pertinence de ces informations.
                </p>
                
                <h3 className="font-medium text-green-600">Licence d'utilisation</h3>
                <p>
                  Fydo vous accorde une licence limitée, non exclusive, non transférable et révocable pour accéder et utiliser notre service conformément aux présentes CGU, uniquement pour votre usage personnel et non commercial.
                </p>
                
                <div className="bg-red-50 p-4 rounded-md mt-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Interdictions : </span>
                    Sauf autorisation expresse de Fydo, il est strictement interdit de :
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-red-700 mt-1">
                    <li>Copier, modifier, adapter ou créer des œuvres dérivées du contenu de l'application</li>
                    <li>Utiliser des robots, scrapers ou autres moyens automatisés pour collecter des données</li>
                    <li>Effectuer de l'ingénierie inverse, décompiler ou désassembler tout ou partie de l'application</li>
                    <li>Utiliser les données de Fydo à des fins commerciales sans accord écrit préalable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Limitation de responsabilité */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Scale className="mr-2" size={22} />
                Limitation de responsabilité
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Informations sur les produits</h3>
                <p>
                  Bien que Fydo s'efforce de fournir des informations exactes et à jour sur les produits, nous ne pouvons garantir l'absence d'erreurs ou d'omissions. Les informations présentées proviennent de diverses sources, y compris de bases de données ouvertes et des contributions des utilisateurs.
                </p>
                <p>
                  Les utilisateurs doivent toujours vérifier les informations sur l'emballage du produit, notamment concernant les allergènes, les ingrédients et les valeurs nutritionnelles, avant consommation.
                </p>
                
                <h3 className="font-medium text-green-600">Disponibilité du service</h3>
                <p>
                  Fydo s'efforce de maintenir le service accessible et fonctionnel en permanence, mais ne peut garantir une disponibilité continue et sans interruption. Des maintenances programmées ou des dysfonctionnements techniques peuvent temporairement affecter l'accès ou le fonctionnement du service.
                </p>
                
                <h3 className="font-medium text-green-600">Exclusion de garanties</h3>
                <p>
                  Dans les limites autorisées par la loi, le service Fydo est fourni "tel quel" et "selon disponibilité", sans garantie d'aucune sorte, expresse ou implicite. Fydo décline notamment toute garantie concernant :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>L'adéquation du service à un usage particulier</li>
                  <li>L'exactitude, la fiabilité et l'exhaustivité des informations fournies</li>
                  <li>La capacité du service à répondre aux attentes ou besoins spécifiques des utilisateurs</li>
                  <li>L'absence d'erreurs, de bugs ou d'interruptions dans le fonctionnement du service</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Limitation de responsabilité</h3>
                <p>
                  Dans les limites autorisées par la loi applicable, Fydo ne saurait être tenue responsable des dommages directs, indirects, accessoires, spéciaux, consécutifs ou exemplaires, y compris notamment les pertes de profit, de clientèle, d'usage, de données ou autres pertes intangibles résultant de :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>L'utilisation ou l'impossibilité d'utiliser le service</li>
                  <li>Des erreurs dans les informations fournies sur les produits</li>
                  <li>Des avis publiés par d'autres utilisateurs</li>
                  <li>Tout accès non autorisé à nos serveurs ou aux informations personnelles stockées</li>
                  <li>Toute interruption ou cessation de transmission vers ou depuis notre service</li>
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-md mt-3">
                  <p className="text-sm text-gray-700">
                    Ces limitations ne s'appliquent pas aux responsabilités qui ne peuvent être exclues ou limitées par la loi applicable, notamment en cas de dol, faute lourde ou atteinte aux droits des consommateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Résiliation et suspension */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Clock className="mr-2" size={22} />
                Résiliation et suspension
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Résiliation par l'utilisateur</h3>
                <p>
                  Vous pouvez à tout moment cesser d'utiliser notre service ou supprimer votre compte depuis les paramètres de votre compte. La suppression de votre compte entraîne la perte définitive de votre profil, de vos avis, de votre historique et de vos favoris.
                </p>
                
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <AlertCircle size={16} className="inline-block mr-1" />
                    La suppression de votre compte n'entraîne pas automatiquement la résiliation de votre abonnement payant. Vous devez d'abord annuler votre abonnement avant de supprimer votre compte.
                  </p>
                </div>
                
                <h3 className="font-medium text-green-600 mt-3">Suspension ou résiliation par Fydo</h3>
                <p>
                  Fydo se réserve le droit de suspendre ou résilier votre compte, de limiter votre accès au service ou de supprimer tout contenu publié par vous, sans préavis ni responsabilité, pour l'une des raisons suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violation des présentes CGU</li>
                  <li>Comportement frauduleux ou abusif</li>
                  <li>Publication répétée d'avis trompeurs ou inappropriés</li>
                  <li>Utilisation de tickets de caisse falsifiés ou n'appartenant pas à l'utilisateur</li>
                  <li>Non-paiement des frais d'abonnement</li>
                  <li>À la demande des autorités légales ou réglementaires</li>
                  <li>Pour protéger Fydo, ses utilisateurs ou le public</li>
                </ul>
                
                <h3 className="font-medium text-green-600">Conséquences de la résiliation</h3>
                <p>
                  En cas de résiliation de votre compte, quelle qu'en soit la raison :
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Votre droit d'accès et d'utilisation du service cessera immédiatement</li>
                  <li>Nous pouvons, à notre discrétion, supprimer toutes vos données personnelles conformément à notre Politique de Confidentialité</li>
                  <li>Les avis que vous avez publiés peuvent être conservés de manière anonymisée</li>
                  <li>Aucun remboursement ne sera effectué pour les périodes d'abonnement payées mais non utilisées</li>
                </ul>
                
                <p>
                  Les sections des CGU relatives à la propriété intellectuelle, aux limitations de responsabilité, à l'indemnisation et au règlement des litiges resteront en vigueur après la résiliation.
                </p>
              </div>
            </div>
          </div>
          
          {/* Modifications des CGU */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <Edit className="mr-2" size={22} />
                Modifications des conditions
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Fydo se réserve le droit de modifier, à tout moment et sans préavis, les présentes CGU, notamment pour refléter des évolutions légales, réglementaires, techniques ou commerciales.
                </p>
                
                <p>
                  Les modifications entreront en vigueur dès leur publication sur notre site ou notre application. Pour les modifications substantielles, nous vous en informerons par email, notification dans l'application ou par tout autre moyen approprié.
                </p>
                
                <p>
                  La poursuite de votre utilisation du service après notification des modifications vaut acceptation des nouvelles conditions. Si vous n'acceptez pas les CGU modifiées, vous devez cesser d'utiliser le service et, si nécessaire, supprimer votre compte.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <p className="text-sm text-gray-700">
                    Il est recommandé de consulter régulièrement les CGU pour prendre connaissance de toute modification. La date de la dernière mise à jour est indiquée en bas de cette page.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dispositions finales */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
                <AlertCircle className="mr-2" size={22} />
                Dispositions finales
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <h3 className="font-medium text-green-600">Loi applicable</h3>
                <p>
                  Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                </p>
                
                <h3 className="font-medium text-green-600">Règlement des litiges</h3>
                <p>
                  En cas de litige relatif à l'utilisation du service, vous vous engagez à contacter préalablement Fydo pour tenter de trouver une solution amiable :
                </p>
                <ul className="list-none space-y-1 pl-6">
                  <li>Par email : <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a></li>
                  <li>Par courrier : FYDO SAS - Service Client, 123 Avenue des Innovations, 75000 Paris</li>
                </ul>
                
                <p>
                  Si aucune solution n'est trouvée dans un délai de 30 jours, vous pourrez saisir le médiateur de la consommation compétent :
                </p>
                
                <div className="pl-4 border-l-2 border-green-100 mt-1">
                  <p><strong>Centre de Médiation et d'Arbitrage de Paris (CMAP)</strong></p>
                  <p>39 avenue Franklin Roosevelt, 75008 Paris</p>
                  <p><a href="https://www.cmap.fr" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">www.cmap.fr</a></p>
                </div>
                
                <h3 className="font-medium text-green-600 mt-4">Divisibilité</h3>
                <p>
                  Si une disposition des présentes CGU est jugée illégale, nulle ou inapplicable, les autres dispositions resteront pleinement en vigueur. La disposition concernée sera remplacée par une disposition valide et applicable qui se rapproche le plus possible de l'intention originale.
                </p>
                
                <h3 className="font-medium text-green-600">Intégralité de l'accord</h3>
                <p>
                  Les présentes CGU, ainsi que la Politique de Confidentialité et toute condition particulière référencée, constituent l'intégralité de l'accord entre vous et Fydo concernant l'utilisation du service, et remplacent tous les accords antérieurs.
                </p>
                
                <h3 className="font-medium text-green-600">Contact</h3>
                <p>
                  Pour toute question concernant les présentes CGU, vous pouvez nous contacter à <a href="mailto:contact@fydo.fr" className="text-green-600 hover:underline">contact@fydo.fr</a>.
                </p>
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

export default TermsOfService;