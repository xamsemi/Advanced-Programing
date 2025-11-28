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
  address VARCHAR(255) DEFAULT NULL,
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
  picture_path VARCHAR(255),
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Tabelle: n:m Verknüpfung: users ↔ tours
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS user_tours (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(tour_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Default-Values
-- -----------------------------------------------------
-- Defaults for users
INSERT INTO users (username, email, address, password_hash, user_role) VALUES
('admin', 'admin@example.com', "Baumstraße2", '$2b$10$mxcoBSQtSQ9Uo3U3V1a3Hu0FHtANKUN46eRXdRbP4C00HMYWglnjG', 'admin'),
('max', 'max@example.com', "Vogelstraße5", '$2b$10$R.GpW78rdJs9Oq2WA.h0/ewa.1DFMJ/H1ASb.HsHvGDxUQEKHwp1W', 'user'),
('sabine', 'sabine@example.com', "Vogelstraße5", '$2b$10$R.GpW78rdJs9Oq2WA.h0/ewa.1DFMJ/H1ASb.HsHvGDxUQEKHwp1W', 'user'),
('daniel', 'daniel@example.com', "Vogelstraße5", '$2b$10$R.GpW78rdJs9Oq2WA.h0/ewa.1DFMJ/H1ASb.HsHvGDxUQEKHwp1W', 'user'),
('user', 'user@example.com', "Vogelstraße5", '$2b$10$sFY2aG9/Uno19hIDbu7FWuhr.JiS/K5PwbkpZM.nFGzLzjyWnGQbu', 'user');

INSERT INTO bus_companies (company_name, contact_info, company_email) VALUES
('BestBus GmbH', 'Musterstraße 1, 12345 Musterstadt', 'best@bus.de'),
('TravelExpress', 'Reiseweg 5, 54321 Reisestadt', 'travel@express.de');

-- -----------------------------------------------------
-- Defaults for buses
INSERT INTO buses (bus_seats, company_id) VALUES
(50, 1),
(30, 2),
(200, 1),
(40, 2);

-- -----------------------------------------------------
-- Defaults for tours und user_tours
INSERT INTO tours (tour_description, tour_date, destination, bus_id, picture_path) VALUES
('Faschingsfahrt nach Köln - Karnevalsumzug', '2026-02-15 10:00:00', 'Köln', 1, '/images/tours/koeln_fasching.jpg'),
('Faschingsausflug Mainz - Straßenkarneval', '2026-02-16 09:00:00', 'Mainz', 2, '/images/tours/mainz_fasching.jpg'),
('Rosenmontag in Düsseldorf - Umzug & Party', '2026-02-17 08:30:00', 'Düsseldorf', 3, '/images/tours/duesseldorf_rosenmontag.jpg'),
('Faschingsparty München - traditionelle Feier', '2026-02-13 11:00:00', 'München', 4, '/images/tours/muenchen_fasching.jpg'),
('Karneval in Nürnberg - Festumzug', '2026-02-14 10:30:00', 'Nürnberg', 1, '/images/tours/nuernberg_karneval.jpg'),
('Faschingsfahrt Berlin - Kostümparade', '2026-02-18 09:45:00', 'Berlin', 2, '/images/tours/berlin_kostuemparde.jpg');

-- -----------------------------------------------------
-- Defaults for tours und user_tours
INSERT INTO user_tours (user_id, tour_id) VALUES
(1, 3),
(1, 2),
(1, 1),
(2, 2),
(3, 1),
(3, 3);
