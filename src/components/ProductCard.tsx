import React, { useState, useEffect, useRef } from 'react';
import { Minus, Edit, Trash2, Plus } from 'lucide-react';
import { supabase, addProductStockHistory, getProductStockHistory, ProductStockHistory } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import LowStockAlert from './LowStockAlert';
// import ProductDetailsModal from './ProductDetailsModal';


interface ProductCardProps {
  product: Product;
  onProductUpdated: () => void;
  onProductEdit: (product: Product) => void;
  onShowDetails: (product: Product, details: any) => void;
}

export default function ProductCard({ product, onProductUpdated, onProductEdit, onShowDetails }: ProductCardProps) {
  const [history, setHistory] = useState<ProductStockHistory[]>([]);

  // Initialisation de l'historique si vide
  const initLock = useRef(false);
  useEffect(() => {
    let isMounted = true;
    async function fetchAndInitHistory() {
      if (initLock.current) return;
      initLock.current = true;
      const hist = await getProductStockHistory(product.id);
      const hasInit = hist.some(h => h.type === 'Initialisation');
      if (!hasInit) {
        const { error } = await addProductStockHistory(product.id, 'Initialisation', product.quantity);
        if (error && !error.message.includes('duplicate')) {
          alert("Erreur lors de l'initialisation: " + error.message);
          console.error(error);
        }
        const hist2 = await getProductStockHistory(product.id);
        if (isMounted) setHistory(hist2);
      } else {
        if (isMounted) setHistory(hist);
      }
    }
    fetchAndInitHistory();
    return () => { isMounted = false; };
  }, [product.id]);

  // Calculs stock
  const initial = history.find(h => h.type === 'Initialisation')?.quantite || 0;
  const totalRestock = history.filter(h => h.type === 'Restockage').reduce((acc, h) => acc + h.quantite, 0);
  const totalDestock = history.filter(h => h.type === 'Déstockage').reduce((acc, h) => acc + h.quantite, 0);
  const qteGlobale = initial + totalRestock;
  const qteVendue = totalDestock;
  const qteRestante = qteGlobale - qteVendue;

  const productDetails = {
    qteGlobale,
    qteRestante,
    qteVendue,
    historique: history.map(h => ({ type: h.type, date: new Date(h.date).toLocaleString(), quantite: h.quantite }))
  };

  const [destockQuantity, setDestockQuantity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [isRestocking, setIsRestocking] = useState(false);
  const restockLock = useRef(false);

  // ✅ Restock corrigé sans doublons
  const handleRestock = async () => {
    if (restockQuantity <= 0) return;
    if (isRestocking || restockLock.current) return;

    restockLock.current = true;
    setIsRestocking(true);

    try {
      const newQuantity = product.quantity + restockQuantity;

      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', product.id);
      if (error) throw error;

      const { error: histError } = await addProductStockHistory(product.id, 'Restockage', restockQuantity);
      if (histError) {
        console.error('Erreur historique (Restockage):', histError);
      }

      const hist = await getProductStockHistory(product.id);
      setRestockQuantity(0);
      setHistory(hist);
      onProductUpdated();
    } catch (error) {
      console.error('Erreur lors du restockage:', error);
    } finally {
      setIsRestocking(false);
      setTimeout(() => { restockLock.current = false; }, 1500);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);

  const handleDestock = async () => {
    if (destockQuantity <= 0 || destockQuantity > product.quantity) return;
    setIsLoading(true);
    try {
      const newQuantity = product.quantity - destockQuantity;
      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', product.id);
      if (error) throw error;

      const { error: histError } = await addProductStockHistory(product.id, 'Déstockage', destockQuantity);
      if (histError) console.error('Erreur historique (Déstockage):', histError);

      setDestockQuantity(0);
      getProductStockHistory(product.id).then(hist => setHistory(hist));
      onProductUpdated();

      if (newQuantity > 0 && newQuantity < 5) {
        setShowLowStockAlert(true);
        setTimeout(() => setShowLowStockAlert(false), 5000);
      }
    } catch (error) {
      console.error('Erreur lors du déstockage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      if (error) throw error;

      onProductUpdated();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 bg-red-50';
    if (quantity <= 10) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const handleOpenDetailsModal = async (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('input'))
    ) return;

    const hist = await getProductStockHistory(product.id);
    setHistory(hist);
    // Calcul des détails comme avant
    const initial = hist.find(h => h.type === 'Initialisation')?.quantite || 0;
    const totalRestock = hist.filter(h => h.type === 'Restockage').reduce((acc, h) => acc + h.quantite, 0);
    const totalDestock = hist.filter(h => h.type === 'Déstockage').reduce((acc, h) => acc + h.quantite, 0);
    const qteGlobale = initial + totalRestock;
    const qteVendue = totalDestock;
    const qteRestante = qteGlobale - qteVendue;
    const productDetails = {
      qteGlobale,
      qteRestante,
      qteVendue,
      historique: hist.map(h => ({ type: h.type, date: new Date(h.date).toLocaleString(), quantite: h.quantite }))
    };
    onShowDetails(product, productDetails);
  };

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden border border-white/20 group cursor-pointer"
      onClick={handleOpenDetailsModal}
    >
      <div className="aspect-w-16 aspect-h-12 bg-gray-100">
        <img
          src={product.image_url || 'https://images.pexels.com/photos-230544/pexels-photo-230544.jpeg'}
          alt={product.name}
          className="w-full h-48 object-contain bg-white transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos-230544/pexels-photo-230544.jpeg';
          }}
        />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate flex-1 mr-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onProductEdit(product); }}
              className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300"
              title="Modifier le produit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setShowDeleteModal(true); }}
              disabled={isDeleting}
              className="p-2 text-pink-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 disabled:opacity-50"
              title="Supprimer le produit"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getQuantityColor(product.quantity)}`}>
            Stock: {product.quantity}
          </div>
        </div>

        {product.quantity > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={destockQuantity}
                onChange={(e) => setDestockQuantity(Math.max(0, Math.min(product.quantity, parseInt(e.target.value) || 0)))}
                className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg text-sm"
                placeholder="Qté à déstocker"
              />
              <button
                onClick={handleDestock}
                disabled={isLoading || destockQuantity <= 0 || destockQuantity > product.quantity}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1 text-sm font-bold"
              >
                <Minus className="h-4 w-4" />
                <span>{isLoading ? 'En cours...' : 'Déstocke'}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 px-3 py-2 w-0 border-2 border-purple-200 rounded-lg text-sm"
                placeholder="Qté à restocker"
              />
              <button
                onClick={handleRestock}
                disabled={isRestocking || restockQuantity <= 0}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1 text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                <span>{isRestocking ? 'En cours...' : 'Restocker'}</span>
              </button>
            </div>
          </div>
        )}

        {product.quantity === 0 && (
          <div className="text-center py-3">
            <span className="text-red-600 font-bold text-lg bg-red-100 px-4 py-2 rounded-full animate-pulse">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        productName={product.name}
        isLoading={isDeleting}
      />

      <LowStockAlert
        isOpen={showLowStockAlert}
        onClose={() => setShowLowStockAlert(false)}
        productName={product.name}
        quantity={product.quantity}
      />
    </div>
  );
}