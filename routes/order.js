const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/requireLogin");
const db = require('../db');

// Validate that the provided status is a valid order status
const validStatuses = [
  "confirm",
  "packing",
  "packed",
  "shipping",
  "out to deliver",
  "delivered",
  "canceled",
];

// Define an API endpoint to retrieve orders by status
router.get("/api/orders/get/by/status/:status", requireLogin, (req, res) => {
  try {
    const { status } = req.params;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const query = 'SELECT * FROM orders WHERE status = ?';
    db.query(query, [status], (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Define an API endpoint to retrieve counts of orders by status
router.get("/api/orders/count/by/status", requireLogin, (req, res) => {
  try {
    const counts = {};
    const promises = [];

    for (const status of validStatuses) {
      const query = 'SELECT COUNT(*) AS count FROM orders WHERE status = ?';
      const promise = new Promise((resolve) => {
        db.query(query, [status], (error, results) => {
          if (error) {
            console.error(error);
            resolve(0);
          } else {
            resolve(results[0].count);
          }
        });
      });

      promises.push(promise);
    }

    Promise.all(promises).then((values) => {
      validStatuses.forEach((status, index) => {
        counts[status] = values[index];
      });
      res.status(200).json(counts);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Define a PUT API endpoint to update the order status by orderId
router.put("/api/orders/update-status/:orderId", requireLogin, (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const query = 'UPDATE orders SET status = ? WHERE _id = ?';
    db.query(query, [status, orderId], (error) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      } else {
        res.status(200).json({ message: 'Order status updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
