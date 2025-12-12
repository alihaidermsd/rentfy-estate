-- USER INSERT
INSERT INTO users (id, email, name, password, role, emailVerified, isActive, createdAt, updatedAt) VALUES
('clsdg5v6u00003r6f4z3o2z1a', 'john.tenant@example.com', 'John Tenant', 'PLACEHOLDER_HASHED_PASSWORD_FOR_password123', 'USER', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PROPERTY INSERT (associated with 'john.tenant@example.com')
INSERT INTO properties (id, title, description, type, category, purpose, rentPrice, address, city, state, country, bedrooms, bathrooms, area, furnished, amenities, images, status, featured, verified, userId, createdAt, updatedAt) VALUES
('clsdg5v6u00013r6f4z3o2z1b', 'Luxury Downtown Apartment', 'Modern apartment with skyline views.', 'APARTMENT', 'RENT', 'RENTAL', 3200.0, '123 Manhattan Ave', 'New York', 'NY', 'USA', 2, 2, 1100.0, 1, 'Pool,Gym,Rooftop', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'PUBLISHED', 1, 1, 'clsdg5v6u00003r6f4z3o2z1a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
