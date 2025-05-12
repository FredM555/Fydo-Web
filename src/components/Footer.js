// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-end">
              <div className="text-white text-3xl font-bold">Fydo</div>
              <div className="text-yellow-400 text-4xl ml-1">★</div>
            </div>
            <p className="mt-2 max-w-xs">
              La communauté qui révolutionne vos choix de produits au quotidien.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-lg">Navigation</h3>
              <ul className="space-y-2">
                <li><a href="/#" className="hover:text-green-300">Accueil</a></li>
                <li><Link to="/concept" className="hover:text-green-300">Concept</Link></li>
                <li><Link to="/fonctionnalites" className="hover:text-green-300">Fonctionnalités</Link></li>
                <li><a href="#telecharger" className="hover:text-green-300">Télécharger</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Légal</h3>
              <ul className="space-y-2">
                <li><Link to="/conditions-utilisation" className="hover:text-green-300">Conditions d'utilisation</Link></li>
                <li><Link to="/politique-confidentialite" className="hover:text-green-300">Politique de confidentialité</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-green-300">Mentions légales</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg" id="contact">Contact</h3>
              <ul className="space-y-2">
                <li><a href="mailto:contact@fydo.app" className="hover:text-green-300">contact@fydo.app</a></li>
                <li><a href="/#" className="hover:text-green-300">Support</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-8 pt-8 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} FYDO. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;