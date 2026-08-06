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

// GET people - returns object keyed by name (matches Netlify function format)
app.get('/api/people', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        CASE WHEN pol.person_id IS NOT NULL THEN true ELSE false END as is_politician,
        CASE WHEN ent.person_id IS NOT NULL THEN true ELSE false END as is_entertainer,
        CASE WHEN edu.person_id IS NOT NULL THEN true ELSE false END as is_educator
      FROM people p
      LEFT JOIN politician_role pol ON p.id = pol.person_id
      LEFT JOIN entertainment ent ON p.id = ent.person_id
      LEFT JOIN education edu ON p.id = edu.person_id
    `);

    // Convert array to object keyed by name
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
        // Get role flags from joined tables
        is_educator: row.is_educator ?? false,
        is_politician: row.is_politician ?? false,
        is_entertainer: row.is_entertainer ?? false,
        // Normalize field names to support both cases
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

// GET roles - returns array of roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// GET companies - returns array of companies
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET shows - returns array of shows
app.get('/api/shows', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shows');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// GET schools - returns array of schools
app.get('/api/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET subjects - returns array of subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// PUT people/:id - update a person
app.put('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, district, party, fid, mid, sid, is_educator, is_politician, is_entertainer, role_id } = req.body;

    const result = await pool.query(
      `UPDATE people SET name=$1, region=$2, district=$3, party=$4, fid=$5, mid=$6, sid=$7, is_educator=$8, is_politician=$9, is_entertainer=$10, role_id=$11 WHERE id=$12 RETURNING *`,
      [name, region, district, party, fid, mid, sid, is_educator, is_politician, is_entertainer, role_id, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// POST people - add a new person
app.post('/api/people', async (req, res) => {
  try {
    const { name, region, district, party, fid, mid, sid, is_educator, is_politician, is_entertainer } = req.body;

    const result = await pool.query(
      `INSERT INTO people (name, region, district, party, fid, mid, sid, is_educator, is_politician, is_entertainer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, region, district, party, fid, mid, sid, is_educator, is_politician, is_entertainer]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
