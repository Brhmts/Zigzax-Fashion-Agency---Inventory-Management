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

// Initialize Tables
db.serialize(() => {
  // Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT,
    type TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    json_data TEXT
  )`);

  // Exchange Rates Table
  // Stores daily rates based on USD.
  // usd_try: 1 USD = X TRY
  // usd_eur: 1 USD = X EUR
  db.run(`CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    usd_try REAL,
    usd_eur REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  
  const name = basicInfo.name;
  const category = basicInfo.category;
  const sku = type === 'standard' ? basicInfo.baseSku : packDetails.sku;
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

// 3. Get Dashboard Stats
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({ totalProducts: row.count });
    });
});

// --- EXCHANGE RATE ENDPOINTS ---

// 4. Get Latest Rate
app.get('/api/rates/latest', (req, res) => {
    const sql = "SELECT * FROM exchange_rates ORDER BY date DESC LIMIT 1";
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            // Default fallback: 1 USD = 34 TL, 1 USD = 0.92 EUR
            res.json({ date: new Date().toISOString().split('T')[0], usd_try: 34.0, usd_eur: 0.92 });
        } else {
            res.json(row);
        }
    });
});

// 5. Get All Rates History
app.get('/api/rates', (req, res) => {
    const sql = "SELECT * FROM exchange_rates ORDER BY date DESC LIMIT 30";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 6. Add/Update Rate
app.post('/api/rates', (req, res) => {
    const { date, usd_try, usd_eur } = req.body;
    
    // Check if date exists
    db.get("SELECT id FROM exchange_rates WHERE date = ?", [date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update existing
            const sql = "UPDATE exchange_rates SET usd_try = ?, usd_eur = ? WHERE id = ?";
            db.run(sql, [usd_try, usd_eur, row.id], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "updated", date, usd_try, usd_eur });
            });
        } else {
            // Insert new
            const sql = "INSERT INTO exchange_rates (date, usd_try, usd_eur) VALUES (?, ?, ?)";
            db.run(sql, [date, usd_try, usd_eur], function(err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "created", date, usd_try, usd_eur });
            });
        }
    });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});