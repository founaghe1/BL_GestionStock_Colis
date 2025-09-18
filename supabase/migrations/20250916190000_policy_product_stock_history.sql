-- Allow public access to read, insert, and update product_stock_history
ALTER TABLE product_stock_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to product_stock_history"
  ON product_stock_history
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
