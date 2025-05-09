// src/components/Download.js
import React from 'react';

const Download = () => {
  return (
    <section id="telecharger" className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Téléchargez FYDO dès maintenant</h2>
        <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
          Rejoignez notre communauté d'utilisateurs et commencez à faire des choix éclairés pour vos produits du quotidien.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <a href="/#" className="bg-black text-white rounded-lg px-6 py-3 flex items-center justify-center max-w-xs mx-auto md:mx-0">
            <div className="mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.539 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.06 2.093-.984 3.926-.984 1.831 0 2.35.984 3.96.946 1.637-.026 2.676-1.488 3.676-2.942 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09l.009-.006z" fill="currentColor"/>
                <path d="M15.197 3.92c.818-1.002 1.37-2.39 1.221-3.77-1.182.052-2.61.793-3.454 1.786-.757.88-1.423 2.297-1.247 3.65 1.324.103 2.675-.67 3.48-1.666z" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs">Télécharger sur</div>
              <div className="text-xl font-semibold">App Store</div>
            </div>
          </a>
          
          <a href="/#" className="bg-black text-white rounded-lg px-6 py-3 flex items-center justify-center max-w-xs mx-auto md:mx-0">
            <div className="mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 20.69V3.31c0-.42.51-.63.81-.33l11.43 8.69c.25.19.25.57 0 .76L3.81 21.02c-.3.23-.81.02-.81-.33z" fill="currentColor"/>
                <path d="M14 12l2.44 1.862 3.97-3.982c.29-.28.75-.1.75.45v15.34c0 .55-.46.83-.75.55l-3.97-3.98L14 24.001H21c1.66 0 3-1.34 3-3V3.001c0-1.66-1.34-3-3-3h-7L14 12z" fill="currentColor"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs">Télécharger sur</div>
              <div className="text-xl font-semibold">Google Play</div>
            </div>
          </a>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-lg max-w-xs w-full">
            <div className="text-center">
              <p className="text-green-700 font-bold mb-2">Scanner le QR Code</p>
              <div className="w-40 h-40 bg-white p-2 mx-auto mb-2">
                <div className="w-full h-full border-2 border-green-600 flex items-center justify-center">
                  <p className="text-xs text-gray-500">QR Code FYDO</p>
                </div>
              </div>
              <p className="text-xs text-green-600">pour télécharger l'application</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;