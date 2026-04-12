const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve uploaded files so they can be previewed/downloaded
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = new sqlite3.Database("./jobs.db");

// UPDATED TABLE (added link column)
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT,
  role TEXT,
  status TEXT,
  deadline TEXT,
  link TEXT,
  resume TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT,
  password TEXT
)`);

//CREATE TABLE IF NOT EXISTS/ ALTER TABLE
//db.run("ALTER TABLE jobs ADD COLUMN resume TEXT", () => {});

// ---------------- FILE UPLOAD ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

function fileFilter(req, file, cb) {
  const allowed = [".doc", ".docx", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only .doc, .docx, .pdf allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload route
app.post("/uploadResume", upload.single("resume"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Return a URL that matches your static route
  res.json({ path: `/uploads/${req.file.filename}` });
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, "..", "public")));

// Default route → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "SignUp_LogIn_Form.html"));
});

// Route for index.html (job applications tracker)
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ---------------- AUTH ROUTES ----------------
// Register
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  console.log("Register attempt:", username, email, password); // debug
  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("Inserted user ID:", this.lastID); // debug
      res.json({ id: this.lastID });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password); // debug
  db.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("DB row:", row); // debug
      if (row) res.json({ success: true });
      else res.json({ success: false });
    }
  );
});

// GET
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// POST
app.post("/jobs", (req, res) => {
  const { company, role, status, deadline, link, resume } = req.body;
  db.run(
    "INSERT INTO jobs (company, role, status, deadline, link, resume) VALUES (?, ?, ?, ?, ?, ?)",
    [company, role, status, deadline, link, resume],
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
  const { company, role, status, deadline, link, resume } = req.body;
  db.run(
    "UPDATE jobs SET company=?, role=?, status=?, deadline=?, link=?, resume=? WHERE id=?",
    [company, role, status, deadline, link, resume, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));