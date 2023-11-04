const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/requireLogin");
const db = require('../db');

router.get("/api/client/count", requireLogin, (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as count FROM clients';
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
