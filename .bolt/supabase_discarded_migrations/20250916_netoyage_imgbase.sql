/*
  # Nettoyage des images base64 et optimisation des tables

  1. Nettoyage des données
    - Supprime toutes les images base64 stockées dans image_url
    - Remplace par des URLs d'images par défaut depuis Pexels
    - Optimise les performances en réduisant la taille des données

  2. Optimisation
    - Les nouvelles images utiliseront exclusivement Supabase Storage
    - Améliore drastiquement les performances des requêtes
    - Résout les problèmes de timeout
*/

-- Nettoyer les images base64 dans la table products
UPDATE products 
SET image_url = 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg'
WHERE image_url LIKE 'data:image%' OR LENGTH(image_url) > 500;

-- Nettoyer les images base64 dans la table packages
UPDATE packages 
SET image_url = 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg'
WHERE image_url LIKE 'data:image%' OR LENGTH(image_url) > 500;

-- Optimiser les tables après le nettoyage
VACUUM ANALYZE products;
VACUUM ANALYZE packages;