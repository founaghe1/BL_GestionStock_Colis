import React, { useState } from 'react';
import { X, Package2, User, Phone, Truck, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageAdded: () => void;
}

export default function AddPackageModal({ isOpen, onClose, onPackageAdded }: AddPackageModalProps) {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientCountry: 'France',
    gpName: '',
    gpPhone: '',
    imageUrl: '',
    imageFile: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Créer une URL de prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  if (!formData.recipientName.trim() || !formData.recipientPhone.trim() || 
    !formData.recipientCountry.trim()) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const initialStatusHistory = [{
        status: 'en_attente',
        date: now.toISOString(),
        timestamp: now.getTime()
      }];

      let imageUrl = 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg';
      
      // Upload de l'image si un fichier est sélectionné
      if (formData.imageFile) {
        imageUrl = await uploadImageToStorage(formData.imageFile);
      }
      
      const { error } = await supabase
        .from('packages')
        .insert([{
          recipient_name: formData.recipientName.trim(),
          recipient_phone: formData.recipientPhone.trim(),
          recipient_country: formData.recipientCountry.trim(),
          gp_name: formData.gpName.trim(),
          gp_phone: formData.gpPhone.trim(),
          image_url: imageUrl,
          status: 'en_attente',
          status_history: initialStatusHistory
        }]);

      if (error) throw error;
      
      // Reset form
      setFormData({
        recipientName: '',
        recipientPhone: '',
        recipientCountry: 'France',
        gpName: '',
        gpPhone: '',
        imageUrl: '',
        imageFile: null
      });
      setPreviewUrl('');
      onPackageAdded();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du colis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Package2 className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nouveau Colis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient Info */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Informations Destinataire</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du destinataire *
              </label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="Nom complet du destinataire"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.recipientPhone}
                onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <input
                type="text"
                required
                value={formData.recipientCountry}
                onChange={(e) => handleInputChange('recipientCountry', e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="France"
              />
            </div>
          </div>

          {/* GP Info */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-800">Informations GP</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du GP (optionnel)
              </label>
              <input
                type="text"
                value={formData.gpName}
                onChange={(e) => handleInputChange('gpName', e.target.value)}
                className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="Nom du partenaire de livraison"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone GP (optionnel)
              </label>
              <input
                type="tel"
                value={formData.gpPhone}
                onChange={(e) => handleInputChange('gpPhone', e.target.value)}
                className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Package Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image du colis (optionnel)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="package-image-upload"
              />
              <label
                htmlFor="package-image-upload"
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 cursor-pointer transition-all duration-300 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transform hover:scale-105"
              >
                <Image className="h-5 w-5 text-pink-500 mr-2" />
                <span className="text-pink-700 font-medium">
                  {formData.imageFile ? formData.imageFile.name : 'Choisir une image du colis'}
                </span>
              </label>
            </div>
            
            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Aperçu du colis"
                  className="w-full h-32 object-contain bg-white rounded-lg border-2 border-pink-200 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-300 font-medium transform hover:scale-105"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.recipientName.trim() || !formData.recipientPhone.trim() || 
                       !formData.recipientCountry.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            >
              {isLoading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}