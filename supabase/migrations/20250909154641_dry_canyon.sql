/*
  # Ajouter le champ pays aux colis

  1. Modifications
    - Ajouter la colonne `recipient_country` à la table `packages`
    - Valeur par défaut : 'France'

  2. Sécurité
    - Aucun changement de sécurité nécessaire
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'recipient_country'
  ) THEN
    ALTER TABLE packages ADD COLUMN recipient_country text DEFAULT 'France';
  END IF;
END $$;