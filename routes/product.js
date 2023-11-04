const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const requireLogin = require("../middleware/requireLogin");
const db = require('../db');

// Define the same set of routes for products with MySQL

router.post('/api/products', requireLogin, (req, res) => {
  try {
    const { title, description, price, images, category, properties } = req.body;

    // Create and save the product
    const query = 'INSERT INTO products (title, description, price, images, category, properties, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, price, images, category, JSON.stringify(properties), 0], (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create a product' });
      } else {
        const product = {
          id: results.insertId,
          title,
          description,
          price,
          images,
          category,
          properties,
          isDeleted: 0,
        };
        res.status(200).json(product);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create a product' });
  }
});

router.get("/api/products", requireLogin, (req, res) => {
  try {
    const query = 'SELECT * FROM products WHERE isDeleted = 0';
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch all products' });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch all products' });
  }
});

router.put("/api/products/:id", requireLogin, (req, res) => {
  const { images, title, description, price, category, properties } = req.body;
  const { id } = req.params;
  try {
    const query = 'UPDATE products SET title = ?, description = ?, price = ?, images = ?, category = ?, properties = ? WHERE id = ?';
    db.query(query, [title, description, price, images, category, JSON.stringify(properties), id], (error) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update the product' });
      } else {
        res.status(200).json({ message: 'Product updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update the product' });
  }
});

router.get("/api/products/:id", requireLogin, (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [id], (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch the product' });
      } else {
        if (results.length > 0) {
          res.status(200).json(results[0]);
        } else {
          res.status(404).json({ message: 'Product not found' });
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch the product' });
  }
});

// Update isDeleted field to true when deleting a product
router.put("/api/products/delete/:id", requireLogin, (req, res) => {
  try {
    const { id } = req.params;
    // Find the product by ID and update the isDeleted field to true
    const query = 'UPDATE products SET isDeleted = 1 WHERE id = ?';
    db.query(query, [id], (error) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete the product' });
      } else {
        res.status(200).json({ message: 'Product deleted successfully' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete the product' });
  }
});

module.exports = router;
