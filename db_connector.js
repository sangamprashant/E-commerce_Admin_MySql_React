const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    process.exit(1); // Terminate the application on database connection error
  }
  console.log('Connected to MySQL as ID ' + db.threadId);

  // Check and create tables if they do not exist
  createTables();

  // You can add your other logic here
});

function createTables() {
  // SQL statements to create tables if they do not exist
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
    );

    CREATE TABLE IF NOT EXISTS categories (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent INT DEFAULT NULL,
      properties LONGTEXT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
    );

    CREATE TABLE IF NOT EXISTS clients (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      Aphone VARCHAR(20) DEFAULT NULL,
      image VARCHAR(255) DEFAULT NULL,
      parent INT DEFAULT NULL,
      created_at DATETIME DEFAULT current_timestamp(),
      updated_at DATETIME DEFAULT current_timestamp() ON UPDATE current_timestamp()
    );

    CREATE TABLE IF NOT EXISTS contacts (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      response TEXT DEFAULT NULL,
      responsed TINYINT(1) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
    );

    CREATE TABLE IF NOT EXISTS orders (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) DEFAULT NULL,
      total VARCHAR(255) DEFAULT NULL,
      email VARCHAR(255) DEFAULT NULL,
      city VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(255) DEFAULT NULL,
      APhone VARCHAR(255) DEFAULT NULL,
      postalCode VARCHAR(255) DEFAULT NULL,
      street VARCHAR(255) DEFAULT NULL,
      country VARCHAR(255) DEFAULT NULL,
      status VARCHAR(255) DEFAULT NULL,
      paid TINYINT(1) DEFAULT NULL,
      line_items LONGTEXT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
    );

    CREATE TABLE IF NOT EXISTS products (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      price DECIMAL(10,2) NOT NULL,
      images LONGTEXT DEFAULT NULL,
      category_id INT DEFAULT NULL,
      properties LONGTEXT DEFAULT NULL,
      isDeleted TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      FOREIGN KEY (category_id) REFERENCES categories(_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      subscribed_at DATETIME DEFAULT current_timestamp(),
      UNIQUE KEY email (email)
    );
  `;

  db.query(createTablesSQL, (err) => {
    if (err) {
      console.error('Error creating tables: ' + err.message);
    } else {
      console.log('Tables created successfully.');
    }
  });
}

module.exports = db;
