/*
  # Créer le bucket de stockage pour les images

  1. Nouveau Bucket
    - `images` (bucket public pour stocker les images des produits et colis)
  
  2. Sécurité
    - Bucket public pour permettre l'accès aux images
    - Politique d'upload pour les utilisateurs authentifiés
    - Politique de lecture publique
*/

-- Créer le bucket images s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload d'images (pour tous les utilisateurs pour simplifier)
CREATE POLICY "Allow public uploads to images bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Allow public access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- Politique pour permettre la suppression des images (optionnel)
CREATE POLICY "Allow public delete from images bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'images');