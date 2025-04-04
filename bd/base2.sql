-- Table pour le suivi du sommeil
CREATE TABLE sleep_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    sleep_date DATE NOT NULL,
    sleep_start TIME NOT NULL,
    sleep_end TIME NOT NULL,
    quality INTEGER CHECK (quality BETWEEN 1 AND 5)
);

-- Table pour les révisions
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'planned' -- 'planned', 'completed', 'cancelled'
);

-- Nouvelle table pour l'agenda
CREATE TABLE agenda (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    event_type VARCHAR(50), -- 'revision', 'exam', 'other'
    priority INTEGER CHECK (priority BETWEEN 1 AND 3),
    is_completed BOOLEAN DEFAULT FALSE
);


-- Données de test pour le sommeil
INSERT INTO sleep_records (user_id, sleep_date, sleep_start, sleep_end, quality) 
VALUES 
    (1, CURRENT_DATE, '23:00', '07:00', 4),
    (1, CURRENT_DATE - 1, '22:30', '06:30', 3);

-- Données de test pour les révisions
INSERT INTO study_sessions (user_id, title, start_datetime, end_datetime) 
VALUES 
    (1, 'Mathématiques', CURRENT_TIMESTAMP + INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours'),
    (1, 'Physique', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours');

-- Données de test pour l'agenda
INSERT INTO agenda (user_id, title, description, event_date, start_time, end_time, event_type, priority) 
VALUES 
    (1, 'Examen de Maths', 'Révision finale', CURRENT_DATE + 7, '09:00', '11:00', 'exam', 1),
    (1, 'Révision Physique', 'Chapitre 3', CURRENT_DATE + 2, '14:00', '16:00', 'revision', 2);