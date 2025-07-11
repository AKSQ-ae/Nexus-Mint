-- Fix missing property data and add AED pricing
UPDATE properties 
SET 
    city = CASE 
        WHEN title LIKE '%Marina%' THEN 'Dubai Marina'
        WHEN title LIKE '%Downtown%' THEN 'Downtown Dubai'
        WHEN title LIKE '%JBR%' THEN 'Jumeirah Beach Residence'
        WHEN title LIKE '%Business Bay%' THEN 'Business Bay'
        WHEN title LIKE '%Palm Jumeirah%' THEN 'Palm Jumeirah'
        ELSE 'Dubai'
    END,
    price_per_token = CASE 
        WHEN price <= 1500000 THEN 50
        WHEN price <= 3000000 THEN 75
        WHEN price <= 5000000 THEN 100
        WHEN price <= 7000000 THEN 125
        ELSE 150
    END,
    total_tokens = CASE 
        WHEN price <= 1500000 THEN 25000
        WHEN price <= 3000000 THEN 40000
        WHEN price <= 5000000 THEN 50000
        WHEN price <= 7000000 THEN 60000
        ELSE 75000
    END,
    is_featured = CASE 
        WHEN title IN ('Luxury Marina Apartment', 'Downtown Penthouse', 'JBR Beachfront Villa') THEN true
        ELSE false
    END,
    images = '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'::jsonb
WHERE city IS NULL OR price_per_token IS NULL;

-- Add sample token supply data
INSERT INTO token_supply (property_id, token_price, total_supply, available_supply, minimum_investment, reserved_supply, last_price_update)
SELECT 
    p.id,
    p.price_per_token * 3.67, -- Convert to AED
    p.total_tokens,
    FLOOR(p.total_tokens * (0.6 + RANDOM() * 0.3)), -- 60-90% available
    500, -- AED 500 minimum
    FLOOR(p.total_tokens * 0.1), -- 10% reserved
    NOW()
FROM properties p
WHERE p.price_per_token IS NOT NULL
ON CONFLICT (property_id) DO UPDATE SET
    token_price = EXCLUDED.token_price,
    total_supply = EXCLUDED.total_supply,
    available_supply = EXCLUDED.available_supply,
    minimum_investment = EXCLUDED.minimum_investment,
    last_price_update = NOW();