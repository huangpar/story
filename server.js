const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET people - returns object keyed by name
app.get('/api/people', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        CASE WHEN pol.person_id IS NOT NULL THEN true ELSE false END as is_politician,
        CASE WHEN ent.person_id IS NOT NULL THEN true ELSE false END as is_entertainer,
        CASE WHEN edu.person_id IS NOT NULL THEN true ELSE false END as is_educator,
        r.name as role_name
      FROM people p
      LEFT JOIN politician_role pol ON p.id = pol.person_id
      LEFT JOIN roles r ON pol.role_id = r.id
      LEFT JOIN entertainment ent ON p.id = ent.person_id
      LEFT JOIN education edu ON p.id = edu.person_id
    `);

    const peopleByName = {};
    result.rows.forEach(row => {
      peopleByName[row.name] = {
        id: row.id,
        name: row.name,
        region: row.region,
        district: row.district,
        party: row.party,
        fid: row.fid,
        mid: row.mid,
        sid: row.sid,
        gender: row.gender,
        is_educator: row.is_educator ?? false,
        is_politician: row.is_politician ?? false,
        is_entertainer: row.is_entertainer ?? false,
        role_name: row.role_name,
        Region: row.region,
        Location: row.district,
        Party: row.party,
      };
    });
    res.json(peopleByName);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

// GET roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// GET companies
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET shows
app.get('/api/shows', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shows');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// GET schools
app.get('/api/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
