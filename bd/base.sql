CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL
);


-- Insérer un utilisateur test
INSERT INTO users (username, password) VALUES ('test', 'test123');
