-- Migration SQL pour créer la table d'historique des mouvements de stock
CREATE TABLE IF NOT EXISTS product_stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Restockage' ou 'Déstockage'
    quantite INTEGER NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour accélérer les requêtes par produit
CREATE INDEX IF NOT EXISTS idx_product_stock_history_product_id ON product_stock_history(product_id);