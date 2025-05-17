// src/components/PageEnvir.js
import React from 'react';
import { Lock } from 'lucide-react';
import useSubscriptionPermissions from '../hooks/useSubscriptionPermissions';

const PageEnvir = ({ product }) => {
  // Utiliser le hook personnalisé pour vérifier les autorisations
  const { isAuthorized } = useSubscriptionPermissions();
  
  // Vérifier si l'utilisateur a accès aux informations environnementales détaillées
  const hasEnvirAccess = isAuthorized('nutrition_info'); // On utilise le même droit que pour la nutrition
  
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

  // Function to render the Eco-Score badge
  const renderEcoScoreBadge = (grade) => {
    if (!grade) return null;
    
    const getBgColor = (grade) => {
      switch (grade.toLowerCase()) {
        case 'a': return 'bg-green-500';
        case 'b': return 'bg-green-300';
        case 'c': return 'bg-yellow-400';
        case 'd': return 'bg-orange-400';
        case 'e': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };
    
    return (
      <div className={`${getBgColor(grade)} text-white font-bold text-xl rounded-full w-14 h-14 flex items-center justify-center`}>
        {grade.toUpperCase()}
      </div>
    );
  };

  return (
    <div>
      {/* Emballage - Toujours visible pour tous les utilisateurs */}
      {(product.packaging || product.packaging_text) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Emballage</h3>
          <div className="p-3 bg-green-50 rounded-md">
            {product.packaging && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Type:</span> {product.packaging}
              </p>
            )}
            {product.packaging_text && (
              <p className="text-gray-700">
                <span className="font-medium">Description:</span> {product.packaging_text}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* SECTION RESTREINTE: Conseils de recyclage */}
      {product.packaging_text && product.packaging_text.includes("recycl") && (
        <div className="mb-6 relative">
          <div style={!hasEnvirAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-3">Recyclage</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">{product.packaging_text}</p>
            </div>
          </div>
          
          {!hasEnvirAccess && <RestrictedOverlay title="Conseils de recyclage" />}
        </div>
      )}
      
      {/* SECTION RESTREINTE: Éco-Score */}
      {product.ecoscore_grade ? (
        <div className="mb-8 relative">
          <div style={!hasEnvirAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-3">Éco-Score</h3>
            <div className="flex items-start">
              {renderEcoScoreBadge(product.ecoscore_grade)}
              <div className="ml-4">
                <p className="font-medium">{product.ecoscore_score ? `Score: ${product.ecoscore_score}/100` : ''}</p>
                <p className="text-sm text-gray-600 mt-1">
                  L'Éco-Score évalue l'impact environnemental global des produits alimentaires, de A (faible impact) à E (impact élevé).
                </p>
              </div>
            </div>
            
            {/* Détails de l'éco-score si disponibles */}
            {product.ecoscore_data && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-2">Détails de l'évaluation</h4>
                
                {product.ecoscore_data.adjustments && (
                  <div className="space-y-2">
                    {/* Production */}
                    {product.ecoscore_data.adjustments.production_system && (
                      <div className="flex items-start">
                        <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <span className="text-green-600 text-xs">+{product.ecoscore_data.adjustments.production_system.value}</span>
                        </span>
                        <div>
                          <p className="font-medium text-green-700">Système de production</p>
                          <p className="text-sm text-gray-600">
                            {product.ecoscore_data.adjustments.production_system.label || 'Valeur ajoutée pour production respectueuse de l\'environnement'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Origine */}
                    {product.ecoscore_data.adjustments.origins_of_ingredients && (
                      <div className="flex items-start">
                        <span className={`w-6 h-6 rounded-full ${product.ecoscore_data.adjustments.origins_of_ingredients.value >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mr-2`}>
                          <span className={`${product.ecoscore_data.adjustments.origins_of_ingredients.value >= 0 ? 'text-green-600' : 'text-red-600'} text-xs`}>
                            {product.ecoscore_data.adjustments.origins_of_ingredients.value >= 0 ? '+' : ''}{product.ecoscore_data.adjustments.origins_of_ingredients.value}
                          </span>
                        </span>
                        <div>
                          <p className="font-medium text-gray-700">Origine des ingrédients</p>
                          <p className="text-sm text-gray-600">
                            {product.ecoscore_data.adjustments.origins_of_ingredients.label || product.ecoscore_data.adjustments.origins_of_ingredients.origin || 'Impact lié à la provenance des ingrédients'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Transports */}
                    {product.ecoscore_data.adjustments.packaging && (
                      <div className="flex items-start">
                        <span className={`w-6 h-6 rounded-full ${product.ecoscore_data.adjustments.packaging.value > -5 ? 'bg-yellow-100' : 'bg-red-100'} flex items-center justify-center mr-2`}>
                          <span className="text-red-600 text-xs">
                            {product.ecoscore_data.adjustments.packaging.value}
                          </span>
                        </span>
                        <div>
                          <p className="font-medium text-gray-700">Emballage</p>
                          <p className="text-sm text-gray-600">
                            {product.ecoscore_data.adjustments.packaging.label || product.ecoscore_data.adjustments.packaging.material || 'Impact de l\'emballage sur l\'environnement'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Menaces pour l'environnement */}
                    {product.ecoscore_data.adjustments.threatened_species && (
                      <div className="flex items-start">
                        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <span className="text-red-600 text-xs">
                            {product.ecoscore_data.adjustments.threatened_species.value}
                          </span>
                        </span>
                        <div>
                          <p className="font-medium text-gray-700">Espèces menacées</p>
                          <p className="text-sm text-gray-600">
                            {product.ecoscore_data.adjustments.threatened_species.label || 'Impact sur la biodiversité et les espèces menacées'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!hasEnvirAccess && <RestrictedOverlay title="Éco-Score détaillé" />}
        </div>
      ) : (
        !hasEnvirAccess ? null : (
          <div className="mb-6 p-3 bg-gray-100 rounded-md">
            <p className="text-gray-600">Aucune donnée Éco-Score disponible pour ce produit.</p>
          </div>
        )
      )}
      
      {/* SECTION RESTREINTE: Empreinte carbone */}
      {product.ecoscore_data && product.ecoscore_data.agribalyse?.co2_total && (
        <div className="mb-8 relative">
          <div style={!hasEnvirAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-3">Empreinte carbone</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-lg text-blue-800">
                  {product.ecoscore_data.agribalyse.co2_total} kg CO₂ eq/kg
                </span>
                <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                  par kg de produit
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Détails de l'empreinte carbone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.ecoscore_data.agribalyse.co2_agriculture && (
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-medium">Agriculture</p>
                      <p className="text-blue-700">{product.ecoscore_data.agribalyse.co2_agriculture} kg CO₂</p>
                    </div>
                  )}
                  
                  {product.ecoscore_data.agribalyse.co2_processing && (
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-medium">Transformation</p>
                      <p className="text-blue-700">{product.ecoscore_data.agribalyse.co2_processing} kg CO₂</p>
                    </div>
                  )}
                  
                  {product.ecoscore_data.agribalyse.co2_packaging && (
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-medium">Emballage</p>
                      <p className="text-blue-700">{product.ecoscore_data.agribalyse.co2_packaging} kg CO₂</p>
                    </div>
                  )}
                  
                  {product.ecoscore_data.agribalyse.co2_distribution && (
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-medium">Transport</p>
                      <p className="text-blue-700">{product.ecoscore_data.agribalyse.co2_distribution} kg CO₂</p>
                    </div>
                  )}
                  
                  {product.ecoscore_data.agribalyse.co2_consumption && (
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-medium">Consommation</p>
                      <p className="text-blue-700">{product.ecoscore_data.agribalyse.co2_consumption} kg CO₂</p>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                L'empreinte carbone mesure la quantité de gaz à effet de serre émise tout au long du cycle de vie du produit.
              </p>
            </div>
          </div>
          
          {!hasEnvirAccess && <RestrictedOverlay title="Empreinte carbone détaillée" />}
        </div>
      )}
      
      {/* SECTION RESTREINTE: Huile de palme */}
      {(product.ingredients_from_palm_oil_tags?.length > 0 || product.ingredients_that_may_be_from_palm_oil_tags?.length > 0) && (
        <div className="mb-8 relative">
          <div style={!hasEnvirAccess ? restrictedSectionStyle : {}} className="relative">
            <h3 className="text-lg font-semibold mb-3">Huile de palme</h3>
            <div className="p-4 bg-yellow-50 rounded-lg">
              {product.ingredients_from_palm_oil_tags?.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-red-700">Contient de l'huile de palme</p>
                  <div className="mt-1">
                    {product.ingredients_from_palm_oil_tags.map((ingredient, index) => (
                      <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                        {ingredient.replace('en:', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {product.ingredients_that_may_be_from_palm_oil_tags?.length > 0 && (
                <div>
                  <p className="font-medium text-orange-700">Peut contenir de l'huile de palme</p>
                  <div className="mt-1">
                    {product.ingredients_that_may_be_from_palm_oil_tags.map((ingredient, index) => (
                      <span key={index} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                        {ingredient.replace('en:', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-600 mt-3">
                La culture de l'huile de palme est l'une des principales causes de déforestation dans les pays tropicaux, menaçant la biodiversité.
              </p>
            </div>
          </div>
          
          {!hasEnvirAccess && <RestrictedOverlay title="Informations sur l'huile de palme" />}
        </div>
      )}
    </div>
  );
};

export default PageEnvir;