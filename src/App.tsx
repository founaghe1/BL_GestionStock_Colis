import React, { useState, useEffect } from 'react';
import { Plus, Package, Truck } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Product } from './lib/supabase';
import SearchBar from './components/SearchBar';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import PackageManagement from './components/PackageManagement';

function App() {
  const [currentPage, setCurrentPage] = useState<'products' | 'packages'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, quantity, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleProductAdded = () => {
    fetchProducts();
  };

  const handleProductUpdated = () => {
    fetchProducts();
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  if (currentPage === 'packages') {
    return <PackageManagement onBack={() => setCurrentPage('products')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 relative overflow-hidden">
      <InstallPwaPrompt />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-3 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <div className="text-white font-bold text-2xl tracking-wider">BL</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur opacity-50 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestion de Stock
                </h1>
                <p className="text-purple-600 font-medium">Système moderne de gestion</p>
              </div>
            </div>
            <div className="mr-4">
              <button
                onClick={() => setCurrentPage('packages')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <Truck className="h-5 w-5 mr-2" />
                Gestion des Colis
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-sm bg-white/30 p-4 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Produit
            </button>
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 relative z-10 backdrop-blur-sm bg-white/20 rounded-3xl border border-white/30 shadow-2xl">
            <div className="relative inline-block mb-6">
              <Package className="h-20 w-20 text-purple-400 mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-purple-400 blur-xl opacity-30 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit en stock'}
            </h3>
            <p className="text-purple-700 mb-6 text-lg">
              {searchTerm 
                ? `Aucun produit ne correspond à "${searchTerm}"`
                : 'Commencez par ajouter votre premier produit'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between relative z-10 backdrop-blur-sm bg-white/20 p-4 rounded-xl border border-white/30">
              <p className="text-purple-700 font-semibold text-lg">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
                {searchTerm && ` pour "${searchTerm}"`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductUpdated={handleProductUpdated}
                  onProductEdit={handleProductEdit}
                  onShowDetails={(prod, details) => {
                    setSelectedProduct(prod);
                    setProductDetails(details);
                    setShowDetailsModal(true);
                  }}
                />
              ))}
            </div>
          </>
        )}

        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProductAdded={handleProductAdded}
        />
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onProductUpdated={handleProductUpdated}
          product={editingProduct}
        />
        {/* Modal détails produit */}
        <ProductDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          product={selectedProduct}
          details={productDetails}
        />
      </div>
    </div>
  );
}

export default App;