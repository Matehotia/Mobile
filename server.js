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

// Nouvelle route pour récupérer les données de sommeil
app.get('/sleep-records', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sleep_date::text,
        sleep_start::text,
        sleep_end::text,
        quality
      FROM sleep_records
      WHERE user_id = 1
      ORDER BY sleep_date DESC
      LIMIT 7
    `);
    
    console.log('Sleep records found:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sleep records:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour ajouter un nouvel enregistrement de sommeil
app.post('/sleep-records', async (req, res) => {
  const { sleep_date, sleep_start, sleep_end, quality } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO sleep_records (user_id, sleep_date, sleep_start, sleep_end, quality)
      VALUES (1, $1, $2, $3, $4)
      RETURNING *
    `, [sleep_date, sleep_start, sleep_end, quality]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding sleep record:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer tous les événements
app.get('/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        to_char(event_date, 'YYYY-MM-DD') as event_date,
        to_char(start_time, 'HH24:MI') as start_time,
        to_char(end_time, 'HH24:MI') as end_time,
        event_type,
        priority,
        is_completed
      FROM agenda
      WHERE user_id = 1
      ORDER BY event_date, start_time
    `);
    
    console.log('Events found:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modifier la route POST /events
app.post('/events', async (req, res) => {
  try {
    const { title, description, event_date, start_time, end_time, event_type, priority } = req.body;
    
    console.log('Données reçues:', req.body);

    // Vérification des types et conversion si nécessaire
    const query = `
      INSERT INTO agenda (
        user_id, 
        title, 
        description, 
        event_date, 
        start_time, 
        end_time, 
        event_type, 
        priority,
        is_completed
      )
      VALUES (
        1, 
        $1, 
        $2, 
        $3::date, 
        $4::time, 
        $5::time, 
        $6, 
        $7::integer,
        false
      )
      RETURNING *;
    `;

    const values = [
      title,
      description || '',
      event_date,
      start_time,
      end_time,
      event_type,
      priority
    ];

    console.log('Exécution de la requête avec les valeurs:', values);
    const result = await pool.query(query, values);
    
    console.log('Résultat de l\'insertion:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ 
      message: error.message,
      detail: error.detail,
      table: 'agenda',
      error: error
    });
  }
});

// Route de test pour vérifier les tables
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables disponibles:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour vérifier la structure de la table agenda
app.get('/check-agenda', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agenda'
    `);
    console.log('Structure de la table agenda:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 