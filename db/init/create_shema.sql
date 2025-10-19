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
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabelle: messages
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Beispiel-Einträge
-- -----------------------------------------------------

INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@example.com', 'HASHEDPASSWORD1'),
('max', 'max@example.com', 'HASHEDPASSWORD2'),
('lisa', 'lisa@example.com', 'HASHEDPASSWORD3');

INSERT INTO messages (user_id, content) VALUES
(1, 'Willkommen bei der Message App!'),
(2, 'Hallo zusammen 👋'),
(3, 'Testnachricht von Lisa.');