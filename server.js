const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup (SQLite)
const dbPath = path.resolve(__dirname, 'zigzax.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanına bağlanılamadı:', err.message);
  } else {
    console.log('SQlite veritabanına bağlanıldı.');
  }
});

// Create Products Table if not exists
// We will store the complex product data (variants, packs) as a JSON string for flexibility
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT,
    type TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    json_data TEXT
  )`);
});

// --- API ENDPOINTS ---

// 1. Get All Products
app.get('/api/products', (req, res) => {
  const sql = "SELECT * FROM products ORDER BY created_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Parse JSON data back to object
    const products = rows.map(row => ({
        ...row,
        data: JSON.parse(row.json_data)
    }));
    res.json({ message: "success", data: products });
  });
});

// 2. Add New Product
app.post('/api/products', (req, res) => {
  const { type, basicInfo, pricing, variants, packDetails } = req.body;
  
  // Extract key fields for columns
  const name = basicInfo.name;
  const category = basicInfo.category;
  // SKU location depends on type
  const sku = type === 'standard' ? basicInfo.baseSku : packDetails.sku;

  // Prepare full JSON payload
  const fullData = JSON.stringify(req.body);

  const sql = `INSERT INTO products (name, sku, type, category, json_data) VALUES (?, ?, ?, ?, ?)`;
  const params = [name, sku, type, category, fullData];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: { id: this.lastID, ...req.body }
    });
  });
});

// 3. Get Dashboard Stats (Mock logic for now based on DB)
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({ totalProducts: row.count });
    });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});