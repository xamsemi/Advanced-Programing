-- -----------------------------------------------------
-- Datenbank: busfahrt_app
-- -----------------------------------------------------

CREATE DATABASE IF NOT EXISTS busfahrt_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE busfahrt_app;

-- -----------------------------------------------------
-- Tabelle: users
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  user_role ENUM('admin', 'user') DEFAULT 'user',
  tours_taken JSON,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabelle: fahrten
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS fahrten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  tour_date datetime NOT NULL,
  bus_id INT NOT NULL,
  destination VARCHAR(100) NOT NULL,
  pictures JSON
);

-- -----------------------------------------------------
-- Tabelle: bus_companys
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS bus_companys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE 
);

-- -----------------------------------------------------
-- Tabelle: bus
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS bus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seats INT NOT NULL
);

-- -----------------------------------------------------
-- Beispiel-Einträge
-- -----------------------------------------------------

INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@example.com', 'HASHEDPASSWORD1'),
('max', 'max@example.com', 'HASHEDPASSWORD2'),
('lisa', 'lisa@example.com', 'HASHEDPASSWORD3');
INSERT INTO bus_companys (company_name, contact_info, email) VALUES
('BestBus GmbH', 'Musterstraße 1, 12345 Musterstadt', 'best@bus.de' ),
('TravelExpress', 'Reiseweg 5, 54321 Reisestadt', 'travel@express.de' );
INSERT INTO bus (seats) VALUES
(50),
(30); 