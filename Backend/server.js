const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3606;

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// POST /api/jobs - Create a new job posting
app.post('/api/jobs', async (req, res) => {
  try {
    const {
      title, company, department, location, category, employmentStatus,
      type, experience, salaryMin, salaryMax, description, requirements,
      skills, benefits, deadline, contactEmail, postedDate
    } = req.body;

    // Basic validation
    if (!title || !company || !location || !category || !employmentStatus || !type || !experience || !description || !requirements || !contactEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO jobs (
        title, company, department, location, category, employment_status,
        job_type, experience_level, salary_min, salary_max, description,
        requirements, skills, benefits, deadline, contact_email, posted_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;

    const values = [
      title, company, department || null, location, category, employmentStatus,
      type, experience, salaryMin ? parseInt(salaryMin) : null, salaryMax ? parseInt(salaryMax) : null,
      description, requirements, skills || null, benefits || null,
      deadline || null, contactEmail, postedDate || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ id: result.rows[0].id, message: 'Job posted successfully' });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/jobs - Retrieve all jobs with optional filtering
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, type, experience, category } = req.query;
    let query = 'SELECT * FROM jobs';
    const values = [];
    const conditions = [];

    if (search) {
      conditions.push(`(LOWER(title) LIKE $1 OR LOWER(company) LIKE $1 OR LOWER(location) LIKE $1 OR LOWER(skills) LIKE $1)`);
      values.push(`%${search.toLowerCase()}%`);
    }

    if (type) {
      conditions.push(`job_type = $${values.length + 1}`);
      values.push(type);
    }

    if (experience) {
      conditions.push(`experience_level = $${values.length + 1}`);
      values.push(experience);
    }

    if (category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY posted_date DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/jobs/:id - Retrieve a specific job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});