const express = require('express');
const cors = require("cors");
const { connectDB } = require("./config/db.config");

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Global database pool
let dbPool = null;

// Initialize database connection
async function initializeDB() {
  try {
    dbPool = await connectDB();
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        age INTEGER,
        address VARCHAR(255)
      );
    `);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
    // Retry connection after 5 seconds
    setTimeout(initializeDB, 5000);
  }
}

// Middleware to ensure database connection
async function ensureDBConnection(req, res, next) {
  if (!dbPool) {
    try {
      dbPool = await connectDB();
    } catch (err) {
      console.error("Database connection failed:", err);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  next();
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    let dbStatus = "disconnected";
    
    if (dbPool) {
      // Test database connection
      await dbPool.query("SELECT 1");
      dbStatus = "connected";
    }
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message
    });
  }
});

// GET all users
app.get("/api/user", ensureDBConnection, async (req, res) => {
  try {
    const result = await dbPool.query("SELECT * FROM users ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new user
app.post("/api/user", ensureDBConnection, async (req, res) => {
  try {
    const { name, email, age, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await dbPool.query(
      `INSERT INTO users (name, email, age, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, age, address]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/user error:", err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// PUT update user
app.put("/api/user/:id", ensureDBConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await dbPool.query(
      `UPDATE users 
       SET name = $1, email = $2, age = $3, address = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, age, address, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/user/:id error:", err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE user
app.delete("/api/user/:id", ensureDBConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbPool.query("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/user/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeDB();
});
