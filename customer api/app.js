const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route 1: Create a customer
app.post('/customer', (req, res) => {
  const { Name, Email, PhoneNumber, Address } = req.body;
  
  if (!Name || !Email || !PhoneNumber || !Address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const stmt = db.prepare("INSERT INTO customersdb (Name, Email, PhoneNumber, Address) VALUES (?, ?, ?, ?)");
  stmt.run(Name, Email, PhoneNumber, Address, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, Name, Email, PhoneNumber, Address });
  });
});

// Route 2: Delete a customer by ID
app.delete('/customer/:id', (req, res) => {
  const { id } = req.params;
  
  const stmt = db.prepare("DELETE FROM customersdb WHERE ID = ?");
  stmt.run(id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer deleted successfully' });
  });
});

// Route 3: Update customer details by ID
app.put('/customer/:id', (req, res) => {
  const { id } = req.params;
  const { Name, Email, PhoneNumber, Address } = req.body;

  if (!Name || !Email || !PhoneNumber || !Address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const stmt = db.prepare("UPDATE customersdb SET Name = ?, Email = ?, PhoneNumber = ?, Address = ? WHERE ID = ?");
  stmt.run(Name, Email, PhoneNumber, Address, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer updated successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
