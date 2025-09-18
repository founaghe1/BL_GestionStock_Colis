/*
  # Optimisation des performances pour la table packages

  1. Index
    - Ajouter un index sur `created_at` pour optimiser les requêtes ORDER BY
    - Améliore les performances des requêtes de tri par date de création
    - Résout les erreurs de timeout lors du chargement des colis

  2. Notes importantes
    - L'index est créé en ordre descendant (DESC) pour correspondre à la requête
    - Utilise IF NOT EXISTS pour éviter les erreurs si l'index existe déjà
    - Optimise spécifiquement la requête `order('created_at', { ascending: false })`
*/

-- Créer un index sur created_at pour optimiser les requêtes de tri
CREATE INDEX IF NOT EXISTS packages_created_at_idx ON public.packages (created_at DESC);