// src/components/admin/AdminPanel.js - Correction pour réafficher la liste des utilisateurs
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileLayout from '../profile/ProfileLayout';
import { getReviewStats } from '../../services/adminService';

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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewStats, setReviewStats] = useState({ pending: 0 });

  // Vérifier si l'utilisateur est bien admin
  useEffect(() => {
    if (userDetails && userDetails.userType !== 'Admin') {
      navigate('/profile');
    }
  }, [userDetails, navigate]);

  // Charger la liste des utilisateurs
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
              is_auto_renew
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
        
        setUsers(data);
        setFilteredUsers(data);
        setSubscriptionPlans(plans);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        setError("Impossible de charger la liste des utilisateurs.");
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
    if (!selectedUserId || !selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const user = users.find(u => u.id === selectedUserId);
      if (!user) throw new Error("Utilisateur non trouvé");
      
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error("Plan d'abonnement non trouvé");
      
      // Désactiver l'abonnement actuel si existant
      try {
        await supabase
          .from('user_subscriptions')
          .update({ is_active: false })
          .eq('user_id', selectedUserId)
          .eq('is_active', true);
      } catch (err) {
        console.log("Note: Aucun abonnement actif à désactiver ou erreur:", err.message);
      }
      
      // Calculer les dates d'abonnement
      const startDate = new Date();
      
      // Utiliser la fonction addMonths pour calculer la date de fin
      const monthsToAdd = plan.duration_month || 1;
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
            payment_method: 'admin',
            is_auto_renew: true
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
          return {
            ...u,
            user_type: plan.name,
            user_subscriptions: [{
              id: newSubscription[0].id,
              plan_id: selectedPlan,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              is_active: true,
              is_auto_renew: true
            }]
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSuccessMessage(`Abonnement ${plan.name} assigné avec succès à ${user.display_name || user.email} (${monthsToAdd} mois)`);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'assignation de l'abonnement:", err);
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

  // Afficher l'état de l'abonnement
  const renderSubscriptionStatus = (user) => {
    const activeSubscription = user.user_subscriptions?.find(sub => sub.is_active);
    
    if (!activeSubscription) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Aucun abonnement
        </span>
      );
    }
    
    const now = new Date();
    const endDate = new Date(activeSubscription.end_date);
    
    const plan = subscriptionPlans.find(p => p.id === activeSubscription.plan_id);
    const planName = plan ? plan.name : 'Inconnu';
    
    if (now > endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expiré ({planName})
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Actif ({planName})
      </span>
    );
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Ouverture du modal pour assigner un abonnement
  const openSubscriptionModal = (userId) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedUserId(null);
    setSelectedPlan(null);
    setSuccessMessage(null);
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
          </div>
          
          {/* Tableau de bord - Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avis approuvés</p>
                <p className="text-xl font-bold">{reviewStats.approved || 0}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avis en attente</p>
                <p className="text-xl font-bold">{reviewStats.pending || 0}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <X className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avis rejetés</p>
                <p className="text-xl font-bold">{reviewStats.rejected || 0}</p>
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
                    Abonnement
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
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Assigner abonnement
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Modal d'assignation d'abonnement */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Assigner un abonnement</h3>
                
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
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={assignSubscription}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        disabled={!selectedPlan || isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <Loader size={18} className="animate-spin mr-2" />
                            Traitement...
                          </span>
                        ) : (
                          'Assigner'
                        )}
                      </button>
                    </div>
                  </>
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