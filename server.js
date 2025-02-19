const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',      // votre utilisateur PostgreSQL
  host: 'localhost',
  database: 'base',  // votre base de données
  password: 'postgres',  // votre mot de passe
  port: 5432,
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Serveur en ligne!' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Tentative de connexion reçue:', { username, password });
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    console.log('Résultat de la requête:', result.rows);
    
    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Nouvelles routes pour la page d'accueil
app.get('/today-events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT title, event_date::text, start_time::text, end_time::text, event_type
      FROM agenda 
      WHERE user_id = 1 
      ORDER BY event_date, start_time 
      LIMIT 5
    `);
    console.log('Events found:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/last-sleep', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sleep_date, sleep_start, sleep_end, quality
      FROM sleep_records
      WHERE user_id = 1
      ORDER BY sleep_date DESC
      LIMIT 1
    `);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 