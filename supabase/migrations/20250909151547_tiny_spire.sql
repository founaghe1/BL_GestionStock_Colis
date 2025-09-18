/*
  # Create packages table for delivery management

  1. New Tables
    - `packages`
      - `id` (uuid, primary key)
      - `recipient_name` (text, required)
      - `recipient_phone` (text, required)
      - `gp_name` (text, required - GP = General Partner/Delivery Partner)
      - `gp_phone` (text, required)
      - `image_url` (text, optional)
      - `status` (text, default 'en_attente')
      - `status_history` (jsonb, tracks status changes with dates)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `packages` table
    - Add policy for public access to packages data

  3. Status Management
    - Status enum: en_attente, chez_gp, expedie, recu
    - History tracking for all status changes
*/

CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name text NOT NULL,
  recipient_phone text NOT NULL,
  gp_name text NOT NULL,
  gp_phone text NOT NULL,
  image_url text,
  status text DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'chez_gp', 'expedie', 'recu')),
  status_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to packages"
  ON packages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();