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
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  user_role ENUM('admin', 'user') DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabelle: bus_companies
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS bus_companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(255),
  company_email VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Tabelle: buses
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS buses (
  bus_id INT AUTO_INCREMENT PRIMARY KEY,
  bus_seats INT NOT NULL,
  company_id INT,
  FOREIGN KEY (company_id) REFERENCES bus_companies(company_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Tabelle: tours
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS tours (
  tour_id INT AUTO_INCREMENT PRIMARY KEY,
  tour_description TEXT NOT NULL,
  tour_date DATETIME NOT NULL,
  destination VARCHAR(100) NOT NULL,
  bus_id INT NOT NULL,
  pictures JSON,
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Tabelle: n:m Verknüpfung: users ↔ tours
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS user_tours (
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  PRIMARY KEY (user_id, tour_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(tour_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Beispiel-Einträge
-- -----------------------------------------------------

INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@example.com', 'HASHEDPASSWORD1'),
('max', 'max@example.com', 'HASHEDPASSWORD2'),
('lisa', 'lisa@example.com', 'HASHEDPASSWORD3');

INSERT INTO bus_companies (company_name, contact_info, company_email) VALUES
('BestBus GmbH', 'Musterstraße 1, 12345 Musterstadt', 'best@bus.de'),
('TravelExpress', 'Reiseweg 5, 54321 Reisestadt', 'travel@express.de');

INSERT INTO buses (bus_seats, company_id) VALUES
(50, 1),
(30, 2);

INSERT INTO tours (tour_description, tour_date, destination, bus_id) VALUES
('Tagesfahrt nach Hamburg', '2025-11-10 08:00:00', 'Hamburg', 1),
('Weihnachtsmarkt München', '2025-12-15 09:30:00', 'München', 2);

INSERT INTO user_tours (user_id, tour_id) VALUES
(2, 1),
(3, 1),
(3, 2);