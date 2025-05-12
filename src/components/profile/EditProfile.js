// src/components/profile/EditProfile.js
import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Check, AlertCircle, MapPin } from 'lucide-react';
import ProfileLayout from './ProfileLayout';
import { supabase } from '../../supabaseClient';

const EditProfile = () => {
  const { currentUser, refreshUserDetails, userDetails } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  // Ajouter les états pour les nouveaux champs
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Remplir les champs avec les données actuelles de l'utilisateur
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
    
    // Remplir les champs d'adresse s'ils existent dans userDetails
    if (userDetails) {
      setCountry(userDetails.country || '');
      setCity(userDetails.city || '');
      setPostalCode(userDetails.postalCode || '');
    }
  }, [currentUser, userDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification des champs
    if (!displayName.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError('Vous devez être connecté pour modifier votre profil');
        setLoading(false);
        return;
      }
      
      // Mise à jour du profil dans Firebase
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Mise à jour du profil dans Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
        
      if (!userError && userData) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            display_name: displayName,
            // Ajouter les nouveaux champs d'adresse
            country: country,
            city: city,
            postal_code: postalCode
          })
          .eq('id', userData.id);
          
        if (updateError) throw updateError;
      }
      
      // Rafraîchir les informations utilisateur dans le contexte
      await refreshUserDetails();
      
      setSuccess(true);
      
      // Réinitialiser le succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      setError(`Erreur lors de la modification du profil: ${error.message}`);
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileLayout title="Modifier le profil">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded flex items-center">
          <Check size={18} className="mr-2" />
          <span>Profil mis à jour avec succès !</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-5xl font-bold">
            {displayName ? displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'F')}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="displayName">
            Nom / Pseudo
          </label>
          <div className="relative">
            <input
              type="text"
              id="displayName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <User size={18} className="text-gray-500 absolute left-3 top-2.5" />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
            value={email}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            L'adresse email ne peut pas être modifiée
          </p>
        </div>
        
        {/* Nouveaux champs d'adresse */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Informations d'adresse</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="country">
              Pays
            </label>
            <div className="relative">
              <input
                type="text"
                id="country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <MapPin size={18} className="text-gray-500 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="city">
                Ville
              </label>
              <input
                type="text"
                id="city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="postalCode">
                Code postal
              </label>
              <input
                type="text"
                id="postalCode"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className={`flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </form>
    </ProfileLayout>
  );
};

export default EditProfile;