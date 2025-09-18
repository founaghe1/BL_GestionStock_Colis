import React, { useState, useEffect } from 'react';
import { X, User, Phone, Truck, Calendar, ChevronRight, MapPin, Trash2, Package2, ArrowLeft, Search, Plus } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../types/package';
import { supabase } from '../lib/supabase';
import type { Package } from '../types/package';
import PackageCard from './PackageCard';
import AddPackageModal from './AddPackageModal';

interface PackageManagementProps {
  onBack: () => void;
}

export default function PackageManagement({ onBack }: PackageManagementProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditGpModal, setShowEditGpModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [gpName, setGpName] = useState('');
  const [gpPhone, setGpPhone] = useState('');
  const [isSavingGp, setIsSavingGp] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<{ [id: string]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState<{ [id: string]: boolean }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ [id: string]: boolean }>({});

  // Fetch packages from supabase
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('id, recipient_name, recipient_phone, recipient_country, gp_name, gp_phone, image_url, status, status_history, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPackages((data || []) as Package[]);
    } catch (error) {
      console.error('Erreur lors du chargement des colis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    const filtered = packages.filter(pkg =>
      pkg.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.gp_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPackages(filtered);
  }, [packages, searchTerm]);

  const handlePackageAdded = () => {
    fetchPackages();
  };

  const handlePackageUpdated = () => {
    fetchPackages();
  };

  const handleCleanupDeliveredPackages = async () => {
    setIsCleaningUp(true);
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete packages that are delivered and older than 30 days
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('status', 'recu')
        .lt('updated_at', thirtyDaysAgo.toISOString());

      if (error) throw error;
      
      fetchPackages(); // Refresh the list
    } catch (error) {
      console.error('Erreur lors du nettoyage des colis:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={onBack}
              className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-3 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                <Package2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur opacity-50 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Colis
              </h1>
              <p className="text-purple-600 font-medium">Suivi et livraison des colis</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-sm bg-white/30 p-4 rounded-2xl border border-white/20 shadow-xl">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par destinataire ou GP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg placeholder-purple-400 text-purple-900 font-medium"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCleanupDeliveredPackages}
                disabled={isCleaningUp}
                className="w-full sm:w-auto inline-flex items-center px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Supprimer les colis livrés depuis plus de 30 jours"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isCleaningUp ? 'Nettoyage...' : 'Nettoyer'}
              </button>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter Colis
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 relative z-10">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12 relative z-10 backdrop-blur-sm bg-white/20 rounded-3xl border border-white/30 shadow-2xl">
            <div className="relative inline-block mb-6">
              <Package2 className="h-20 w-20 text-purple-400 mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-purple-400 blur-xl opacity-30 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {searchTerm ? 'Aucun colis trouvé' : 'Aucun colis enregistré'}
            </h3>
            <p className="text-purple-700 mb-6 text-lg">
              {searchTerm 
                ? `Aucun colis (destinataire ou GP) ne correspond à "${searchTerm}"`
                : 'Commencez par ajouter votre premier colis'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un colis
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between relative z-10 backdrop-blur-sm bg-white/20 p-4 rounded-xl border border-white/30">
              <p className="text-purple-700 font-semibold text-lg">
                {filteredPackages.length} colis 
                {searchTerm && ` correspondant à "${searchTerm}"`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
              {filteredPackages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onPackageUpdated={handlePackageUpdated}
                  onShowDetails={() => { setSelectedPackage(pkg); setShowDetails(true); }}
                  onShowEditGp={() => { setSelectedPackage(pkg); setGpName(pkg.gp_name || ''); setGpPhone(pkg.gp_phone || ''); setShowEditGpModal(true); }}
                />
              ))}
            </div>
          </>
        )}

        {/* Package Details Modal */}
        {showDetails && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto relative">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Package2 className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Détails du Colis
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <img
                    src={selectedPackage.image_url || 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg'}
                    alt="Colis"
                    className="w-full h-48 object-contain bg-white rounded-xl shadow-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg';
                    }}
                  />
                </div>
                <div className="mb-6 text-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${STATUS_COLORS[selectedPackage.status]} shadow-lg`}>
                    {STATUS_LABELS[selectedPackage.status]}
                  </span>
                </div>
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Destinataire</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Nom:</span>
                      <span className="text-gray-600">{selectedPackage.recipient_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600">{selectedPackage.recipient_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600">{selectedPackage.recipient_country}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <h3 className="flex items-center space-x-2 mb-3">
                    <Truck className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-800">Partenaire de Livraison</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Nom:</span>
                      <span className="text-gray-600">{selectedPackage.gp_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      <span className="text-gray-600">{selectedPackage.gp_phone}</span>
                    </div>
                  </div>
                </div>
                {/* Historique des statuts + bouton de changement de statut */}
                {selectedPackage.status_history && selectedPackage.status_history.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold text-gray-700">Historique</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {selectedPackage.status_history.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}`}>
                            {STATUS_LABELS[entry.status as keyof typeof STATUS_LABELS]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Bouton pour changer le statut du colis */}
                    {(() => {
                      // Logique pour déterminer le prochain statut
                      const statusFlow = ['en_attente', 'chez_gp', 'expedie', 'recu'];
                      const currentIndex = statusFlow.indexOf(selectedPackage.status);
                      const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
                      const isUpdating = isUpdatingStatus[selectedPackage.id];
                      if (!nextStatus) return null;
                      return (
                        <button
                          onClick={async () => {
                            setIsUpdatingStatus(prev => ({ ...prev, [selectedPackage.id]: true }));
                            try {
                              const now = new Date();
                              const statusEntry = {
                                status: nextStatus,
                                date: now.toISOString(),
                                timestamp: now.getTime()
                              };
                              const updatedHistory = [...selectedPackage.status_history, statusEntry];
                              const { error } = await supabase
                                .from('packages')
                                .update({ status: nextStatus, status_history: updatedHistory })
                                .eq('id', selectedPackage.id);
                              if (error) throw error;
                              handlePackageUpdated();
                              // Mettre à jour le selectedPackage localement pour un retour instantané
                              setSelectedPackage(pkg =>
                                pkg
                                  ? {
                                      ...pkg,
                                      status: nextStatus as Package['status'],
                                      status_history: updatedHistory
                                    }
                                  : pkg
                              );
                            } catch (err) {
                              alert('Erreur lors du changement de statut');
                            } finally {
                              setIsUpdatingStatus(prev => ({ ...prev, [selectedPackage.id]: false }));
                            }
                          }}
                          disabled={isUpdating}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span>{isUpdating ? 'Changement...' : `Passer à : ${STATUS_LABELS[nextStatus as keyof typeof STATUS_LABELS]}`}</span>
                        </button>
                      );
                    })()}
                  </div>
                )}
                {/* Alertes de suppression automatique */}
                {selectedPackage.status === 'recu' && selectedPackage.updated_at && (() => {
                  const deliveredDate = new Date(selectedPackage.updated_at);
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - deliveredDate.getTime());
                  const daysDelivered = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const willAutoDelete = daysDelivered >= 30;
                  return (
                    <div className="space-y-3">
                      <div className="w-full text-center py-3">
                        <span className="text-green-600 font-bold text-lg bg-green-100 px-4 py-2 rounded-full shadow-lg">
                          ✅ Colis livré
                        </span>
                      </div>
                      {daysDelivered > 0 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            Livré il y a {daysDelivered} jour{daysDelivered > 1 ? 's' : ''}
                            {daysDelivered < 30 && (
                              <span className="block text-xs text-orange-600 mt-1">
                                Suppression automatique dans {30 - daysDelivered} jour{30 - daysDelivered > 1 ? 's' : ''}
                              </span>
                            )}
                            {willAutoDelete && (
                              <span className="block text-xs text-red-600 mt-1 font-medium">
                                ⚠️ Sera supprimé automatiquement
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {/* Bouton de suppression manuelle */}
                      <button
                        onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [selectedPackage.id]: true }))}
                        disabled={isDeleting[selectedPackage.id]}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg mb-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{isDeleting[selectedPackage.id] ? 'Suppression...' : 'Supprimer le colis'}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDetails && selectedPackage && showDeleteConfirm[selectedPackage.id] && (
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
                  <span className="font-bold text-red-600">"{selectedPackage.recipient_name}"</span> ?
                </p>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 mb-6">
                  <p className="text-red-700 text-sm font-medium text-center">
                    ⚠️ Cette action est irréversible
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [selectedPackage.id]: false }))}
                    disabled={isDeleting[selectedPackage.id]}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDeleting(prev => ({ ...prev, [selectedPackage.id]: true }));
                      try {
                        const { error } = (await supabase
                          .from('packages')
                          .delete()
                          .eq('id', selectedPackage.id)) as any;
                        if (error) throw error;
                        setShowDeleteConfirm(prev => ({ ...prev, [selectedPackage.id]: false }));
                        setShowDetails(false);
                        handlePackageUpdated();
                      } catch (error) {
                        alert('Erreur lors de la suppression du colis');
                      } finally {
                        setIsDeleting(prev => ({ ...prev, [selectedPackage.id]: false }));
                      }
                    }}
                    disabled={isDeleting[selectedPackage.id]}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isDeleting[selectedPackage.id] ? 'Suppression...' : 'Supprimer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit GP Modal */}
        {showEditGpModal && selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
              <button 
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500" 
                title="Fermer" 
                onClick={() => setShowEditGpModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold mb-4 text-purple-700">Modifier les infos GP de</h3>
              <div>

              </div>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setIsSavingGp(true);
                  try {
                    const { error } = await supabase
                      .from('packages')
                      .update({ gp_name: gpName, gp_phone: gpPhone })
                      .eq('id', selectedPackage.id);
                    if (error) throw error;
                    setShowEditGpModal(false);
                    handlePackageUpdated();
                  } catch (err) {
                    alert('Erreur lors de la mise à jour des infos GP');
                  } finally {
                    setIsSavingGp(false);
                  }
                }}
                className="space-y-3"
              >
                <div className="mb-6">
                  <img
                    src={selectedPackage.image_url || 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg'}
                    alt="Colis"
                    className="w-full h-48 object-contain bg-white rounded-xl shadow-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du GP</label>
                  <input
                    type="text"
                    value={gpName}
                    onChange={e => setGpName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Nom du GP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone GP</label>
                  <input
                    type="text"
                    value={gpPhone}
                    onChange={e => setGpPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Téléphone GP"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setShowEditGpModal(false)}
                    disabled={isSavingGp}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded shadow-lg"
                    disabled={isSavingGp}
                  >
                    {isSavingGp ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AddPackageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPackageAdded={handlePackageAdded}
        />
      </div>
    </div>
  );
}