const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const db = require('../db');

const router = express.Router();

// Signup route
router.post('/create/admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = 'SELECT * FROM admins WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length > 0) {
        res.status(400).json({ message: 'Email already registered' });
      } else {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (hashError, hashedPassword) => {
          if (hashError) {
            console.error('Error hashing the password: ' + hashError);
            res.status(500).json({ message: 'Internal Server Error' });
          } else {
            const insertQuery = 'INSERT INTO admins (email, password) VALUES (?, ?)';
            db.query(insertQuery, [email, hashedPassword], (insertError) => {
              if (insertError) {
                console.error('Error executing MySQL query: ' + insertError);
                res.status(500).json({ message: 'Internal Server Error' });
              } else {
                res.status(201).json({ message: 'Signup successful' });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/api/admin/do/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = 'SELECT * FROM admins WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length === 0) {
        res.status(401).json({ message: 'Authentication failed' });
      } else {
        bcrypt.compare(password, results[0].password, (compareError, isPasswordValid) => {
          if (compareError) {
            console.error('Error comparing passwords: ' + compareError);
            res.status(500).json({ message: 'Internal Server Error' });
          } else if (!isPasswordValid) {
            res.status(401).json({ message: 'Authentication failed' });
          } else {
            // Create a JWT token with the admin's ID as the payload
            const token = jwt.sign({ adminId: results[0].id }, process.env.AUTH_SECRET);
            res.status(200).json({
              message: 'Login successful',
              token: token,
              details: results[0],
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Email route
router.put('/api/admin/update/email', async (req, res) => {
  try {
    const { oldEmail, newEmail, password } = req.body;

    const query = 'SELECT * FROM admins WHERE email = ?';
    db.query(query, [oldEmail], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Email not found' });
      } else {
        bcrypt.compare(password, results[0].password, (compareError, isPasswordValid) => {
          if (compareError) {
            console.error('Error comparing passwords: ' + compareError);
            res.status(500).json({ message: 'Internal Server Error' });
          } else if (!isPasswordValid) {
            res.status(401).json({ message: 'Authentication failed' });
          } else {
            // Update the admin's email
            const updateQuery = 'UPDATE admins SET email = ? WHERE id = ?';
            db.query(updateQuery, [newEmail, results[0].id], (updateError) => {
              if (updateError) {
                console.error('Error executing MySQL query: ' + updateError);
                res.status(500).json({ message: 'Internal Server Error' });
              } else {
                res.status(200).json({ message: 'Email updated successfully', user: results[0] });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Password route
router.put('/api/admin/update/password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const query = 'SELECT * FROM admins WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Email not found' });
      } else {
        bcrypt.compare(oldPassword, results[0].password, (compareError, isPasswordValid) => {
          if (compareError) {
            console.error('Error comparing passwords: ' + compareError);
            res.status(500).json({ message: 'Internal Server Error' });
          } else if (!isPasswordValid) {
            res.status(401).json({ message: 'Authentication failed' });
          } else {
            bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
              if (hashError) {
                console.error('Error hashing the password: ' + hashError);
                res.status(500).json({ message: 'Internal Server Error' });
              } else {
                // Update the admin's password
                const updateQuery = 'UPDATE admins SET password = ? WHERE id = ?';
                db.query(updateQuery, [hashedPassword, results[0].id], (updateError) => {
                  if (updateError) {
                    console.error('Error executing MySQL query: ' + updateError);
                    res.status(500).json({ message: 'Internal Server Error' });
                  } else {
                    res.status(200).json({ message: 'Password updated successfully', user: results[0] });
                  }
                });
              }
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
