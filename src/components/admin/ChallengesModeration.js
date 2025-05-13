// src/components/admin/AdminPendingChallenges.js - Amélioré avec sélection de trophées
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash, 
  Calendar, 
  CalendarClock, 
  Users, 
  ChevronDown,
  ChevronRight,
  Eye,
  Check,
  X,
  Save,
  AlertCircle,
  BarChart,
  Filter,
  RefreshCw,
  Loader,
  MessageSquare,
  Star,
  ShoppingBag,
  Droplet,
  Camera,
  Cake,
  Award,
  Zap,
  Crown,
  Gift,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import ProfileLayout from '../profile/ProfileLayout';

// Mapping des types de challenges avec leurs icônes - Identique à celui dans ChallengesPage.js 
// pour garantir la cohérence visuelle
const CHALLENGE_ICONS = {
  'food': <Cake size={24} />,
  'cosmetics': <Droplet size={24} />,
  'shopping': <ShoppingBag size={24} />,
  'engagement': <Users size={24} />,
  'review': <Star size={24} />,
  'photo': <Camera size={24} />,
  'streak': <TrendingUp size={24} />,
  'achievement': <Award size={24} />,
  'special': <Gift size={24} />,
  'default': <Trophy size={24} />
};

// Mapping des couleurs de badge par type - Identique à celui dans ChallengesPage.js
const BADGE_COLORS = {
  'achievement': 'amber',
  'engagement': 'green',
  'special': 'purple',
  'review': 'blue',
  'streak': 'orange',
  'food': 'yellow',
  'cosmetics': 'pink',
  'shopping': 'indigo',
  'photo': 'sky',
  'default': 'gray'
};

// Composant pour afficher une icône selon le type de challenge
const ChallengeIcon = ({ type, className, size = 18 }) => {
  const iconComponent = CHALLENGE_ICONS[type?.toLowerCase()] || CHALLENGE_ICONS.default;
  return React.cloneElement(iconComponent, { className, size });
};

// Fonction pour obtenir la couleur du badge par type
const getBadgeColor = (type) => {
  return BADGE_COLORS[type?.toLowerCase()] || BADGE_COLORS.default;
};

// Liste organisée des types de challenges
const CHALLENGE_TYPES = [
  { value: 'review', label: 'Avis produits', description: 'Publier des avis sur des produits' },
  { value: 'food', label: 'Produits alimentaires', description: 'Identifier des produits alimentaires' },
  { value: 'cosmetics', label: 'Produits cosmétiques', description: 'Scanner des produits cosmétiques' },
  { value: 'engagement', label: 'Engagement communautaire', description: 'Interagir avec la communauté' },
  { value: 'photo', label: 'Photos de produits', description: 'Télécharger des photos de produits' },
  { value: 'shopping', label: 'Shopping multi-catégories', description: 'Variété de produits différents' },
  { value: 'streak', label: 'Séries', description: 'Activité régulière pendant plusieurs jours' },
  { value: 'achievement', label: 'Accomplissement', description: 'Atteindre des objectifs spécifiques' },
  { value: 'special', label: 'Événement spécial', description: 'Challenges temporaires spéciaux' }
];

const AdminPendingChallenges = () => {
  // États
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'weekly',
    type: 'review',
    target_progress: 5,
    unit: 'avis',
    reward_points: 100,
    reward_description: 'Badge spécial + points',
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    is_active: true,
    badge_id: null, // ID du badge à attribuer à la fin du challenge
    badge_name: '', // Nom du badge pour l'affichage
    badge_type: 'review' // Type d'icône pour le badge
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    completedByUsers: 0,
    participationRate: 0
  });

  // Liste des badges disponibles
  const [availableBadges, setAvailableBadges] = useState([]);

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (userDetails && userDetails.userType !== 'Admin') {
      navigate('/profile');
    }
  }, [userDetails, navigate]);

  // Charger les challenges au chargement du composant
  useEffect(() => {
    fetchChallenges();
    fetchStats();
    fetchBadges();
  }, [activeTab]);

  // Récupérer les badges disponibles
  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setAvailableBadges(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des badges:", err);
    }
  };

  // Récupérer les challenges depuis Supabase
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      const status = activeTab === 'active' ? true : false;
      
      let query = supabase
        .from('challenges')
        .select('*, badges(id, name, type)')
        .eq('is_active', status)
        .order('created_at', { ascending: false });
      
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setChallenges(data || []);
    } catch (err) {
      setError("Erreur lors du chargement des challenges: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      // Nombre total de challenges
      const { count: totalCount, error: totalError } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // Nombre de challenges actifs
      const { count: activeCount, error: activeError } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (activeError) throw activeError;
      
      // Nombre de challenges complétés par les utilisateurs
      const { count: completedCount, error: completedError } = await supabase
        .from('user_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);
      
      if (completedError) throw completedError;
      
      // Nombre total d'utilisateurs avec au moins un challenge 
      const { count: usersWithChallengesCount, error: usersWithChallengesError } = await supabase
        .from('user_challenges')
        .select('user_id', { count: 'exact', distinct: true });
      
      if (usersWithChallengesError) throw usersWithChallengesError;
      
      // Nombre total d'utilisateurs
      const { count: totalUsersCount, error: totalUsersError } = await supabase
        .from('users')
        .select('id', { count: 'exact' });
      
      if (totalUsersError) throw totalUsersError;
      
      // Calculer le taux de participation
      const participationRate = totalUsersCount > 0 
        ? (usersWithChallengesCount / totalUsersCount) * 100 
        : 0;
      
      setStats({
        totalChallenges: totalCount || 0,
        activeChallenges: activeCount || 0,
        completedByUsers: completedCount || 0,
        participationRate: participationRate.toFixed(1)
      });
      
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
    }
  };

  // Créer un nouveau challenge
  const createChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([{
          ...formData,
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select();
      
      if (error) throw error;
      
      setChallenges([...challenges, data[0]]);
      resetForm();
      setShowForm(false);
      await fetchStats();
      
    } catch (err) {
      setError("Erreur lors de la création du challenge: " + err.message);
    }
  };

  // Mettre à jour un challenge existant
  const updateChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          ...formData,
          updated_at: new Date()
        })
        .eq('id', editingChallenge.id)
        .select();
      
      if (error) throw error;
      
      setChallenges(challenges.map(c => c.id === editingChallenge.id ? data[0] : c));
      resetForm();
      setEditingChallenge(null);
      setShowForm(false);
      
    } catch (err) {
      setError("Erreur lors de la mise à jour du challenge: " + err.message);
    }
  };

  // Supprimer un challenge
  const deleteChallenge = async (id) => {
    // Confirmation avant suppression
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce challenge ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setChallenges(challenges.filter(c => c.id !== id));
      await fetchStats();
      
    } catch (err) {
      setError("Erreur lors de la suppression du challenge: " + err.message);
    }
  };

  // Activer/désactiver un challenge
  const toggleChallengeStatus = async (id, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Si nous sommes sur l'onglet qui correspond au nouveau statut, mettre à jour la liste
      // Sinon, retirer le challenge de la liste actuelle
      if ((activeTab === 'active' && !currentStatus) || (activeTab === 'inactive' && currentStatus)) {
        setChallenges([...challenges, data[0]]);
      } else {
        setChallenges(challenges.filter(c => c.id !== id));
      }
      
      await fetchStats();
      
    } catch (err) {
      setError("Erreur lors de la modification du statut: " + err.message);
    }
  };

  // Initialiser le formulaire pour l'édition
  const handleEdit = (challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      type: challenge.type,
      target_progress: challenge.target_progress,
      unit: challenge.unit,
      reward_points: challenge.reward_points,
      reward_description: challenge.reward_description,
      start_date: new Date(challenge.start_date),
      end_date: new Date(challenge.end_date),
      is_active: challenge.is_active,
      badge_id: challenge.badge_id || null,
      badge_name: challenge.badges?.name || '',
      badge_type: challenge.badges?.type || challenge.type || 'review'
    });
    
    setEditingChallenge(challenge);
    setShowForm(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'weekly',
      type: 'review',
      target_progress: 5,
      unit: 'avis',
      reward_points: 100,
      reward_description: 'Badge spécial + points',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      is_active: true,
      badge_id: null,
      badge_name: '',
      badge_type: 'review'
    });
    setShowPreview(false);
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value
    });
  };

  // Gérer les changements de dates
  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: new Date(e.target.value)
    });
  };

  // Gérer le changement de badge
  const handleBadgeChange = (e) => {
    const badgeId = e.target.value;
    
    if (badgeId === "none" || !badgeId) {
      setFormData({
        ...formData,
        badge_id: null,
        badge_name: '',
        badge_type: formData.type || 'review'
      });
      return;
    }
    
    const selectedBadge = availableBadges.find(badge => badge.id === parseInt(badgeId));
    
    if (selectedBadge) {
      setFormData({
        ...formData,
        badge_id: selectedBadge.id,
        badge_name: selectedBadge.name,
        badge_type: selectedBadge.type || formData.type
      });
    }
  };

  // Gérer le changement de type de badge (lorsqu'aucun badge existant n'est sélectionné)
  const handleBadgeTypeChange = (type) => {
    if (!formData.badge_id) {
      setFormData({
        ...formData,
        badge_type: type
      });
    }
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingChallenge) {
      updateChallenge();
    } else {
      createChallenge();
    }
  };

  // Fonction pour calculer la durée entre deux dates
  const calculateDuration = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Différence en jours
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    }
  };

  return (
    <ProfileLayout title="Gestion des Challenges">
      {/* Onglets de navigation */}
      <div className="flex items-center space-x-4 mb-6 border-b border-gray-200">
        <Link to="/admin" className="px-4 py-2 text-gray-600 hover:text-green-600">
          <Users className="inline-block mr-2" size={18} />
          Utilisateurs
        </Link>
        
        <Link to="/admin/pending-reviews" className="px-4 py-2 text-gray-600 hover:text-green-600 flex items-center">
          <MessageSquare className="inline-block mr-2" size={18} />
          Avis à valider
        </Link>
        
        <div className="px-4 py-2 text-green-600 border-b-2 border-green-600">
          <Trophy className="inline-block mr-2" size={18} />
          Challenges
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center">
            <Trophy className="mr-2" size={24} />
            Gestion des Challenges
          </h2>
          
          {!showForm && (
            <button
              onClick={() => { setEditingChallenge(null); setShowForm(true); resetForm(); }}
              className="bg-white text-amber-600 px-3 py-1 rounded flex items-center text-sm font-medium hover:bg-amber-50"
            >
              <Plus size={18} className="mr-1" />
              Nouveau challenge
            </button>
          )}
        </div>
        
        {/* Statistiques */}
        <div className="bg-amber-50 p-4 flex flex-wrap justify-around border-b border-amber-100">
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-600">Total des challenges</div>
            <div className="text-2xl font-bold text-amber-700">{stats.totalChallenges}</div>
          </div>
          
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-600">Challenges actifs</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeChallenges}</div>
          </div>
          
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-600">Challenges complétés</div>
            <div className="text-2xl font-bold text-blue-600">{stats.completedByUsers}</div>
          </div>
          
          <div className="text-center px-4 py-2">
            <div className="text-sm text-gray-600">Taux de participation</div>
            <div className="text-2xl font-bold text-purple-600">{stats.participationRate}%</div>
          </div>
        </div>
        
        {/* Afficher les erreurs */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 border-l-4 border-red-500 mb-4">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error}</span>
            </div>
            <button 
              className="text-red-500 hover:text-red-700 text-sm mt-2 underline"
              onClick={() => setError(null)}
            >
              Fermer
            </button>
          </div>
        )}
        
        {/* Formulaire */}
        {showForm && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {editingChallenge ? `Modifier le challenge: ${editingChallenge.title}` : 'Créer un nouveau challenge'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du challenge *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="special">Événement spécial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de challenge *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {CHALLENGE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif et unité *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      name="target_progress"
                      value={formData.target_progress}
                      onChange={handleInputChange}
                      min="1"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="avis, produits, etc."
                      className="w-2/3 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input 
                    type="date"
                    name="start_date"
                    value={formData.start_date.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input 
                    type="date"
                    name="end_date"
                    value={formData.end_date.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min={formData.start_date.toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points de récompense *
                  </label>
                  <input
                    type="number"
                    name="reward_points"
                    value={formData.reward_points}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description de la récompense *
                  </label>
                  <input
                    type="text"
                    name="reward_description"
                    value={formData.reward_description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Badge Expert + 100 points"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description du challenge *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                ></textarea>
              </div>
              
              {/* Section de sélection de badge/trophée */}
              <div className="mb-6 border-t border-b border-gray-100 py-4">
                <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                  <Award className="mr-2 text-amber-500" size={20} />
                  Badge de réussite du challenge
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner un badge existant
                    </label>
                    <select
                      value={formData.badge_id || "none"}
                      onChange={handleBadgeChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="none">Aucun badge prédéfini</option>
                      {availableBadges.map(badge => (
                        <option key={badge.id} value={badge.id}>
                          {badge.name} ({badge.type || 'standard'})
                        </option>
                      ))}
                    </select>
                    
                    {!formData.badge_id && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choisir un type d'icône pour le trophée
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {CHALLENGE_TYPES.map(type => (
                            <div 
                              key={type.value}
                              className={`p-2 border rounded-md cursor-pointer flex flex-col items-center ${
                                formData.badge_type === type.value 
                                ? `bg-${getBadgeColor(type.value)}-100 border-${getBadgeColor(type.value)}-300` 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                              onClick={() => handleBadgeTypeChange(type.value)}
                            >
                              <div className={`p-2 rounded-full bg-${getBadgeColor(type.value)}-100`}>
                                <ChallengeIcon type={type.value} className={`text-${getBadgeColor(type.value)}-500`} />
                              </div>
                              <span className="text-xs text-center mt-1">{type.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">Aperçu du trophée</p>
                    <div className={`w-16 h-16 bg-${getBadgeColor(formData.badge_type)}-100 rounded-full flex items-center justify-center mb-2 relative overflow-hidden`}>
                      <ChallengeIcon type={formData.badge_type} className={`text-${getBadgeColor(formData.badge_type)}-500`} size={32} />
                      
                      {/* Effet visuel pour l'aperçu */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white opacity-20"></div>
                    </div>
                    <span className="text-sm font-medium">
                      {formData.badge_name || `Badge ${formData.title}`}
                    </span>
                    <div className="flex items-center text-xs text-amber-600 mt-1">
                      <Zap size={12} className="mr-1" />
                      +{formData.reward_points} points
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prévisualisation du challenge */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-amber-600 hover:text-amber-700 font-medium mb-2"
                >
                  {showPreview ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                  {showPreview ? "Masquer l'aperçu" : "Voir l'aperçu du challenge"}
                </button>
                
                {showPreview && (
                  <div className="border border-amber-200 rounded-lg overflow-hidden">
                    <div className={`bg-${getBadgeColor(formData.type)}-50 p-4 border-b border-${getBadgeColor(formData.type)}-100`}>
                      <h3 className="font-bold text-gray-800 flex items-center">
                        <ChallengeIcon type={formData.type} className={`text-${getBadgeColor(formData.type)}-500 mr-2`} />
                        {formData.title}
                        <span className={`ml-3 bg-${getBadgeColor(formData.type)}-100 text-${getBadgeColor(formData.type)}-700 text-xs px-2 py-1 rounded-full`}>
                          {formData.category === 'weekly' ? 'Hebdomadaire' : 
                           formData.category === 'monthly' ? 'Mensuel' : 
                           'Événement spécial'}
                        </span>
                      </h3>
                      <p className="text-gray-600 mt-1">{formData.description}</p>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-1" />
                          <span>
                            {formData.start_date.toLocaleDateString()} au {formData.end_date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{formData.target_progress}</span>
                          <span className="text-sm text-gray-600 ml-1">{formData.unit}</span>
                        </div>
                      </div>
                      
                      <div className="relative pt-1 mb-4">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                          <div className={`bg-${getBadgeColor(formData.type)}-500 rounded-full`} style={{ width: '30%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0/{formData.target_progress}</span>
                          <span>30%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-1 rounded-full bg-${getBadgeColor(formData.badge_type)}-100 mr-2`}>
                            <Award className={`text-${getBadgeColor(formData.badge_type)}-500`} size={16} />
                          </div>
                          <div className="text-sm text-gray-700">
                            {formData.reward_description}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full bg-${getBadgeColor(formData.type)}-100 text-${getBadgeColor(formData.type)}-700 flex items-center`}>
                          <Trophy size={12} className="mr-1" />
                          +{formData.reward_points} pts
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Challenge visible et disponible pour les utilisateurs
                </span>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingChallenge(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  {editingChallenge ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Filtres et onglets */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-1 mb-2 sm:mb-0">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Actifs
            </button>
            <button 
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'inactive' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inactifs
            </button>
          </div>
          
          <div className="flex items-center">
            <Filter size={16} className="text-gray-500 mr-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="weekly">Hebdomadaires</option>
              <option value="monthly">Mensuels</option>
              <option value="special">Événements spéciaux</option>
            </select>
            <button 
              onClick={fetchChallenges}
              className="ml-2 text-sm text-gray-600 hover:text-amber-600"
              title="Rafraîchir la liste"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        
        {/* Liste des challenges */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Chargement des challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="text-gray-300 mx-auto mb-2" size={40} />
              <p className="text-gray-500">Aucun challenge {activeTab === 'active' ? 'actif' : 'inactif'} trouvé</p>
              {filterCategory !== 'all' && (
                <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Récompense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challenges.map(challenge => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <ChallengeIcon type={challenge.type} className="text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{challenge.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.category === 'weekly' 
                          ? 'bg-amber-100 text-amber-800' 
                          : challenge.category === 'monthly'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {challenge.category === 'weekly' && <Calendar className="mr-1" size={12} />}
                        {challenge.category === 'monthly' && <CalendarClock className="mr-1" size={12} />}
                        {challenge.category === 'special' && <Trophy className="mr-1" size={12} />}
                        {challenge.category === 'weekly' ? 'Hebdomadaire' : 
                          challenge.category === 'monthly' ? 'Mensuel' : 
                          'Événement spécial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateDuration(challenge.start_date, challenge.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challenge.target_progress} {challenge.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{challenge.reward_description}</div>
                      <div className="text-xs text-amber-600">+{challenge.reward_points} points</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {challenge.badge_id ? (
                        <div className="flex items-center">
                          <div className={`p-1 rounded-full bg-${getBadgeColor(challenge.badges?.type || challenge.type)}-100 mr-2`}>
                            <ChallengeIcon 
                              type={challenge.badges?.type || challenge.type} 
                              className={`text-${getBadgeColor(challenge.badges?.type || challenge.type)}-500`} 
                              size={14} 
                            />
                          </div>
                          <span className="text-sm">{challenge.badges?.name || "Badge"}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Aucun badge spécifique</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleChallengeStatus(challenge.id, challenge.is_active)}
                          className={`p-1 rounded-full ${
                            challenge.is_active 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                          title={challenge.is_active ? "Désactiver" : "Activer"}
                        >
                          {challenge.is_active ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteChallenge(challenge.id)}
                          className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                          title="Supprimer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default AdminPendingChallenges;