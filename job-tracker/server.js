const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database("./jobs.db");

// Create table if not exists (now includes link column)
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT,
  role TEXT,
  status TEXT,
  applicationdate TEXT,
  link TEXT
)`);

// ---------------- API ROUTES ----------------

// Get all jobs
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Add a new job
app.post("/jobs", (req, res) => {
  const { company, role, status, applicationdate, link } = req.body;
  db.run(
    "INSERT INTO jobs (company, role, status, applicationdate, link) VALUES (?, ?, ?, ?, ?)",
    [company, role, status, applicationdate, link],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Delete a job
app.delete("/jobs/:id", (req, res) => {
  db.run("DELETE FROM jobs WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

// Update a job
app.put("/jobs/:id", (req, res) => {
  const { company, role, status, applicationdate, link } = req.body;
  db.run(
    "UPDATE jobs SET company=?, role=?, status=?, applicationdate=?, link=? WHERE id=?",
    [company, role, status, applicationdate, link, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

// ---------------- SERVER START ----------------
app.listen(3000, () => console.log("Server running on http://localhost:3000"));