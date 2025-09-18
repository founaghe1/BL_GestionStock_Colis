/*
  # Add index for products created_at column

  1. Performance Optimization
    - Add index on `products.created_at` column with DESC order
    - This will significantly speed up queries that sort by creation date
    - Resolves "canceling statement due to statement timeout" errors

  2. Query Optimization
    - Optimizes `ORDER BY created_at DESC` operations
    - Improves performance for product listing queries
    - Reduces database load and response time
*/

-- Add index on products.created_at column for better performance
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);