// src/components/PageNutri.js
import React from 'react';
import { Star, Lock } from 'lucide-react';
import useSubscriptionPermissions from '../hooks/useSubscriptionPermissions';

const PageNutri = ({ product, renderIngredients, ingredientsLanguage, setIngredientsLanguage, languageButtonStyle }) => {
  // Utiliser le hook personnalisé pour vérifier les autorisations
  const { isAuthorized } = useSubscriptionPermissions();
  
  // Vérifier si l'utilisateur a accès aux informations nutritionnelles détaillées
  const hasNutriAccess = isAuthorized('nutrition_info');
  
  // Style CSS pour les sections restreintes (floutées)
  const restrictedSectionStyle = {
    position: 'relative',
    filter: 'blur(8px)',
    pointerEvents: 'none',
    userSelect: 'none',
  };
  
  // Composant pour overlay de restriction avec message
  const RestrictedOverlay = ({ title }) => (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-md border border-gray-200">
      <Lock className="text-gray-500 mb-3" size={32} />
      <p className="text-center font-medium text-gray-800 mb-1">{title}</p>
      <p className="text-center text-gray-600 text-sm mb-4">Disponible avec un abonnement premium</p>
      <button 
        className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
        onClick={() => window.location.href = '/abonnements'}
      >
        Voir les abonnements
      </button>
    </div>
  );

  if (!product) return null;

  return (
    <div>
      {/* Informations nutritionnelles - toujours visibles */}
      <h3 className="text-lg font-semibold mb-3">Valeurs nutritionnelles</h3>
      {product.nutriments ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">Énergie:</span> {product.nutriments.energy_100g || 'N/A'} {product.nutriments.energy_unit || 'kcal'}
              {product.nutriments.energy_kcal_100g && <span className="text-sm text-gray-600 ml-1">({product.nutriments.energy_kcal_100g} kcal)</span>}
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">Matières grasses:</span> {product.nutriments.fat_100g || 'N/A'} g
              {product.nutriments.saturated_fat_100g && (
                <div className="text-sm text-gray-600">dont saturées: {product.nutriments.saturated_fat_100g} g</div>
              )}
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">Glucides:</span> {product.nutriments.carbohydrates_100g || 'N/A'} g
              {product.nutriments.sugars_100g && (
                <div className="text-sm text-gray-600">dont sucres: {product.nutriments.sugars_100g} g</div>
              )}
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">Protéines:</span> {product.nutriments.proteins_100g || 'N/A'} g
            </div>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">Sel:</span> {product.nutriments.salt_100g || 'N/A'} g
            </div>
            {product.nutriments.fiber_100g && (
              <div className="p-2 bg-gray-100 rounded-md">
                <span className="font-medium">Fibres:</span> {product.nutriments.fiber_100g} g
              </div>
            )}
            {product.nutriments.alcohol_100g && (
              <div className="p-2 bg-gray-100 rounded-md">
                <span className="font-medium">Alcool:</span> {product.nutriments.alcohol_100g} %
              </div>
            )}
            {product.nutriments.water_100g && (
              <div className="p-2 bg-gray-100 rounded-md">
                <span className="font-medium">Eau:</span> {product.nutriments.water_100g} %
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Informations nutritionnelles non disponibles</p>
      )}
      
      {/* Ingrédients avec sélecteur de langue - toujours visibles */}
      {(product.ingredients_text_fr || product.ingredients_text_en || product.ingredients_text) && (
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-3">Ingrédients</h3>
            <div className="flex space-x-1">
              <button 
                onClick={() => setIngredientsLanguage('fr')}
                className={languageButtonStyle(ingredientsLanguage, 'fr')}
                disabled={!product.ingredients_text_fr}
              >
                FR
              </button>
              <button 
                onClick={() => setIngredientsLanguage('en')}
                className={languageButtonStyle(ingredientsLanguage, 'en')}
                disabled={!product.ingredients_text_en}
              >
                EN
              </button>
              <button 
                onClick={() => setIngredientsLanguage('origin')}
                className={languageButtonStyle(ingredientsLanguage, 'origin')}
                disabled={!product.ingredients_text}
              >
                Origine
              </button>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-gray-700">{renderIngredients()}</p>
            {product.ingredients_n && (
              <p className="text-sm text-gray-500 mt-2">
                {product.ingredients_n} ingrédients identifiés
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Allergènes - toujours visibles */}
      {(product.allergens || product.allergens_tags?.length > 0 || product.traces || product.traces_tags?.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Allergènes</h3>
            <div className="p-3 bg-red-50 rounded-md">
            {(product.allergens || product.allergens_tags?.length > 0) && (
              <div className="mb-2">
                <p className="font-medium text-red-700">Contient :</p>
                <div className="flex flex-wrap gap-1 mt-1">
                
                  {product.allergens_tags ? (
                    product.allergens_tags.map((allergen, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                        {allergen.replace('en:', '')}
                      </span>
                      
                    ))
                  ) : (
                    <span className="text-gray-700">{product.allergens}</span>
                  )}
                  {product.allergens_imported && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                      {product.allergens_imported}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {(product.traces || product.traces_tags?.length > 0) && (
              <div>
                <p className="font-medium text-orange-700">Peut contenir :</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.traces_tags ? (
                    product.traces_tags.map((trace, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                        {trace.replace('en:', '')}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-700">{product.traces}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* SECTION RESTREINTE: Additifs - visible uniquement avec can_nutri */}
      {product.additives_tags && product.additives_tags.length > 0 && (
        <div className="mt-6 relative">
          <div style={!hasNutriAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-2">Additifs</h3>
            
            <div className="p-3 bg-yellow-50 rounded-md relative">
              <div className="flex flex-wrap gap-1">
                {product.additives_tags.map((additive, index) => {
                  const additiveName = additive.replace('en:', '');
                  const additiveCode = additiveName.split(' - ')[0];
                  const additiveLabel = additiveName.includes(' - ') ? additiveName.split(' - ')[1] : '';
                  
                  return (
                    <div key={index} className="bg-yellow-100 px-3 py-1 rounded-md m-1">
                      <span className="font-medium text-yellow-800">{additiveCode}</span>
                      {additiveLabel && <span className="text-gray-700 text-sm ml-1">({additiveLabel})</span>}
                    </div>
                  );
                })}
              </div>
              
              {product.additives_n && (
                <p className="text-sm text-gray-600 mt-2">
                  Nombre d'additifs : {product.additives_n}
                </p>
              )}
            </div>
          </div>
          
          {!hasNutriAccess && <RestrictedOverlay title="Informations sur les additifs" />}
        </div>
      )}
      
      {/* SECTION RESTREINTE: Statut végétarien/végan - visible uniquement avec can_nutri */}
      {product.ingredients_analysis_tags && (
        <div className="mt-6 relative">
          <div style={!hasNutriAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-3">Régimes spécifiques</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Végétarien */}
              {product.ingredients_analysis_tags.filter(tag => tag.includes('vegetarian')).length > 0 && (
                <div className="p-3 rounded-md bg-green-50">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('non-vegetarian') 
                        ? 'bg-red-500' 
                        : product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('vegetarian-status-unknown')
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}></div>
                    <h4 className="font-medium">Végétarien</h4>
                  </div>
                  <p className="text-sm mt-1 ml-5">
                    {product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('vegetarian-status-unknown') 
                      ? 'Statut végétarien incertain' 
                      : product.ingredients_analysis_tags.find(tag => tag.includes('vegetarian')).includes('non-vegetarian') 
                        ? 'Non végétarien' 
                        : 'Végétarien'}
                  </p>
                </div>
              )}
              
              {/* Végan */}
              {product.ingredients_analysis_tags.filter(tag => tag.includes('vegan')).length > 0 && (
                <div className="p-3 rounded-md bg-green-50">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('non-vegan') 
                        ? 'bg-red-500' 
                        : product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('vegan-status-unknown')
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}></div>
                    <h4 className="font-medium">Végan</h4>
                  </div>
                  <p className="text-sm mt-1 ml-5">
                    {product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('vegan-status-unknown') 
                      ? 'Statut végan incertain' 
                      : product.ingredients_analysis_tags.find(tag => tag.includes('vegan')).includes('non-vegan') 
                        ? 'Non végan' 
                        : 'Végan'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!hasNutriAccess && <RestrictedOverlay title="Analyse des régimes alimentaires" />}
        </div>
      )}
      
      {/* SECTION RESTREINTE: Nutriscore - visible uniquement avec can_nutri */}
      {product.nutriscore_grade && (
        <div className="mt-6 relative">
          <div style={!hasNutriAccess ? restrictedSectionStyle : {}} className="relative">
            <h4 className="text-lg font-semibold mb-2">Nutri-Score</h4>
            
            <div className="flex items-center">
              <div className="flex space-x-1">
                {['a', 'b', 'c', 'd', 'e'].map((grade) => (
                  <div 
                    key={grade} 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white 
                      ${product.nutriscore_grade === grade ? 'ring-2 ring-offset-2 ring-green-500 transform scale-110' : ''}
                      ${grade === 'a' ? 'bg-green-500' : 
                        grade === 'b' ? 'bg-green-300' : 
                        grade === 'c' ? 'bg-yellow-400' : 
                        grade === 'd' ? 'bg-orange-400' : 
                        'bg-red-500'}`}
                  >
                    {grade.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="ml-4 text-sm text-gray-600">
                <p>Le Nutri-Score est un indicateur nutritionnel qui note les produits de A à E, où A représente les produits les plus sains et E les moins sains.</p>
                {product.nutriscore_data && product.nutriscore_data.is_beverage && product.nutriments.alcohol_100g && (
                  <p className="mt-1 text-orange-600">(Non applicable car boisson alcoolisée)</p>
                )}
              </div>
            </div>
          </div>
          
          {!hasNutriAccess && <RestrictedOverlay title="Nutri-Score détaillé" />}
        </div>
      )}
          
      {/* SECTION RESTREINTE: NOVA - visible uniquement avec can_nutri */}
      {product.nova_group && (
        <div className="mt-6 relative">
          <div style={!hasNutriAccess ? restrictedSectionStyle : {}} className="relative">
            <h4 className="text-lg font-semibold mb-2">Classification NOVA</h4>
            
            <div className="flex items-center">
              <div className={`px-4 py-2 rounded-md text-white font-medium
                ${product.nova_group === 1 ? 'bg-green-500' : 
                product.nova_group === 2 ? 'bg-yellow-400' : 
                product.nova_group === 3 ? 'bg-orange-400' : 
                'bg-red-500'}`}>
                Groupe {product.nova_group}
              </div>
              <span className="text-sm text-gray-600 ml-3">
                {product.nova_group === 1 ? 'Aliment non transformé ou peu transformé' : 
                 product.nova_group === 2 ? 'Ingrédient culinaire transformé' : 
                 product.nova_group === 3 ? 'Aliment transformé' : 
                 'Aliment ultra-transformé'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">La classification NOVA catégorise les aliments selon leur degré de transformation industrielle.</p>
          </div>
          
          {!hasNutriAccess && <RestrictedOverlay title="Classification NOVA" />}
        </div>
      )}
    </div>
  );
};

export default PageNutri;