import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isLoading: boolean;
}

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName, 
  isLoading 
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-red-200">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-full shadow-2xl">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur opacity-50 animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Confirmer la suppression
          </h2>
          
          <p className="text-gray-600 text-center mb-6 text-lg">
            Êtes-vous sûr de vouloir supprimer le produit{' '}
            <span className="font-bold text-red-600">"{productName}"</span> ?
          </p>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-2 mb-6">
            <p className="text-red-700 text-sm font-medium text-center">
              ⚠️ Cette action est irréversible
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-2 py-2 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-2 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isLoading ? 'Suppression...' : 'Supprimer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}