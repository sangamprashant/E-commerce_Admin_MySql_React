const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const requireLogin = require("../middleware/requireLogin");
const db = require('../db');

// Get responses
router.get("/api/responses", requireLogin, (req, res) => {
  const query = 'SELECT * FROM contacts WHERE responsed = 0';
  db.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

// Get a response by ID
router.get("/api/responses/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM contacts WHERE _id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Response not found" });
    } else {
      res.json(results[0]);
    }
  });
});

// Handle POST request to save a response
router.post('/api/responses/:id', requireLogin, (req, res) => {
  const { id } = req.params;
  const { responseMessage } = req.body;

  // Find the contact by ID
  const query = 'SELECT * FROM contacts WHERE _id = ?';
  db.query(query, [id], async (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    } else if (results.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const contact = results[0];

    // Check if the contact has already been responded to
    if (contact.responsed) {
      return res.status(400).json({ message: 'Contact has already been responded to' });
    }

    // Save the response and mark it as responded
    const updateQuery = 'UPDATE contacts SET response = ?, responsed = ? WHERE _id = ?';
    db.query(updateQuery, [responseMessage, 1, id], (updateError) => {
      if (updateError) {
        console.error(updateError);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      // Create a transporter object using SMTP transport
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Send an email to the user with both the response and the original message
      const mailOptions = {
        from: `"DIRAAZ" <${process.env.EMAIL}>`,
        to: contact.email,
        subject: 'Response to Your Message',
        text: `Original Message: ${contact.message}\nResponse: ${responseMessage}`,
      };

      transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          console.error(emailError);
          return res.status(500).json({ message: 'Error sending email' });
        } else {
          console.log('Email sent: ' + info.response);
          return res.json({ message: 'Response saved and email sent successfully.' });
        }
      });
    });
  });
});

router.get("/api/contacts/count", requireLogin, (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as count FROM contacts WHERE responsed=0';
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
