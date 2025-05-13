// src/components/admin/AdminPanel.js - Modifié pour inclure l'onglet des challenges
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { 
  Users, 
  Settings, 
  Shield, 
  Search, 
  User, 
  CreditCard, 
  ChevronDown, 
  Calendar,
  RefreshCw,
  Check,
  X,
  Loader,
  MessageSquare,
  Database,
  Star,
  BarChart2,
  FileSearch,
  Gift,
  Clock,
  Info,
  DollarSign,
  Trophy // Ajouté pour l'icône des challenges
} from 'lucide-react';
import ProfileLayout from '../profile/ProfileLayout';
import { getReviewStats } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const AdminPanel = () => {
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1); // Durée en mois
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewStats, setReviewStats] = useState({ pending: 0 });
  const [challengeStats, setChallengeStats] = useState({ total: 0, active: 0 }); // Ajout des stats pour les challenges
  
  // Statistiques d'abonnements
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalActive: 0,
    offeredActive: 0,
    paidActive: 0
  });
  
  // Nouvelles statistiques
  const [productStats, setProductStats] = useState({ 
    totalProducts: 0, 
    productsWithReviews: 0,
    scanCount: 0,
    searchNameCount: 0
  });

  // Vérifier si l'utilisateur est bien admin
  useEffect(() => {
    if (userDetails && userDetails.userType !== 'Admin') {
      navigate('/profile');
    }
  }, [userDetails, navigate]);

  // Charger la liste des utilisateurs et les statistiques
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || !userDetails || userDetails.userType !== 'Admin') return;
      
      try {
        setLoading(true);
        
        // Récupérer tous les utilisateurs avec leurs abonnements actifs
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            user_subscriptions(
              id,
              plan_id,
              start_date,
              end_date,
              is_active,
              is_auto_renew,
              payment_method
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Récupérer tous les plans d'abonnement
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly', { ascending: true });
          
        if (plansError) throw plansError;
        
        // Récupérer les statistiques des avis
        const { success: statsSuccess, stats, error: statsError } = await getReviewStats();
        
        if (statsSuccess) {
          setReviewStats(stats);
        } else if (statsError) {
          console.error("Erreur lors de la récupération des statistiques des avis:", statsError);
        }
        
        // Compter le nombre total de produits
        const { count: totalProductsCount, error: productsCountError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        if (productsCountError) throw productsCountError;
        
        // Compter le nombre de produits avec des avis
        const { count: productsWithReviewsCount, error: productsWithReviewsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .not('average_rating', 'is', null)
          .gt('average_rating', 0);
          
        if (productsWithReviewsError) throw productsWithReviewsError;
        
        // Compter le nombre de scans
        const { count: scanCount, error: scanCountError } = await supabase
          .from('product_history')
          .select('*', { count: 'exact', head: true })
          .eq('interaction_type', 'scan');
          
        if (scanCountError) throw scanCountError;
        
        // Compter le nombre de recherches par nom
        const { count: searchNameCount, error: searchNameCountError } = await supabase
          .from('product_history')
          .select('*', { count: 'exact', head: true })
          .eq('interaction_type', 'searchName');
          
        if (searchNameCountError) throw searchNameCountError;
        
        // Récupérer les statistiques des challenges
        const { count: totalChallengesCount, error: totalChallengesError } = await supabase
          .from('challenges')
          .select('*', { count: 'exact', head: true });
          
        if (totalChallengesError) throw totalChallengesError;
        
        const { count: activeChallengesCount, error: activeChallengesError } = await supabase
          .from('challenges')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
          
        if (activeChallengesError) throw activeChallengesError;
        
        setChallengeStats({
          total: totalChallengesCount || 0,
          active: activeChallengesCount || 0
        });
        
        // Calculer les statistiques d'abonnements
        const activeSubscriptions = data
          .flatMap(user => user.user_subscriptions)
          .filter(sub => sub && sub.is_active);
          
        const now = new Date();
        const validActiveSubscriptions = activeSubscriptions.filter(sub => {
          const endDate = new Date(sub.end_date);
          return endDate > now;
        });
        
        const offeredSubscriptions = validActiveSubscriptions.filter(
          sub => sub.payment_method === 'offert'
        );
        
        const paidSubscriptions = validActiveSubscriptions.filter(
          sub => sub.payment_method !== 'offert'
        );
        
        setSubscriptionStats({
          totalActive: validActiveSubscriptions.length,
          offeredActive: offeredSubscriptions.length,
          paidActive: paidSubscriptions.length
        });
        
        // Mettre à jour les statistiques
        setProductStats({
          totalProducts: totalProductsCount || 0,
          productsWithReviews: productsWithReviewsCount || 0,
          scanCount: scanCount || 0,
          searchNameCount: searchNameCount || 0
        });
        
        setUsers(data);
        setFilteredUsers(data);
        setSubscriptionPlans(plans);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, userDetails]);

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Fonction utilitaire pour ajouter correctement des mois à une date
  const addMonths = (date, months) => {
    if (!date || isNaN(months)) {
      throw new Error("Date invalide ou nombre de mois non valide");
    }
    
    // Créer une copie de la date
    const result = new Date(date);
    
    // Stocker le jour du mois initial
    const initialDay = result.getDate();
    
    // Ajouter les mois
    result.setMonth(result.getMonth() + months);
    
    // Vérifier si le jour a changé (cas du 31 mars → 30 avril par exemple)
    if (result.getDate() !== initialDay) {
      // Si oui, revenir au dernier jour du mois précédent
      result.setDate(0);
    }
    
    return result;
  };

  // Assigner un nouvel abonnement
  const assignSubscription = async () => {
    if (!selectedUserId || !selectedPlan || !selectedDuration) return;
    
    setIsProcessing(true);
    
    try {
      const user = users.find(u => u.id === selectedUserId);
      if (!user) throw new Error("Utilisateur non trouvé");
      
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error("Plan d'abonnement non trouvé");
      
      // Désactiver l'abonnement offert actuel si existant
      try {
        await supabase
          .from('user_subscriptions')
          .update({ is_active: false })
          .eq('user_id', selectedUserId)
          .eq('is_active', true)
          .eq('payment_method', 'offert');
      } catch (err) {
        console.log("Note: Aucun abonnement offert actif à désactiver ou erreur:", err.message);
      }
      
      // Calculer les dates d'abonnement
      const startDate = new Date();
      
      // Utiliser la fonction addMonths pour calculer la date de fin
      const monthsToAdd = parseInt(selectedDuration, 10) || 1;
      const endDate = addMonths(startDate, monthsToAdd);
      
      // Créer le nouvel abonnement
      const { data: newSubscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: selectedUserId,
            firebase_uid: user.firebase_uid,
            plan_id: selectedPlan,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
            payment_status: 'completed',
            payment_method: 'offert',
            is_auto_renew: false // Les abonnements offerts n'ont jamais de renouvellement automatique
          }
        ])
        .select();
        
      if (subscriptionError) throw subscriptionError;
      
      // Mettre à jour le type d'utilisateur
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ subscription_name: plan.name })
        .eq('id', selectedUserId);
        
      if (userUpdateError) throw userUpdateError;
      
      // Mettre à jour la liste des utilisateurs
      const updatedUsers = users.map(u => {
        if (u.id === selectedUserId) {
          // Conserver les abonnements existants et ajouter le nouveau
          const existingSubscriptions = u.user_subscriptions || [];
          // Désactiver tous les abonnements offerts existants
          const updatedExistingSubscriptions = existingSubscriptions.map(sub => {
            if (sub.payment_method === 'offert' && sub.is_active) {
              return { ...sub, is_active: false };
            }
            return sub;
          });
          
          return {
            ...u,
            user_type: plan.name,
            user_subscriptions: [
              ...updatedExistingSubscriptions,
              {
                id: newSubscription[0].id,
                plan_id: selectedPlan,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                is_active: true,
                is_auto_renew: false,
                payment_method: 'offert'
              }
            ]
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSuccessMessage(`Abonnement ${plan.name} offert assigné avec succès à ${user.display_name || user.email} (${monthsToAdd} mois)`);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
        closeModal();
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'assignation de l'abonnement:", err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Récupérer l'historique des abonnements d'un utilisateur
  const fetchSubscriptionHistory = async (userId) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(name, price_monthly, price_yearly)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSubscriptionHistory(data);
      setHistoryModalOpen(true);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique des abonnements:", err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mettre à jour le rôle d'un utilisateur
  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ user_type: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Mettre à jour la liste des utilisateurs
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, user_type: newRole };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du rôle:", err);
      setError(`Erreur: ${err.message}`);
    }
  };

  // Afficher les abonnements de l'utilisateur
  const renderSubscriptionStatus = (user) => {
    if (!user.user_subscriptions || user.user_subscriptions.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Aucun abonnement
        </span>
      );
    }
    
    const now = new Date();
    
    // Trouver l'abonnement payé actif
    const paidSubscription = user.user_subscriptions.find(sub => 
      sub.is_active && 
      sub.payment_method !== 'offert' && 
      new Date(sub.end_date) > now
    );
    
    // Trouver l'abonnement offert actif
    const offeredSubscription = user.user_subscriptions.find(sub => 
      sub.is_active && 
      sub.payment_method === 'offert' && 
      new Date(sub.end_date) > now
    );
    
    // Afficher les deux types d'abonnements
    return (
      <div className="flex flex-col space-y-1">
        {paidSubscription && (
          <div className="flex items-center">
            <DollarSign size={12} className="mr-1 text-green-600" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {getPlanName(paidSubscription.plan_id)} (Payé)
              <span className="ml-1 text-xs">{formatDate(paidSubscription.end_date)}</span>
            </span>
          </div>
        )}
        
        {offeredSubscription && (
          <div className="flex items-center">
            <Gift size={12} className="mr-1 text-purple-600" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getPlanName(offeredSubscription.plan_id)} (Offert)
              <span className="ml-1 text-xs">{formatDate(offeredSubscription.end_date)}</span>
            </span>
          </div>
        )}
        
        {!paidSubscription && !offeredSubscription && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Aucun abonnement actif
          </span>
        )}
      </div>
    );
  };

  // Récupérer le nom du plan par son ID
  const getPlanName = (planId) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    return plan ? plan.name : 'Inconnu';
  };

  // Ouverture du modal pour assigner un abonnement
  const openSubscriptionModal = (userId) => {
    setSelectedUserId(userId);
    setModalOpen(true);
    // Réinitialiser les valeurs
    setSelectedPlan(null);
    setSelectedDuration(1);
    setSuccessMessage(null);
  };

  // Ouvrir le modal d'historique des abonnements
  const openHistoryModal = (userId) => {
    setSelectedUserId(userId);
    fetchSubscriptionHistory(userId);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedUserId(null);
    setSelectedPlan(null);
    setSelectedDuration(1);
    setSuccessMessage(null);
  };

  // Fermer le modal d'historique
  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSubscriptionHistory([]);
  };

  // Style pour le badge d'abonnement dans l'historique
  const getSubscriptionBadgeStyle = (paymentMethod) => {
    if (paymentMethod === 'offert') {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  // Icône pour le type d'abonnement dans l'historique
  const getSubscriptionIcon = (paymentMethod) => {
    if (paymentMethod === 'offert') {
      return <Gift size={14} className="text-purple-600" />;
    } else {
      return <DollarSign size={14} className="text-green-600" />;
    }
  };

  return (
    <ProfileLayout title="Panneau d'administration">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Erreur</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div>
          {/* Onglets de navigation */}
          <div className="flex items-center space-x-4 mb-6 border-b border-gray-200">
            <div className="px-4 py-2 text-green-600 border-b-2 border-green-600">
              <Users className="inline-block mr-2" size={18} />
              Utilisateurs
            </div>
            
            <Link to="/admin/pending-reviews" className="px-4 py-2 text-gray-600 hover:text-green-600 flex items-center">
              <MessageSquare className="inline-block mr-2" size={18} />
              Avis à valider
              {reviewStats.pending > 0 && (
                <span className="ml-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                  {reviewStats.pending}
                </span>
              )}
            </Link>
            
            {/* Nouvel onglet pour les challenges */}
            <Link to="/admin/challenges" className="px-4 py-2 text-gray-600 hover:text-green-600 flex items-center">
              <Trophy className="inline-block mr-2" size={18} />
              Challenges
              {challengeStats.active > 0 && (
                <span className="ml-2 flex items-center justify-center w-6 h-6 bg-amber-500 text-white rounded-full text-xs font-bold">
                  {challengeStats.active}
                </span>
              )}
            </Link>
          </div>
          
          {/* Tableau de bord - Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Statistiques des utilisateurs */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
            
            {/* Statistiques des abonnements */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Abonnements actifs</p>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <Gift size={14} className="text-purple-600 mr-1" />
                    <span className="text-purple-600 font-bold">{subscriptionStats.offeredActive}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={14} className="text-green-600 mr-1" />
                    <span className="text-green-600 font-bold">{subscriptionStats.paidActive}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistiques des produits */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits consultés</p>
                <p className="text-xl font-bold">{productStats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="flex items-center">
                    <Star className="h-3 w-3 text-amber-500 mr-1" />
                    {productStats.productsWithReviews} avec avis
                  </span>
                </p>
              </div>
            </div>
            
            {/* Statistiques des interactions */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <BarChart2 className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Interactions</p>
                <div className="flex space-x-4">
                  <div>
                    <p className="text-lg font-bold">{productStats.scanCount}</p>
                    <p className="text-xs text-gray-500">Scans</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{productStats.searchNameCount}</p>
                    <p className="text-xs text-gray-500">Recherches</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Nouvelles statistiques des challenges */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Challenges</p>
                <div className="flex space-x-4">
                  <div>
                    <p className="text-lg font-bold">{challengeStats.active}</p>
                    <p className="text-xs text-gray-500">Actifs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{challengeStats.total - challengeStats.active}</p>
                    <p className="text-xs text-gray-500">Inactifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gestion des utilisateurs */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="mr-2 text-green-600" />
              Gestion des utilisateurs
            </h3>
            
            <div className="relative w-64">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          {/* Liste des utilisateurs */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnements actifs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date inscription
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-bold">
                              {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.display_name || 'Non défini'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="text-sm border rounded-md p-1"
                          value={user.user_type}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="Visiteur">Visiteur</option>
                          <option value="Essential">Essential</option>
                          <option value="Premium">Premium</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderSubscriptionStatus(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openSubscriptionModal(user.id)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                          title="Assigner un abonnement offert"
                        >
                          <span className="flex items-center">
                            <Gift size={16} className="mr-1" />
                            Offrir
                          </span>
                        </button>
                        <button
                          onClick={() => openHistoryModal(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir l'historique des abonnements"
                        >
                          <span className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            Historique
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Modal d'assignation d'abonnement offert */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Gift className="text-purple-600 mr-2" size={20} />
                  Assigner un abonnement offert
                </h3>
                
                {successMessage ? (
                  <div className="p-4 bg-green-100 text-green-700 rounded-md mb-4 flex items-center">
                    <Check className="mr-2" size={18} />
                    <span>{successMessage}</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Sélectionner un plan d'abonnement
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={selectedPlan || ''}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                      >
                        <option value="">Sélectionnez un plan...</option>
                        {subscriptionPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price_monthly}€/mois
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">
                        Durée (en mois)
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                      >
                        {[1, 3, 6, 12, 24].map((months) => (
                          <option key={months} value={months}>
                            {months} {months === 1 ? 'mois' : 'mois'}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        <Info size={14} className="inline mr-1" />
                        Cet abonnement sera marqué comme "offert" et n'aura pas de renouvellement automatique
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={assignSubscription}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                        disabled={!selectedPlan || isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <Loader size={18} className="animate-spin mr-2" />
                            Traitement...
                          </span>
                        ) : (
                          <>
                            <Gift size={18} className="mr-2" />
                            Assigner
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Modal d'historique des abonnements */}
          {historyModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <Clock className="text-blue-600 mr-2" size={20} />
                    Historique des abonnements
                  </h3>
                  <button
                    onClick={closeHistoryModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {isProcessing ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader size={40} className="animate-spin text-blue-600" />
                  </div>
                ) : subscriptionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>Aucun historique d'abonnement pour cet utilisateur</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date de début
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date de fin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Renouvellement auto.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subscriptionHistory.map((subscription) => {
                          const now = new Date();
                          const endDate = new Date(subscription.end_date);
                          const isActive = subscription.is_active && endDate > now;
                          
                          return (
                            <tr key={subscription.id} className={isActive ? "bg-green-50" : ""}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(subscription.start_date, true)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(subscription.end_date, true)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="font-medium text-gray-900">
                                  {subscription.subscription_plans?.name || 'Plan inconnu'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadgeStyle(subscription.payment_method)}`}>
                                  {getSubscriptionIcon(subscription.payment_method)}
                                  <span className="ml-1">
                                    {subscription.payment_method === 'offert' ? 'Offert' : 'Payé'}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isActive ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check size={12} className="mr-1" />
                                    Actif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <X size={12} className="mr-1" />
                                    Inactif
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {subscription.payment_method === 'offert' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <X size={12} className="mr-1" />
                                    Non applicable
                                  </span>
                                ) : subscription.is_auto_renew ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <RefreshCw size={12} className="mr-1" />
                                    Activé
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <X size={12} className="mr-1" />
                                    Désactivé
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </ProfileLayout>
  );
};

export default AdminPanel;