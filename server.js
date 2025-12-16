
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
  db.run(`CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    usd_try REAL,
    usd_eur REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Accounts (Cari) Table
  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    type TEXT,
    currency TEXT DEFAULT 'USD',
    tax_id TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
      if (!err) {
          // Seed dummy accounts if table is empty
          db.get("SELECT count(*) as count FROM accounts", [], (err, row) => {
              if (row && row.count === 0) {
                  const stmt = db.prepare("INSERT INTO accounts (name, code, type, currency, address) VALUES (?, ?, ?, ?, ?)");
                  stmt.run("Moda Butik A.Ş.", "C-001", "customer", "TRY", "İstanbul, Merter");
                  stmt.run("Global Tekstil Ltd.", "C-002", "customer", "USD", "London, UK");
                  stmt.run("Ahmet Yılmaz (Perakende)", "C-003", "customer", "TRY", "İstanbul, Kadıköy");
                  stmt.run("Kumaş Dünyası", "S-001", "supplier", "USD", "Bursa, OSB");
                  stmt.finalize();
                  console.log("Örnek cari hesaplar eklendi.");
              }
          });
      }
  });

  // Invoices Table
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER,
    date TEXT,
    due_date TEXT,
    warehouse TEXT,
    currency TEXT,
    exchange_rate REAL,
    subtotal REAL,
    discount_total REAL,
    tax_total REAL,
    transportation REAL,
    grand_total REAL,
    no_tax INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Invoice Items Table
  db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_id INTEGER,
    variant_id TEXT,
    quantity INTEGER,
    unit_price REAL,
    discount_rate REAL,
    tax_rate REAL,
    total REAL
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

// --- ACCOUNTS & INVOICES ---

// 7. Get Accounts
app.get('/api/accounts', (req, res) => {
    const sql = "SELECT * FROM accounts ORDER BY name ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 8. Create Invoice
app.post('/api/invoices', (req, res) => {
    const { 
        accountId, date, dueDate, warehouse, currency, exchangeRate,
        subtotal, discountTotal, taxTotal, transportation, grandTotal, noTax,
        items 
    } = req.body;

    const sqlInvoice = `INSERT INTO invoices 
        (account_id, date, due_date, warehouse, currency, exchange_rate, subtotal, discount_total, tax_total, transportation, grand_total, no_tax) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const paramsInvoice = [accountId, date, dueDate, warehouse, currency, exchangeRate, subtotal, discountTotal, taxTotal, transportation, grandTotal, noTax ? 1 : 0];

    db.run(sqlInvoice, paramsInvoice, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const invoiceId = this.lastID;
        const stmt = db.prepare(`INSERT INTO invoice_items 
            (invoice_id, product_id, variant_id, quantity, unit_price, discount_rate, tax_rate, total) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        
        items.forEach(item => {
            stmt.run(invoiceId, item.productId, item.variantId, item.quantity, item.unitPrice, item.discountRate, item.taxRate, item.total);
        });
        
        stmt.finalize();
        res.json({ message: "success", invoiceId });
    });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
