const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

const DATA_FILE = "./users.json";

// Load persistent data
let users = [];
let boards = {};
if (fs.existsSync(DATA_FILE)) {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  users = data.users || [];
  boards = data.boards || {};
}

// Helper to save
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users, boards }, null, 2));
};

// TEST ROUTE
app.get("/test", (req, res) => res.send("SERVER WORKING"));

// =======================
// USERS ROUTES
// =======================

// SIGN UP
app.post("/users", (req, res) => {
  const { email, password } = req.body;
  const existing = users.find((u) => u.email === email);
  if (existing) return res.json({ exists: true });

  users.push({ email, password });
  boards[email] = { columns: [], tasks: [] };
  saveData();
  res.json({ success: true });
});

// SIGN IN
app.get("/users", (req, res) => {
  const email = req.query.email;
  const user = users.find((u) => u.email === email);
  res.json({ user: user || null });
});

// =======================
// BOARD ROUTES
// =======================

// GET BOARD
app.get("/board", (req, res) => {
  const user = req.query.user;
  if (!boards[user]) boards[user] = { columns: [], tasks: [] };
  res.json(boards[user]);
});

// SAVE BOARD
app.post("/board", (req, res) => {
  const { user, columns, tasks } = req.body;
  boards[user] = { columns, tasks };
  saveData();
  res.json({ success: true });
});

// =======================
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
