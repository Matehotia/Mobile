ALTER TABLE users
ADD COLUMN email VARCHAR(100),
ADD COLUMN avatar_url TEXT,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE users 
SET email = 'test@example.com',
    created_at = CURRENT_TIMESTAMP
WHERE id = 1;


ALTER TABLE agenda 
ADD COLUMN is_completed BOOLEAN DEFAULT false;