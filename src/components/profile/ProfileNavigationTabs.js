// src/components/profile/ProfileNavigationTabs.js - Mise à jour complète
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  History, 
  Star, 
  Heart,
  Receipt
} from 'lucide-react';

/**
 * Composant de navigation par onglets pour les écrans mobiles
 * Affiche les options principales pour faciliter la navigation
 */
const ProfileNavigationTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActivePath = (path) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };
  
  const tabs = [
    { path: '/profile', icon: <User size={20} />, label: 'Profil' },
    { path: '/edit-profile', icon: <Settings size={20} />, label: 'Paramètres' },
    { path: '/historique-produits', icon: <History size={20} />, label: 'Historique' },
    { path: '/mes-favoris', icon: <Heart size={20} />, label: 'Favoris' },
    { path: '/mes-avis', icon: <Star size={20} />, label: 'Avis' },
    { path: '/mes-tickets', icon: <Receipt size={20} />, label: 'Tickets' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-top border-t border-gray-200 md:hidden z-10 mobile-nav-menu">
      <div className="grid grid-cols-6">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center py-2 ${
              isActivePath(tab.path) 
                ? 'text-green-600 tab-active' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="mb-1">
              {tab.icon}
            </div>
            <span className="text-xs">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}; 

export default ProfileNavigationTabs;