// src/App.js - Mise à jour pour ajouter la route vers la validation des avis
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login, SignUp, UserProfile, ChangePassword } from './components/login';
import Header from './components/Header';
import Hero from './components/Hero';
import Concept from './components/Concept';
import HowItWorks from './components/HowItWorks';
import TopProducts from './pages/TopProducts'; // Nouvelle page Top Produits
import Download from './components/Download';
import Features from './components/Features';
import Footer from './components/Footer';
import ProductSearch from './components/ProductSearch';
import ProductSearchOpti from './components/ProductSearchOpti';
import ProductSearchEnhanced from './components/ProductSearchEnhanced';
// Importer les composants d'administration
import AdminPanel from './components/admin/AdminPanel';
import PendingReviews from './components/admin/PendingReviews'; // Nouveau composant
import NotFound from './pages/NotFound';
import FAQ from './components/FAQ';

// Routes pour les abonnements
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionPayment from './pages/SubscriptionPayment';
import SubscriptionHistory from './pages/SubscriptionHistory';
import UserSubscription from './components/profile/UserSubscription';
import EditProfile from './components/profile/EditProfile';

// Routes pour favoris et historique
import FavoritesList from './components/profile/FavoritesList';
import ProductHistory  from './components/profile/ProductHistory';
import UserReviews from './components/profile/UserReviews';

import LegalNotice from './pages/LegalNotice';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import Contact from './components/Contact';


// Composant PrivateRoute amélioré pour protéger les routes qui nécessitent une authentification
const PrivateRoute = ({ element }) => {
  const { currentUser } = useAuth();
  return currentUser ? element : <Navigate to="/login" replace />;
};

// Composant AdminRoute pour protéger les routes admin
const AdminRoute = ({ element }) => {
  const { currentUser, userDetails } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!userDetails || userDetails.userType !== 'Admin') return <Navigate to="/profile" replace />;
  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-green-50 flex flex-col">
          <Helmet>
            <title>Fydo - Avis Produits</title>
            <link rel="icon" href="/images/Fydo-icone.png" type="image/png" />
            <link rel="shortcut icon" href="/images/Fydo-icone.png" type="image/png" />
          </Helmet>
          
          <Header />
          {/* Augmenter le padding-top pour créer plus d'espace entre le header et le contenu */}
          <div className="pt-10"> {/* Augmenté de 14 à 20 */}
          
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={
              <>
                <Hero />
                <Concept />
                <HowItWorks />
                <Download />
                <Features />
                <FAQ />
              </>
            } />
            
            {/* Routes d'authentification */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées pour le profil utilisateur */}
            <Route path="/profile" element={
              <PrivateRoute element={<UserProfile />} />
            } />
            <Route path="/edit-profile" element={
              <PrivateRoute element={<EditProfile />} />
            } />
            <Route path="/change-password" element={
              <PrivateRoute element={<ChangePassword />} />
            } />
            <Route path="/subscription/history" element={
              <PrivateRoute element={<SubscriptionHistory />} />
            } />
            <Route path="/my-subscription" element={
              <PrivateRoute element={<UserSubscription />} />
            } />
            {/* Routes protégées pour les favoris et l'historique */}
            <Route path="/mes-favoris" element={
              <PrivateRoute element={<FavoritesList />} />
            } />
            <Route path="/mes-avis" element={
              <PrivateRoute element={<UserReviews />} />
            } />
            <Route path="/historique-produits" element={
              <PrivateRoute element={<ProductHistory />} />
            } />

            <Route path="/contact" element={<Contact />} />

            {/* Routes pour les fonctionnalités de recherche de produits */}
            <Route path="/product-search" element={<ProductSearch />} />
            <Route path="/recherche-opti" element={<ProductSearchOpti />} />
            <Route path="/recherche-filtre" element={<ProductSearchEnhanced />} />

            <Route path="/top-produits" element={<TopProducts />} /> {/* Nouvelle route pour Top Produits */}
            {/* Routes pour les abonnements */}
            <Route path="/abonnements" element={<SubscriptionPlans />} />
            <Route path="/subscribe/:planId" element={
              <PrivateRoute element={<SubscriptionPayment />} />
            } />

            {/* Routes pour l'administration */}
            <Route path="/admin" element={
              <AdminRoute element={<AdminPanel />} />
            } />
            {/* Nouvelle route pour les avis en attente */}
            <Route path="/admin/pending-reviews" element={
              <AdminRoute element={<PendingReviews />} />
            } />
            
            {/* Nouvelle route pour les politiques de confidentialités */}
            <Route path="/conditions-utilisation" element={<TermsOfService />} />

            {/* Nouvelle route pour les politiques de confidentialités */}
            <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />

            {/* Nouvelle route pour les mentions légales */}
            <Route path="/mentions-legales" element={<LegalNotice />} />

            {/* Route fallback pour les URL inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />


            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;