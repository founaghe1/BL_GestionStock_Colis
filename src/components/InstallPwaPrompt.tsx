
import React, { useEffect, useState } from 'react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);


  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Affiche la boîte de dialogue native d'installation
      const { outcome } = await deferredPrompt.userChoice;
      setShow(false); // Ferme le pop-up quelle que soit la réponse
    }
  };

  const handleCancel = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-xs w-full border-2 border-blue-600 text-center animate-fade-in">
        <img src="/icon-512.png" alt="Installer" className="w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Installer l'application&nbsp;?</h2>
        <p className="text-gray-700 mb-6">Ajoutez BELLA LUXE Gestion de Stock sur votre écran d'accueil pour une expérience optimale&nbsp;!</p>
        <div className="flex flex-col gap-3">
          <button
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 hover:scale-105 px-6 py-3  mb-1"
            onClick={handleInstall}
          >
            Installer
          </button>
          <button
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 hover:scale-105 px-6 py-3  mb-1"
            onClick={handleCancel}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
