// src/components/login/SignUp.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { Eye, EyeOff, MapPin } from 'lucide-react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // Ajouter les états pour les nouveaux champs
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await registerUser(email, password, displayName, {
      country, 
      city, 
      postalCode
    });
    navigate('/');
} catch (error) {
  // Personnaliser les messages d'erreur courants
  switch (error.code) {
    case 'auth/email-already-in-use':
      setError('Cet email a déjà un compte');
      break;
    case 'auth/invalid-email':
      setError('Adresse email invalide');
      break;
    case 'auth/weak-password':
      setError('Le mot de passe est trop faible');
      break;
    default:
      setError(error.message);
  }
}
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="displayName">Nom /</label>
          <input
            type="text"
            id="displayName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
        </div>
        
        {/* Bouton pour afficher/masquer les champs d'adresse */}
        <button
          type="button"
          className="w-full py-2 px-4 mb-4 text-green-600 border border-green-300 rounded-md hover:bg-green-50 flex items-center justify-center"
          onClick={() => setShowAddressFields(!showAddressFields)}
        >
          <MapPin size={18} className="mr-2" />
          {showAddressFields ? 'Masquer les informations d\'adresse' : 'Ajouter des informations d\'adresse'}
        </button>
        
        {/* Champs d'adresse (conditionnellement affichés) */}
        {showAddressFields && (
          <div className="mb-6 border p-4 rounded-md border-green-200 bg-green-50">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Informations d'adresse (optionnel)</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="country">
                Pays
              </label>
              <input
                type="text"
                id="country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="city">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Création en cours...' : 'Créer un compte'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-800">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;