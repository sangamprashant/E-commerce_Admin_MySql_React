const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const requireLogin = require("../middleware/requireLogin");
const db = require('../db');

router.get("/api/subscription/count", requireLogin, (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as count FROM subscriptions';
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
      } else {
        if (results.length > 0) {
          res.status(200).json(results[0].count);
        } else {
          res.status(200).json(0);
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
