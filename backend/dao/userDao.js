const helper = require('../helper.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey'; // Sollte in einer Umgebungsvariablen gespeichert werden

class UserDao {
    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('UserDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    async getAllUsers() {
        const sql = 'SELECT user_id, username, email, user_role, password_hash, address, created_at FROM users';
        const [rows] = await this._conn.promise().query(sql);
        return rows;
    }

    getUserByID(userId, callback) {
        var sql = 'SELECT user_id, username, email, user_role, password_hash, created_at, address FROM users WHERE user_id = ?';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [userId], (error, results) => {
                if (error) {
                    return reject(new Error('Error fetching User: ' + error.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve(null);
                }
                resolve(results[0]);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    getUserByUserName(username, callback) {
        const sql = 'SELECT username, email, user_role, password_hash FROM users WHERE username = ?';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [username], (err, results) => {
                if (err) {
                    return reject(new Error('Error fetching User: ' + err.message));
                }
                // If no row found, resolve with null so callers can check for absence
                if (helper.isArrayEmpty(results)) {
                    return resolve(null);
                }
                resolve(results[0]);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    } 

    createUser(username, email, user_role, passwordOrHash, callback) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (username, email, user_role, password_hash) VALUES (?, ?, ?, ?)';
            // Detect if passwordOrHash already looks like a bcrypt hash (starts with $2)
            const seemsHashed = (typeof passwordOrHash === 'string' && passwordOrHash.startsWith('$2') && passwordOrHash.length >= 50);

            const insert = (finalHash) => {
                this._conn.query(sql, [username, email, user_role, finalHash], (err, results) => {
                    if (err) {
                        return reject(new Error('Error creating user: ' + err.message));
                    }
                    resolve(results.insertId);
                });
            };

            if (seemsHashed) {
                console.error('createUser: received pre-hashed password, skipping re-hash');
                insert(passwordOrHash);
                return;
            }

            // Otherwise hash now
            bcrypt.hash(passwordOrHash, 10, (err, hashedPassword) => {
                if (err) {
                    return reject(new Error('Error hashing password: ' + err.message));
                }
                insert(hashedPassword);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }


    async createUser_form({ username, address, email, user_role, password_hash, created_at }) {
    const sql = "INSERT INTO users (username, address, email, user_role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)";
    try {
        const [result] = await this._conn.promise().query(sql, [username, address, email, user_role, password_hash, created_at]);
        return result.insertId; // ID des neuen Users
    } catch (error) {
        throw new Error("Database error: " + error.message);
    }
    }



    comparePassword(inputPassword, hashedPassword, callback) {
        const promise = new Promise((resolve, reject) => {
            // Validierung
            if (!inputPassword || !hashedPassword) {
                return reject(new Error('Missing password or hash for comparison'));
            }
            // Basic sanity check: looks like bcrypt hash?
            if (typeof hashedPassword === 'string' && !hashedPassword.startsWith('$2')) {
                return reject(new Error('Stored password hash is invalid'));
            }
            // WICHTIG: bcrypt.compare(plaintext, hash, cb)
            bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
                if (err) {                
                    return reject(new Error('Error comparing passwords: ' + err.message));
                }
                if (!result) {
                    return reject(new Error('Passwords do not match'));
                }
                return resolve(result);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    generateToken(username) {
        return jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });
    }

    updateUserPassword(username, newPassword, callback) {
        const promise = new Promise((resolve, reject) => {
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    reject(new Error('Error hashing new password: ' + err.message));
                }
                const sql = 'UPDATE users SET password_hash = ? WHERE username = ?';
                this._conn.query(sql, [hashedPassword, username], (err, results) => {
                    if (err) {
                        console.error('Error changing user password:', err.message);
                        reject(err);
                    }
                    resolve(results.affectedRows > 0);
                });
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    updateUser(userId, userData, callback) {
        // Dynamically build SET clause based on provided userData
        const setClauses = [];
        const params = [];
        for (const [key, value] of Object.entries(userData)) {
            setClauses.push(`${key} = ?`);
            params.push(value);
        }
        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
        console.log('Update User SQL:', sql, 'Params:', params.concat([userId]));
        params.push(userId);
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, params, (err, results) => {
                if (err) {
                    return reject(err);
                }
                console.log('Update User Results:', results);
                resolve(results.affectedRows > 0);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    //bestehenden benutzer ändern via id
        updateUserByID(userId, userData, callback) {
        // Dynamically build SET clause based on provided userData
        const setClauses = [];
        const params = [];
        for (const [key, value] of Object.entries(userData)) {
            setClauses.push(`${key} = ?`);
            params.push(value);
        }
        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE user_id = ?`;
        console.log('Update User SQL:', sql, 'Params:', params.concat([userId]));
        params.push(userId);
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, params, (err, results) => {
                if (err) {
                    return reject(err);
                }
                console.log('Update User Results:', results);
                resolve(results.affectedRows > 0);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    deleteUserByID(userId, callback) {
        const sql = 'DELETE FROM users WHERE user_id = ?';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(new Error('Error deleting user: ' + err.message));
                }
                resolve(results.affectedRows > 0);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

}

module.exports = UserDao;