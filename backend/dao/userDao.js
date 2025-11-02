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

    getConnection() {
        return this._conn;
    }

    getUserByID(userId, callback) {
        const sql = 'SELECT username, email, user_role, password_hash FROM users WHERE user_id = ?';
        console.log('Fetching user by ID:', userId);
        try {

            this._conn.query(sql, [userId], (err, results) => {
                if (err) {
                    console.error('Error fetching user:', err.message);
                    return callback(err); // Fehler an den Aufrufer weitergeben
                }
                if (results.length > 0) {
                    callback(null, results[0]);
                } else {
                    callback(null, null); // Benutzer nicht gefunden
                }
            });
        } catch (err) {
            console.error('Unexpected error fetching user:', err.message);
            callback(err);
        }
    }

    getUserByUserName(username, callback) {
        const sql = 'SELECT username, email, user_role, password_hash FROM users WHERE username = ?';
        console.log('Fetching user by username:', username);
        try {

            this._conn.query(sql, [username], (err, results) => {
                if (err) {
                    console.error('Error fetching user:', err.message);
                    return callback(err); // Fehler an den Aufrufer weitergeben
                }
                if (results.length > 0) {
                    const user = results[0];
                    console.log('Service User: DB returned keys =', Object.keys(user));
                    // Normalize common column names to password_hash
                    if (!user.password_hash) {
                        const alt = user.hashed_password || user.password || user.passwordHash || user.pass_hash;
                        if (alt) {
                            console.error('Service User: mapping alternative hash column to password_hash');
                            user.password_hash = alt;
                        } else {
                            console.error('Service User: no password hash column found in DB result');
                        }
                    } else {
                        console.log('Service User: password_hash length=', user.password_hash ? user.password_hash.length : 'undefined');
                    }
                    callback(null, user);
                } else {
                    callback(null, null); // Benutzer nicht gefunden
                }
            });
        } catch (err) {
            console.error('Unexpected error fetching user:', err.message);
            callback(err);
        }
    }

    createUser(username, email, user_role, passwordOrHash, callback) {
        const sql = 'INSERT INTO users (username, email, user_role, password_hash) VALUES (?, ?, ?, ?)';
        // Detect if passwordOrHash already looks like a bcrypt hash (starts with $2)
        const seemsHashed = (typeof passwordOrHash === 'string' && passwordOrHash.startsWith('$2') && passwordOrHash.length >= 50);

        const insert = (finalHash) => {
            this._conn.query(sql, [username, email, user_role, finalHash], (err, results) => {
                if (err) {
                    console.error('Error creating user:', err.message);
                    return callback(err);
                }
                callback(null, results.insertId);
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
                console.error('Error hashing password:', err.message);
                return callback(err);
            }
            insert(hashedPassword);
        });
    }

    comparePassword(inputPassword, hashedPassword, callback) {
        // Validierung
        if (!inputPassword || !hashedPassword) {
            const err = new Error('Missing password or hash for comparison');
            return callback(err);
        }

        // Basic sanity check: looks like bcrypt hash?
        if (typeof hashedPassword === 'string' && !hashedPassword.startsWith('$2')) {
            console.error('Service User: WARNING - stored password does not look like a bcrypt hash');
        }

        // WICHTIG: bcrypt.compare(plaintext, hash, cb)
        bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err.message);
                return callback(err);
            }
            if (!result) {
                console.error('Passwords do not match');
            } else {
                console.log('Passwords match');
            }
            callback(null, result);
        });
    }

    generateToken(username) {
        return jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });
    }

    updateUserPassword(username, newPassword, callback) {
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing new password:', err.message);
                return callback(err);
            }
            const sql = 'UPDATE users SET password_hash = ? WHERE username = ?';
            this._conn.query(sql, [hashedPassword, username], (err, results) => {
                if (err) {
                    console.error('Error changing user password:', err.message);
                    return callback(err);
                }
                callback(null, results.affectedRows > 0);
            });
        });
    }

    updateUserEmail(username, newEmail, callback) {
        const sql = 'UPDATE users SET email = ? WHERE username = ?';
        this._conn.query(sql, [newEmail, username], (err, results) => {
            if (err) {
                console.error('Error updating user email:', err.message);
                return callback(err);
            }
            callback(null, results.affectedRows > 0);
        });
    }

    updateUserRole(username, newRole, callback) {
        const sql = 'UPDATE users SET user_role = ? WHERE username = ?';
        this._conn.query(sql, [newRole, username], (err, results) => {
            if (err) {
                console.error('Error updating user role:', err.message);
                return callback(err);
            }
            callback(null, results.affectedRows > 0);
        });
    }

    updateUserName(oldUsername, newUsername, callback) {
        const sql = 'UPDATE users SET username = ? WHERE username = ?';
        this._conn.query(sql, [newUsername, oldUsername], (err, results) => {
            if (err) {
                console.error('Error updating user name:', err.message);
                return callback(err);
            }
            callback(null, results.affectedRows > 0);
        });
    }

    deleteUser(username, callback) {
        const sql = 'DELETE FROM users WHERE username = ?';
        this._conn.query(sql, [username], (err, results) => {
            if (err) {
                console.error('Error deleting user:', err.message);
                return callback(err);
            }
            callback(null, results.affectedRows > 0);
        });
    }
}
module.exports = UserDao;