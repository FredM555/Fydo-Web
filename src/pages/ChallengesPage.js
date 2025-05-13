// src/pages/ChallengesPage.js
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  CalendarClock, 
  Star, 
  Clock, 
  Award, 
  Gift, 
  TrendingUp,
  Users,
  Crown,
  Search,
  AlertCircle,
  Loader,
  Camera,
  Cake,
  ShoppingBag,
  Droplet,
  ChevronRight,
  Sparkles,
  Lock,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import challengeService from '../services/challengeService';

// Mapping des types de challenges avec leurs icônes
const CHALLENGE_ICONS = {
  'food': <Cake size={24} />,
  'cosmetics': <Droplet size={24} />,
  'shopping': <ShoppingBag size={24} />,
  'engagement': <Users size={24} />,
  'review': <Star size={24} />,
  'photo': <Camera size={24} />,
  'default': <Trophy size={24} />
};

// Mapping des statuts avec leurs icônes
const STATUS_ICONS = {
  'bronze': <Award size={16} />,
  'silver': <Award size={16} />,
  'gold': <Award size={16} />,
  'diamond': <Crown size={16} />,
  'default': <Award size={16} />
};

// Fonction pour obtenir l'icône du statut
const getStatusIcon = (status) => {
  const statusKey = status?.toLowerCase() || 'default';
  return STATUS_ICONS[statusKey] || STATUS_ICONS.default;
};

// Composant pour afficher une icône selon le type de challenge
const ChallengeIcon = ({ type, className }) => {
  const iconComponent = CHALLENGE_ICONS[type?.toLowerCase()] || CHALLENGE_ICONS.default;
  return React.cloneElement(iconComponent, { className });
};

// Composant pour afficher une icône selon le type de badge
const BadgeIcon = ({ type, className, size }) => {
  // Même mapping d'icônes que pour les challenges
  const iconComponent = CHALLENGE_ICONS[type?.toLowerCase()] || CHALLENGE_ICONS.default;
  return React.cloneElement(iconComponent, { className, size });
};

// Fonctions utilitaires
function calculateRemainingDays(endDateStr) {
  if (!endDateStr) return 'bientôt';
  
  const endDate = new Date(endDateStr);
  const today = new Date();
  
  // Calculer la différence en jours
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'aujourd\'hui';
  if (diffDays === 1) return 'demain';
  return `${diffDays} jours`;
}

function getBadgeColor(type) {
  const colors = {
    'achievement': 'amber',
    'engagement': 'green',
    'special': 'purple',
    'review': 'blue',
    'streak': 'orange',
    'default': 'gray'
  };
  
  return colors[type?.toLowerCase()] || colors.default;
}

const ChallengesPage = () => {
  // État pour suivre les challenges actifs vs terminés
  const [activeTab, setActiveTab] = useState('active');
  const { currentUser, userDetails } = useAuth();
  
  // États pour stocker les données de challenges
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  
  // Ajout d'un état pour les badges à débloquer
  const [upcomingBadges, setUpcomingBadges] = useState([]);
  
  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour la nouvelle fenêtre modale de félicitations
  const [showCelebration, setShowCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  
  // État pour la section en cours de mise en avant
  const [activeSection, setActiveSection] = useState('weekly');

  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!currentUser || !userDetails?.id) return;
      
      setLoading(true);
      try {
        // Charger les challenges actifs
        const { success: activeSuccess, data: activeData, error: activeError } = 
          await challengeService.getActiveUserChallenges(userDetails.id);
        
        if (activeSuccess) {
          setActiveChallenges(activeData || []);
        } else if (activeError) {
          throw new Error(activeError);
        }
        
        // Charger les challenges terminés
        const { success: completedSuccess, data: completedData, error: completedError } = 
          await challengeService.getCompletedUserChallenges(userDetails.id);
        
        if (completedSuccess) {
          setCompletedChallenges(completedData || []);
        } else if (completedError) {
          throw new Error(completedError);
        }
        
        // Charger les badges
        const { success: badgesSuccess, data: badgesData, error: badgesError } = 
          await challengeService.getUserBadges(userDetails.id);
        
        if (badgesSuccess) {
          setBadges(badgesData || []);
          
          // Simuler des badges à débloquer prochainement
          // Dans une version réelle, cela viendrait de l'API
          setUpcomingBadges([
            {
              id: 'upcoming-1',
              name: 'Expert Pâtisserie',
              type: 'food',
              description: 'Publiez 20 avis sur des produits de pâtisserie',
              progress: 12,
              goal: 20,
              reward_points: 150
            },
            {
              id: 'upcoming-2',
              name: 'Critique Pro',
              type: 'review',
              description: 'Recevez 15 likes sur vos avis',
              progress: 8,
              goal: 15,
              reward_points: 200
            },
            {
              id: 'upcoming-3',
              name: 'Streak Mensuel',
              type: 'streak',
              description: 'Publiez un avis chaque jour pendant 10 jours',
              progress: 7,
              goal: 10,
              reward_points: 250
            }
          ]);
          
        } else if (badgesError) {
          throw new Error(badgesError);
        }
        
        // Charger les infos de niveau
        const { success: levelSuccess, data: levelData, error: levelError } = 
          await challengeService.getUserLevelInfo(userDetails.id);
        
        if (levelSuccess) {
          setLevelInfo(levelData);
        } else if (levelError) {
          throw new Error(levelError);
        }
        
      } catch (err) {
        console.error("Erreur lors du chargement des challenges:", err);
        setError("Impossible de charger vos challenges. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
    
    // Simuler une récompense récente (démo)
    const hasSeenReward = localStorage.getItem('hasSeenChallengeReward');
    if (!hasSeenReward) {
      setTimeout(() => {
        setNewBadge({
          name: "Explorateur",
          type: "engagement",
          points: 100
        });
        setShowCelebration(true);
        localStorage.setItem('hasSeenChallengeReward', 'true');
      }, 1500);
    }
  }, [currentUser, userDetails?.id]);

  // Fonction pour mettre à jour la progression d'un challenge (serait connectée à des actions réelles)
  const handleUpdateProgress = async (userChallengeId, newProgress) => {
    try {
      const { success, data, error: updateError } = 
        await challengeService.updateChallengeProgress(userChallengeId, newProgress);
      
      if (success) {
        // Mettre à jour la liste des challenges actifs
        setActiveChallenges(prev => 
          prev.map(c => c.id === userChallengeId ? { ...c, current_progress: newProgress } : c)
        );
        
        // Si le challenge est terminé, recharger les challenges
        if (data.is_completed) {
          const { success: activeSuccess, data: activeData } = 
            await challengeService.getActiveUserChallenges(userDetails.id);
          
          const { success: completedSuccess, data: completedData } = 
            await challengeService.getCompletedUserChallenges(userDetails.id);
          
          if (activeSuccess) setActiveChallenges(activeData || []);
          if (completedSuccess) setCompletedChallenges(completedData || []);
        }
      } else if (updateError) {
        console.error("Erreur lors de la mise à jour:", updateError);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du challenge:", err);
    }
  };

  // Regrouper les challenges par catégorie
  const groupChallengesByCategory = (challenges) => {
    const grouped = {};
    
    challenges.forEach(challenge => {
      const category = challenge.challenges?.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(challenge);
    });
    
    return grouped;
  };

  // Challenges actifs groupés par catégorie
  const activeGrouped = groupChallengesByCategory(activeChallenges);

  // Si chargement
  if (loading) {
    return (
      <div className="bg-green-50 min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" />
          <p className="text-green-700">Chargement de vos challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Challenges | Fydo</title>
        <meta name="description" content="Participez aux challenges Fydo, partagez vos avis et gagnez des récompenses exclusives!" />
      </Helmet>

      {/* Fenêtre modale de célébration */}
      {showCelebration && newBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md animate-bounceIn">
            <div className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center">
                  <BadgeIcon type={newBadge.type} className="text-white" size={40} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="text-yellow-400" size={24} />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <Sparkles className="text-yellow-400" size={20} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1">Félicitations!</h3>
              <p className="text-amber-600 font-semibold mb-3">Vous avez débloqué un nouveau badge</p>
              <div className="bg-amber-50 rounded-lg py-3 px-4 mb-4">
                <p className="font-bold text-amber-800">{newBadge.name}</p>
                <p className="text-sm text-gray-600 mt-1">+{newBadge.points} points</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Continuez à partager vos avis pour débloquer d'autres badges et augmenter votre niveau!
              </p>
              <button 
                onClick={() => setShowCelebration(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
              >
                Super!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de la page avec effet de particules dorées */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-md p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Particules dorées (simulées avec des div absolus) */}
              <div className="absolute h-2 w-2 rounded-full bg-yellow-300 opacity-60" style={{ top: '15%', left: '10%' }}></div>
              <div className="absolute h-3 w-3 rounded-full bg-yellow-200 opacity-50" style={{ top: '60%', left: '20%' }}></div>
              <div className="absolute h-2 w-2 rounded-full bg-yellow-300 opacity-40" style={{ top: '30%', left: '80%' }}></div>
              <div className="absolute h-1 w-1 rounded-full bg-yellow-200 opacity-60" style={{ top: '70%', left: '90%' }}></div>
              <div className="absolute h-2 w-2 rounded-full bg-yellow-300 opacity-50" style={{ top: '40%', left: '40%' }}></div>
              <div className="absolute h-1 w-1 rounded-full bg-yellow-200 opacity-30" style={{ top: '80%', left: '30%' }}></div>
              <div className="absolute h-3 w-3 rounded-full bg-yellow-300 opacity-40" style={{ top: '20%', left: '70%' }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Trophy className="mr-3" size={32} />
                  Vos Challenges
                </h1>
                <p className="text-amber-100">
                  Bienvenue {userDetails?.display_name || currentUser?.displayName || ''}! 
                  Relevez des défis et gagnez des récompenses exclusives.
                </p>
              </div>
              
              {/* Niveau de l'utilisateur */}
              {levelInfo && (
                <div className="mt-4 md:mt-0 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 shadow-inner">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
                      <span className="text-amber-500 font-bold text-lg">{parseInt(levelInfo.currentPoints / 100)}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Niveau {levelInfo.currentStatus}</div>
                      <div className="text-xs text-amber-100">{levelInfo.currentPoints} points</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Prochain badge à débloquer - Section mise en avant */}
          {upcomingBadges && upcomingBadges.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-2 border-amber-200">
              <div className="flex flex-col md:flex-row items-center">
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  {/* Anneau de progression */}
                  <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                      {/* Cercle de fond */}
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="transparent" 
                        stroke="#f5f5f5" 
                        strokeWidth="10"
                      />
                      {/* Cercle de progression - le stroke-dasharray est la circonférence (2πr) */}
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="transparent" 
                        stroke="#f59e0b" 
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * upcomingBadges[0].progress / upcomingBadges[0].goal)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    {/* Icône du badge */}
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center z-10">
                      <BadgeIcon 
                        type={upcomingBadges[0].type} 
                        className="text-amber-500" 
                        size={28} 
                      />
                    </div>
                  </div>
                  {/* Effet de particules autour du badge */}
                  <div className="absolute top-0 right-0">
                    <Sparkles className="text-amber-300" size={16} />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="text-amber-500 font-medium text-sm mb-1">PROCHAIN BADGE</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{upcomingBadges[0].name}</h3>
                  <p className="text-gray-600 mb-3">{upcomingBadges[0].description}</p>
                  
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <div className="text-sm font-medium text-gray-700 mr-3">
                      {upcomingBadges[0].progress}/{upcomingBadges[0].goal}
                    </div>
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 rounded-full h-2" 
                        style={{ width: `${(upcomingBadges[0].progress / upcomingBadges[0].goal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="ml-3 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
                      +{upcomingBadges[0].reward_points} pts
                    </div>
                  </div>
                  
                  <Link 
                    to="/recherche-filtre" 
                    className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Scanner des produits pour progresser <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs des challenges */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white rounded-full shadow-sm p-1">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeTab === 'active'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                En cours
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Terminés
              </button>
            </div>
            
            {/* Sélecteur de catégorie */}
            {activeTab === 'active' && Object.keys(activeGrouped).length > 1 && (
              <div className="bg-white rounded-full shadow-sm p-1">
                {Object.keys(activeGrouped).map(category => (
                  <button 
                    key={category}
                    onClick={() => setActiveSection(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activeSection === category
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category === 'weekly' ? 'Hebdo' : 
                     category === 'monthly' ? 'Mensuel' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Afficher les erreurs s'il y en a */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <p>{error}</p>
            </div>
          )}

          {activeTab === 'active' ? (
            <>
              {/* Pas de challenges actifs */}
              {Object.keys(activeGrouped).length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 text-center mb-8">
                  <Trophy className="text-gray-400 mx-auto mb-3" size={40} />
                  <p className="text-gray-600">
                    Vous n'avez pas de challenges actifs pour le moment. 
                    De nouveaux challenges seront disponibles prochainement!
                  </p>
                </div>
              )}
            
              {/* Affichage dynamique des challenges actifs par catégorie */}
              {Object.entries(activeGrouped).map(([category, challenges]) => (
                <div 
                  key={category} 
                  className={`bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300 ${
                    activeSection === category ? 'ring-2 ring-amber-300' : ''
                  }`}
                >
                  <div className={`border-b border-gray-100 px-6 py-4 flex items-center ${
                    category === 'weekly' ? 'bg-amber-50' : 
                    category === 'monthly' ? 'bg-purple-50' : 
                    'bg-blue-50'
                  }`}>
                    <div className="flex items-center flex-1">
                      <div className={`w-8 h-8 rounded-full ${
                        category === 'weekly' ? 'bg-amber-100' : 
                        category === 'monthly' ? 'bg-purple-100' : 
                        'bg-blue-100'
                      } flex items-center justify-center mr-3`}>
                        {category === 'weekly' ? 
                          <Calendar className="text-amber-600" size={16} /> : 
                          category === 'monthly' ? 
                          <CalendarClock className="text-purple-600" size={16} /> : 
                          <Trophy className="text-blue-600" size={16} />
                        }
                      </div>
                      
                      <h2 className={`text-xl font-semibold ${
                        category === 'weekly' ? 'text-amber-800' : 
                        category === 'monthly' ? 'text-purple-800' : 
                        'text-blue-800'
                      }`}>
                        {category === 'weekly' ? 'Challenges hebdomadaires' : 
                         category === 'monthly' ? 'Challenges mensuels' : 
                         category.charAt(0).toUpperCase() + category.slice(1)}
                      </h2>
                    </div>
                    
                    {/* Afficher le temps restant pour le premier challenge de la catégorie */}
                    {challenges.length > 0 && challenges[0].challenges?.end_date && (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {calculateRemainingDays(challenges[0].challenges.end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 grid gap-4">
                    {challenges.map(challenge => (
                      <div 
                        key={challenge.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-amber-300"
                      >
                        <div className="flex items-start">
                          <div className={`${
                            category === 'weekly' ? 'bg-amber-100' : 
                            category === 'monthly' ? 'bg-purple-100' : 
                            'bg-blue-100'
                          } p-3 rounded-lg mr-4 relative`}>
                            <ChallengeIcon 
                              type={challenge.challenges?.type} 
                              className={`${
                                category === 'weekly' ? 'text-amber-600' : 
                                category === 'monthly' ? 'text-purple-600' : 
                                'text-blue-600'
                              }`} 
                            />
                            
                            {/* Pourcentage de complétion circulaire */}
                            <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="transparent" 
                                stroke={
                                  category === 'weekly' ? 'rgba(251, 191, 36, 0.2)' : 
                                  category === 'monthly' ? 'rgba(167, 139, 250, 0.2)' : 
                                  'rgba(96, 165, 250, 0.2)'
                                }
                                strokeWidth="8"
                              />
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="transparent" 
                                stroke={
                                  category === 'weekly' ? 'rgb(251, 191, 36)' : 
                                  category === 'monthly' ? 'rgb(167, 139, 250)' : 
                                  'rgb(96, 165, 250)'
                                }
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * challenge.current_progress / challenge.target_progress)}
                              />
                            </svg>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-800">{challenge.challenges?.title || 'Challenge'}</h3>
                              <span className={`${
                                category === 'weekly' ? 'bg-amber-100 text-amber-700' : 
                                category === 'monthly' ? 'bg-purple-100 text-purple-700' : 
                                'bg-blue-100 text-blue-700'
                              } text-xs px-2 py-1 rounded-full font-medium flex items-center`}>
                                <Zap size={12} className="mr-1" />
                                {challenge.challenges?.reward_points || 0} pts
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mt-1 mb-3">
                              {challenge.challenges?.description || 'Complétez ce challenge pour gagner des points'}
                            </p>
                            
                            <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold inline-block text-green-600">
                                    {challenge.current_progress}/{challenge.target_progress} {challenge.challenges?.unit || 'avis'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-semibold inline-block text-green-600">
                                    {Math.round((challenge.current_progress/challenge.target_progress) * 100)}%
                                  </span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-green-100">
                                <div 
                                  style={{ width: `${(challenge.current_progress/challenge.target_progress) * 100}%` }} 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 rounded-full transition-all duration-500 ease-out"
                                ></div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`${
                                  category === 'weekly' ? 'bg-amber-100' : 
                                  category === 'monthly' ? 'bg-purple-100' : 
                                  'bg-blue-100'
                                } p-1 rounded-full`}>
                                  <Award className={`${
                                    category === 'weekly' ? 'text-amber-500' : 
                                    category === 'monthly' ? 'text-purple-500' : 
                                    'text-blue-500'
                                  }`} size={16} />
                                </div>
                                <div className="ml-2 text-sm text-gray-600">
                                  {challenge.challenges?.reward_description || 'Badge spécial + points'}
                                </div>
                              </div>
                              
                              <Link 
                                to="/recherche-filtre" 
                                className={`text-xs font-medium px-3 py-1 rounded-full ${
                                  category === 'weekly' ? 'text-amber-600 hover:bg-amber-50' : 
                                  category === 'monthly' ? 'text-purple-600 hover:bg-purple-50' : 
                                  'text-blue-600 hover:bg-blue-50'
                                } transition-colors flex items-center`}
                              >
                                Participer <ChevronRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Section pour les challenges terminés - Redesign plus attrayant
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="border-b border-gray-100 bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Crown className="mr-2" size={20} />
                  Défis relevés avec succès
                </h2>
              </div>
              
              <div className="p-6">
                {completedChallenges.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Trophy className="text-gray-300 mx-auto mb-2" size={32} />
                    <p>Vous n'avez pas encore complété de challenges.</p>
                    <p className="text-sm">Commencez par relever vos défis actifs!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {completedChallenges.map(challenge => (
                      <div key={challenge.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-3 rounded-lg mr-4 relative">
                            <ChallengeIcon 
                              type={challenge.challenges?.type} 
                              className="text-green-600" 
                            />
                            {/* Icône de succès */}
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-800">{challenge.challenges?.title || 'Challenge'}</h3>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                                <Trophy size={12} className="mr-1" />
                                Complété
                              </span>
                            </div>
                            
                            <p className="text-gray-500 mt-1">
                              {challenge.completed_date ? 
                                `Terminé le ${new Date(challenge.completed_date).toLocaleDateString()}` : 
                                'Challenge terminé'
                              } - {challenge.target_progress} {challenge.challenges?.unit || 'avis'}
                            </p>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-green-100 p-1 rounded-full">
                                  <Award className="text-green-500" size={16} />
                                </div>
                                <div className="ml-2 text-sm text-gray-600">
                                  {challenge.challenges?.reward_description || 'Badge spécial + points'}
                                </div>
                              </div>
                              
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                +{challenge.challenges?.reward_points || 50} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Section Collection de Badges - Redesign complet */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Award className="mr-2" size={20} />
                Votre Collection de Badges
              </h2>
            </div>
            
            <div className="p-6">
              {/* Progression du niveau - Redesign */}
              {levelInfo && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                        levelInfo.currentStatus === 'bronze' ? 'from-amber-500 to-amber-600' :
                        levelInfo.currentStatus === 'silver' ? 'from-gray-400 to-gray-500' :
                        levelInfo.currentStatus === 'gold' ? 'from-yellow-400 to-yellow-500' :
                        'from-blue-400 to-blue-500'
                      } flex items-center justify-center mr-2`}>
                        {getStatusIcon(levelInfo.currentStatus)}
                      </div>
                      <span className="text-sm font-medium">
                        Niveau {levelInfo.currentStatus?.charAt(0).toUpperCase() + levelInfo.currentStatus?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Niveau {levelInfo.nextLevel?.name?.charAt(0).toUpperCase() + levelInfo.nextLevel?.name?.slice(1)}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                        levelInfo.nextLevel?.name === 'bronze' ? 'from-amber-500 to-amber-600' :
                        levelInfo.nextLevel?.name === 'silver' ? 'from-gray-400 to-gray-500' :
                        levelInfo.nextLevel?.name === 'gold' ? 'from-yellow-400 to-yellow-500' :
                        'from-blue-400 to-blue-500'
                      } flex items-center justify-center ml-2 opacity-60`}>
                        {getStatusIcon(levelInfo.nextLevel?.name)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 h-3 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-3 rounded-full ${
                        levelInfo.currentStatus === 'bronze' ? 'bg-amber-500' :
                        levelInfo.currentStatus === 'silver' ? 'bg-gray-400' :
                        levelInfo.currentStatus === 'gold' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`}
                      style={{ width: `${levelInfo.progress}%` }}
                    ></div>
                    
                    {/* Points de passage animés */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white opacity-70"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-70"></div>
                      <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white opacity-70"></div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <div className="flex flex-col items-center">
                      <span>{levelInfo.currentPoints}</span>
                      <span>points</span>
                    </div>
                    <div className="flex flex-col items-center opacity-50">
                      <span>{Math.floor(levelInfo.nextLevel?.required_points / 4)}</span>
                      <span>25%</span>
                    </div>
                    <div className="flex flex-col items-center opacity-50">
                      <span>{Math.floor(levelInfo.nextLevel?.required_points / 2)}</span>
                      <span>50%</span>
                    </div>
                    <div className="flex flex-col items-center opacity-50">
                      <span>{Math.floor(levelInfo.nextLevel?.required_points * 3 / 4)}</span>
                      <span>75%</span>
                    </div>
                    <div className="flex flex-col items-center opacity-70">
                      <span>{levelInfo.nextLevel?.required_points}</span>
                      <span>objectif</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Badges débloqués et badges à venir */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <Star className="text-amber-500 mr-2" size={16} />
                  Badges débloqués ({badges.length})
                </h3>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {/* Badges de l'utilisateur avec animations */}
                  {badges.map(userBadge => (
                    <div 
                      key={userBadge.id} 
                      className={`bg-${getBadgeColor(userBadge.badges?.type)}-100 rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-all duration-200 transform hover:scale-105 hover:bg-${getBadgeColor(userBadge.badges?.type)}-200 cursor-pointer`}
                    >
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-${getBadgeColor(userBadge.badges?.type)}-200 flex items-center justify-center mb-3`}>
                          <BadgeIcon 
                            type={userBadge.badges?.type} 
                            className={`text-${getBadgeColor(userBadge.badges?.type)}-600`}
                            size={32} 
                          />
                        </div>
                        {/* Badge d'authenticité */}
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                      <span className={`text-sm text-center font-medium text-${getBadgeColor(userBadge.badges?.type)}-700`}>
                        {userBadge.badges?.name || 'Badge'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(userBadge.earned_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Prochains badges à débloquer */}
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <Lock className="text-gray-500 mr-2" size={16} />
                  Badges à débloquer ({upcomingBadges.length})
                </h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {/* Badges à débloquer */}
                  {upcomingBadges.map(badge => (
                    <div 
                      key={badge.id} 
                      className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-amber-300 hover:bg-amber-50 transition-colors relative group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                        <BadgeIcon 
                          type={badge.type} 
                          className="text-gray-400 group-hover:text-amber-500 transition-colors"
                          size={32} 
                        />
                      </div>
                      <span className="text-sm text-center font-medium text-gray-500 group-hover:text-amber-700 transition-colors">
                        {badge.name}
                      </span>
                      
                      {/* Progrès circulaire autour du badge */}
                      <svg className="absolute top-0 left-0 w-full h-full -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="48" 
                          fill="transparent" 
                          stroke="rgba(245, 158, 11, 0.2)"
                          strokeWidth="3"
                        />
                        <circle 
                          cx="50" cy="50" r="48" 
                          fill="transparent" 
                          stroke="rgb(245, 158, 11)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="302"
                          strokeDashoffset={302 - (302 * badge.progress / badge.goal)}
                        />
                      </svg>
                      
                      {/* Popup d'explication au survol */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="text-xs text-gray-600">
                          <p className="font-medium text-amber-600 mb-1">{badge.name}</p>
                          <p className="mb-1">{badge.description}</p>
                          <div className="flex items-center justify-between">
                            <span>{badge.progress}/{badge.goal}</span>
                            <span className="text-amber-600">+{badge.reward_points} pts</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Badges mystères */}
                  {Array(Math.max(0, 8 - upcomingBadges.length - badges.length)).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 opacity-70">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <Lock size={24} className="text-gray-400" />
                      </div>
                      <span className="text-xs text-center text-gray-400">Badge mystère</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/recherche-filtre" className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors">
                  <Search className="mr-2" size={18} />
                  Commencer à scanner et gagner des badges
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;