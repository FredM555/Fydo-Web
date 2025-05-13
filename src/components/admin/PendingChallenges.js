// src/components/admin/PendingChallenges.js
import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import Datepicker from 'react-tailwindcss-datepicker';

const PendingChallenges = () => {
  // États
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

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
    is_active: true
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    completedByUsers: 0,
    participationRate: 0
  });

  // Charger les challenges au chargement du composant
  useEffect(() => {
    fetchChallenges();
    fetchStats();
  }, [activeTab]);

  // Récupérer les challenges depuis Supabase
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      const status = activeTab === 'active' ? true : false;
      
      let query = supabase
        .from('challenges')
        .select('*')
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
      const { count: totalCount } = await supabase
        .from('challenges')
        .select('*', { count: 'exact' });
      
      // Nombre de challenges actifs
      const { count: activeCount } = await supabase
        .from('challenges')
        .select('*', { count: 'exact' })
        .eq('is_active', true);
      
      // Nombre de challenges complétés par les utilisateurs
      const { count: completedCount } = await supabase
        .from('user_challenges')
        .select('*', { count: 'exact' })
        .eq('is_completed', true);
      
      // Nombre total d'utilisateurs avec au moins un challenge 
      const { count: usersWithChallengesCount } = await supabase
        .from('user_challenges')
        .select('user_id', { count: 'exact', distinct: true });
      
      // Nombre total d'utilisateurs
      const { count: totalUsersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' });
      
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
      is_active: challenge.is_active
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
      is_active: true
    });
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
  const handleDateChange = (name, dateValue) => {
    setFormData({
      ...formData,
      [name]: new Date(dateValue.startDate)
    });
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

  return (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <option value="review">Avis produits</option>
                  <option value="food">Produits alimentaires</option>
                  <option value="cosmetics">Produits cosmétiques</option>
                  <option value="engagement">Engagement communautaire</option>
                  <option value="photo">Photos de produits</option>
                  <option value="shopping">Shopping multi-catégories</option>
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
                <Datepicker 
                  value={{ 
                    startDate: formData.start_date,
                    endDate: formData.start_date 
                  }}
                  onChange={(val) => handleDateChange('start_date', val)}
                  asSingle={true}
                  useRange={false}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <Datepicker 
                  value={{ 
                    startDate: formData.end_date,
                    endDate: formData.end_date 
                  }}
                  onChange={(val) => handleDateChange('end_date', val)}
                  asSingle={true}
                  useRange={false}
                  minDate={formData.start_date}
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
                  Actif
                </label>
                <div className="flex items-center mt-2">
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
              </div>
            </div>
            
            <div className="mb-4">
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
            
            <div className="mb-4">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challenges.map(challenge => (
                <tr key={challenge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-amber-100">
                        {challenge.type === 'review' && <Star className="text-amber-600" size={18} />}
                        {challenge.type === 'food' && <Cake className="text-amber-600" size={18} />}
                        {challenge.type === 'cosmetics' && <Droplet className="text-amber-600" size={18} />}
                        {challenge.type === 'engagement' && <Users className="text-amber-600" size={18} />}
                        {challenge.type === 'photo' && <Camera className="text-amber-600" size={18} />}
                        {challenge.type === 'shopping' && <ShoppingBag className="text-amber-600" size={18} />}
                        {!['review', 'food', 'cosmetics', 'engagement', 'photo', 'shopping'].includes(challenge.type) && 
                          <Trophy className="text-amber-600" size={18} />
                        }
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
  );
};

// Fonction utilitaire pour calculer la durée
function calculateDuration(startDateStr, endDateStr) {
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
}

export default PendingChallenges;