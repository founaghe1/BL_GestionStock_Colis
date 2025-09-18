import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LowStockAlertProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  quantity: number;
}

export default function LowStockAlert({ isOpen, onClose, productName, quantity }: LowStockAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm border border-orange-300 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
              <div className="absolute inset-0 bg-white blur opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold mb-1">
              ⚠️ Stock faible !
            </h3>
            <p className="text-sm opacity-90">
              <span className="font-semibold">{productName}</span> n'a plus que{' '}
              <span className="font-bold text-yellow-200">{quantity}</span> unité{quantity > 1 ? 's' : ''} en stock
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:text-yellow-200 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}