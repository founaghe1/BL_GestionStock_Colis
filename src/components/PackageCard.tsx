import React, { useState } from 'react';
import { Package2, User, Phone, Truck, Calendar, ChevronRight, MapPin, X, Trash2, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Package, StatusHistoryEntry } from '../types/package';
import { STATUS_LABELS, STATUS_COLORS } from '../types/package';

interface PackageCardProps {
  package: Package;
  onPackageUpdated: () => void;
}

export default function PackageCard({ package: pkg, onPackageUpdated, onShowDetails, onShowEditGp }: PackageCardProps & { onShowDetails: () => void, onShowEditGp: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = ['en_attente', 'chez_gp', 'expedie', 'recu'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const now = new Date();
      const statusEntry: StatusHistoryEntry = {
        status: newStatus,
        date: now.toISOString(),
        timestamp: now.getTime()
      };

      const updatedHistory = [...(pkg.status_history || []), statusEntry];

      const { error } = await supabase
        .from('packages')
        .update({ 
          status: newStatus,
          status_history: updatedHistory
        })
        .eq('id', pkg.id);

      if (error) throw error;
      onPackageUpdated();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', pkg.id);

      if (error) throw error;
  onPackageUpdated();
  setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du colis:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const nextStatus = getNextStatus(pkg.status) as keyof typeof STATUS_LABELS | null;
  const canAdvance = nextStatus && pkg.status !== 'recu';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysDelivered = () => {
    if (pkg.status !== 'recu' || !pkg.updated_at) return 0;
    const deliveredDate = new Date(pkg.updated_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - deliveredDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysDelivered = getDaysDelivered();
  const willAutoDelete = pkg.status === 'recu' && daysDelivered >= 30;

  return (
    <>
      {/* Carte compacte */}
      <div 
        onClick={onShowDetails}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden border border-white/20 group cursor-pointer relative"
      >
        {/* Bouton édition GP */}
        <button
          className="absolute top-2 right-2 z-20 p-2 bg-white/80 rounded-full shadow hover:bg-purple-100 transition"
          title="Modifier les infos GP"
          onClick={e => { e.stopPropagation(); onShowEditGp(); }}
        >
          <Pencil className="h-4 w-4 text-purple-600" />
        </button>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Image */}
        <div className="aspect-w-16 aspect-h-12 bg-gray-100">
          <img
            src={pkg.image_url || 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg'}
            alt="Colis"
            className="w-full h-32 object-contain bg-white transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        <div className="p-4 relative z-10">
          {/* Status Badge */}
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[pkg.status]} shadow-lg`}>
              {STATUS_LABELS[pkg.status]}
            </span>
          </div>

          {/* Recipient Info */}
          <div className="mb-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-500" />
              <span className="font-semibold text-gray-800 text-sm truncate">{pkg.recipient_name}</span>
            </div>
          </div>

          {/* Click for details */}
          <div className="text-center mt-3">
            <span className="text-xs text-purple-600 font-medium">Cliquer pour plus de détails</span>
          </div>
        </div>
      </div>


      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-full shadow-2xl">
                    <Trash2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur opacity-50 animate-pulse"></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Supprimer le colis
              </h2>
              
              <p className="text-gray-600 text-center mb-4 text-lg">
                Êtes-vous sûr de vouloir supprimer le colis de{' '}
                <span className="font-bold text-red-600">"{pkg.recipient_name}"</span> ?
              </p>
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 mb-6">
                <p className="text-red-700 text-sm font-medium text-center">
                  ⚠️ Cette action est irréversible
                </p>
                {daysDelivered > 0 && (
                  <p className="text-red-600 text-xs text-center mt-1">
                    Colis livré il y a {daysDelivered} jour{daysDelivered > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}