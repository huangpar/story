const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load data from public/people.json
const peopleDataPath = path.join(__dirname, 'public', 'people.json');
let peopleData = {};

try {
  const rawData = fs.readFileSync(peopleDataPath, 'utf8');
  peopleData = JSON.parse(rawData);
} catch (err) {
  console.error('Error loading people.json:', err);
}

// GET people
app.get('/api/people', (req, res) => {
  res.json(peopleData);
});

// GET roles
app.get('/api/roles', (req, res) => {
  res.json([]);
});

// GET companies
app.get('/api/companies', (req, res) => {
  res.json([]);
});

// GET shows
app.get('/api/shows', (req, res) => {
  res.json([]);
});

// GET schools
app.get('/api/schools', (req, res) => {
  res.json([]);
});

// GET subjects
app.get('/api/subjects', (req, res) => {
  res.json([]);
});

// PUT people/:id
app.put('/api/people/:id', (req, res) => {
  res.json({ error: 'Not implemented' });
});

// POST people
app.post('/api/people', (req, res) => {
  res.json({ error: 'Not implemented' });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
