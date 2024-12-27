-- Insertar usuarios
INSERT INTO users (rut, first_name, last_name, email, password, phone_number, age, role) VALUES 
('12345678-9', 'Juan', 'Pérez', 'juan.perez@email.com', 'password123', '+56912345678', 35, 0),
('98765432-1', 'María', 'González', 'maria.gonzalez@email.com', 'password456', '+56987654321', 42, 0),
('11111111-1', 'Carlos', 'Rodríguez', 'carlos.rodriguez@prestabanco.com', 'admin123', '+56911111111', 45, 1),
('22222222-2', 'Ana', 'Silva', 'ana.silva@email.com', 'password789', '+56922222222', 29, 0),
('33333333-3', 'Pedro', 'Martínez', 'pedro.martinez@prestabanco.com', 'exec123', '+56933333333', 38, 1);

-- Insertar aplicaciones
INSERT INTO applications (
    user_id, property_type, requested_amount, term, interest_rate, status, 
    monthly_income, employment_years, current_debt, property_value, documentation_complete
) VALUES 
    ((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 
        0, 150000000, 240, 5.5, 0, 2500000, 5, 500000, 200000000, true),
    ((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 
        1, 100000000, 180, 6.0, 1, 3500000, 8, 1000000, 150000000, false),
    ((SELECT id FROM users WHERE email = 'ana.silva@email.com'), 
        3, 30000000, 120, 7.0, 2, 2000000, 3, 300000, 50000000, true),
    -- Aplicaciones adicionales
    ((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 
        2, 180000000, 240, 6.5, 3, 4500000, 10, 800000, 250000000, true),
    ((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 
        0, 120000000, 180, 5.8, 4, 3000000, 6, 400000, 160000000, true),
    ((SELECT id FROM users WHERE email = 'ana.silva@email.com'), 
        1, 90000000, 240, 6.2, 5, 2800000, 4, 600000, 130000000, true),
    ((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 
        3, 40000000, 120, 7.5, 6, 2200000, 3, 200000, 60000000, true),
    ((SELECT id FROM users WHERE email = 'maria.gonzalez@email.com'), 
        2, 200000000, 240, 6.8, 7, 5000000, 12, 1200000, 280000000, false),
    ((SELECT id FROM users WHERE email = 'ana.silva@email.com'), 
        0, 140000000, 180, 5.9, 8, 3200000, 7, 450000, 180000000, true),
    ((SELECT id FROM users WHERE email = 'juan.perez@email.com'), 
        1, 110000000, 240, 6.3, 2, 3800000, 9, 700000, 145000000, true);