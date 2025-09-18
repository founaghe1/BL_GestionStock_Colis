
import React from 'react';
import { X, Package2, ListOrdered } from 'lucide-react';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  details: {
    qteGlobale: number;
    qteRestante: number;
    qteVendue: number;
    historique: { type: string; date: string; quantite: number }[];
  };
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product, details }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto relative border-4 border-purple-200">
        <div className="flex justify-between items-center px-6 py-3 border-b-2 border-purple-100 bg-gradient-to-r from-purple-100/60 to-pink-100/60 rounded-t-2xl">
          <div className="flex space-x-3">
            <Package2 className="h-8 w-8 text-purple-600 drop-shadow" />
            <h6 className="font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wide drop-shadow">
              Détails du produit
            </h6>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full bg-white/70 hover:bg-red-100 shadow"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-2 sm:space-y-0">
            <div className="flex-1">
              <div className="text-lg font-bold text-purple-700 mb-1">{product.name}</div>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="inline-block px-2 py-2 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 text-purple-900 font-semibold shadow">
                  Quantité globale : <span className="font-extrabold text-purple-700">{details.qteGlobale}</span>
                </span>
                <span className="inline-block px-2 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 font-semibold shadow">
                  Quantité restante : <span className="font-extrabold text-indigo-700">{details.qteRestante}</span>
                </span>
                <span className="inline-block px-2 py-2 rounded-full bg-gradient-to-r from-pink-100 to-red-100 text-pink-900 font-semibold shadow">
                  Quantité vendue : <span className="font-extrabold text-pink-700">{details.qteVendue}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-1 py-5 border border-purple-100 shadow-inner">
            <div className="flex items-center space-x-2 font-bold text-purple-700 mb-3">
              <ListOrdered className="h-5 w-5 text-indigo-600" />
              <span>Historique des mouvements</span>
            </div>
            <ul className="max-h-40 overflow-y-auto text-sm divide-y divide-purple-100">
              {details.historique.length === 0 && <li className="text-gray-400 py-2">Aucun mouvement</li>}
              {details.historique.map((h, idx) => (
                <li key={idx} className="py-2 px-3 flex items-center justify-between space-x-2">
                  <span className={
                    h.type === 'Restockage' ? 'text-green-700 font-bold' :
                    h.type === 'Déstockage' ? 'text-red-700 font-bold' :
                    'text-purple-700 font-bold'
                  }>
                    {h.type}
                  </span>
                  <span className="font-semibold text-gray-700">{h.quantite}</span>
                  <span className="text-xs text-gray-500 font-mono">{h.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
