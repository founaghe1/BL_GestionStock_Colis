// Types pour l'historique de stock
export type ProductStockHistoryType = 'Restockage' | 'Déstockage' | 'Initialisation';
export interface ProductStockHistory {
  id: number;
  product_id: number;
  type: ProductStockHistoryType;
  quantite: number;
  date: string;
}

// Fonctions utilitaires pour l'historique
export async function addProductStockHistory(product_id: number, type: ProductStockHistoryType, quantite: number) {
  return supabase
    .from('product_stock_history')
    .insert([{ product_id, type, quantite }]);
}

export async function getProductStockHistory(product_id: number): Promise<ProductStockHistory[]> {
  const { data, error } = await supabase
    .from('product_stock_history')
    .select('*')
    .eq('product_id', product_id)
    .order('date', { ascending: true });
  if (error) return [];
  return data || [];
}
import { createClient } from '@supabase/supabase-js';
import type { Package } from '../types/package';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Supabase client for development when credentials are not available
const createMockSupabase = () => {
  let mockProducts: Product[] = [];

  let mockPackages: Package[] = [];

  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          order: (orderColumn: string, options: any) => ({
            then: (callback: (result: { data: any[], error: null }) => void) => {
              let data = table === 'products' ? mockProducts : mockPackages;
              data = data.filter(item => item[column] === value);
              // Optionally sort if needed
              setTimeout(() => callback({ data, error: null }), 100);
              return Promise.resolve({ data, error: null });
            }
          })
        }),
        order: (column: string, options: any) => ({
          then: (callback: (result: { data: any[], error: null }) => void) => {
            const data = table === 'products' ? mockProducts : mockPackages;
            setTimeout(() => callback({ data, error: null }), 100);
            return Promise.resolve({ data, error: null });
          }
        })
      }),
      insert: (data: any[]) => ({
        then: (callback: (result: { error: null }) => void) => {
          if (table === 'products') {
            const newProduct = {
              ...data[0],
              id: Date.now(),
              created_at: new Date().toISOString()
            };
            mockProducts.unshift(newProduct);
          } else if (table === 'packages') {
            const newPackage = {
              ...data[0],
              id: Date.now().toString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            mockPackages.unshift(newPackage);
          }
          setTimeout(() => callback({ error: null }), 100);
          return Promise.resolve({ error: null });
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: (callback: (result: { error: null }) => void) => {
            if (table === 'products') {
              const productIndex = mockProducts.findIndex(p => p.id === value);
              if (productIndex !== -1) {
                mockProducts[productIndex] = { ...mockProducts[productIndex], ...data };
              }
            } else if (table === 'packages') {
              const packageIndex = mockPackages.findIndex(p => p.id === value);
              if (packageIndex !== -1) {
                mockPackages[packageIndex] = { 
                  ...mockPackages[packageIndex], 
                  ...data,
                  updated_at: new Date().toISOString()
                };
              }
            }
            setTimeout(() => callback({ error: null }), 100);
            return Promise.resolve({ error: null });
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          lt: (column2: string, value2: any) => ({
            then: (callback: (result: { error: null }) => void) => {
              if (table === 'packages') {
                mockPackages = mockPackages.filter(pkg => {
                  // status doit être différent OU updated_at >= value2
                  const matchStatus = pkg.status !== value;
                  // Si updated_at est undefined, on ne supprime pas
                  const matchDate = !pkg.updated_at || new Date(pkg.updated_at) >= new Date(value2);
                  return matchStatus || matchDate;
                });
              }
              setTimeout(() => callback({ error: null }), 100);
              return Promise.resolve({ error: null });
            }
          })
        })
      })
    })
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();

export interface Product {
  id: number;
  name: string;
  quantity: number;
  image_url?: string;
  created_at?: string;
}