const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./jobs.db");

// UPDATED TABLE (added link column)
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT,
  role TEXT,
  status TEXT,
  deadline TEXT,
  link TEXT
)`);

// GET
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// POST
app.post("/jobs", (req, res) => {
  const { company, role, status, deadline, link } = req.body;

  db.run(
    "INSERT INTO jobs (company, role, status, deadline, link) VALUES (?, ?, ?, ?, ?)",
    [company, role, status, deadline, link],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// DELETE
app.delete("/jobs/:id", (req, res) => {
  db.run("DELETE FROM jobs WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

// PUT
app.put("/jobs/:id", (req, res) => {
  const { company, role, status, deadline, link } = req.body;

  db.run(
    "UPDATE jobs SET company=?, role=?, status=?, deadline=?, link=? WHERE id=?",
    [company, role, status, deadline, link, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));