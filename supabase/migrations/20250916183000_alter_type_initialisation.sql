-- Migration pour autoriser le type 'Initialisation' dans la colonne type
ALTER TABLE product_stock_history
  ALTER COLUMN type TYPE VARCHAR(20);
-- Optionnel : mettre à jour les valeurs existantes si besoin
-- UPDATE product_stock_history SET type = 'Initialisation' WHERE ...;