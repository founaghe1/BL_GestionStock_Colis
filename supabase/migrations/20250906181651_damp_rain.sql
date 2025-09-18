/*
  # Create products table for stock management

  1. New Tables
    - `products`
      - `id` (bigint, primary key, auto-increment)
      - `name` (text, required) - Product name
      - `quantity` (integer, required, default 0) - Stock quantity
      - `image_url` (text, optional) - Product image URL
      - `created_at` (timestamptz, default now()) - Creation timestamp

  2. Security
    - Enable RLS on `products` table
    - Add policy for public access to read, insert, and update products
    - This allows the application to work without authentication for simplicity
*/

CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public access for this demo application
CREATE POLICY "Allow public access to products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);