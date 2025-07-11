-- Limit active properties to only 20 for display
UPDATE properties 
SET is_active = false 
WHERE id NOT IN (
  SELECT id 
  FROM properties 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 20
);