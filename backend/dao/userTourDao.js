const helper = require('../helper.js');
const UserDao = require('./userDao.js');
const TourDao = require('./tourDao.js');

class UserTourDao {
    constructor(dbConnection) {
        if (!dbConnection) {
            throw new Error('UserTourDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    // Versuch als Promise Funktion...
    // User bucht eine Tour
    // Supports either (userId, tourId, callback) or returns a Promise when no callback provided
    bookTour(userId, tourId, callback) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'INSERT INTO user_tours (user_id, tour_id) VALUES (?, ?)';
            this._conn.query(sql, [userId, tourId], (err, result) => {
                if (err) {
                    return reject(new Error('Booking failed: ' + err.message));
                }
                resolve(result.insertId);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    // Alle Touren eines Users laden
    // Supports either (userId, callback) or returns a Promise when no callback provided
    getToursByUser(userId, callback) {        
        const promise = new Promise((resolve, reject) => {
            const sql = `SELECT user_id, tour_id FROM user_tours WHERE user_id = ?`;
            this._conn.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(new Error('Could not fetch tours for user: ' + err.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve([]);
                }

                const tourDao = new TourDao(this._conn);
                const promises = results.map(r => {
                    return new Promise((res, rej) => {
                        tourDao.getTourById(r.tour_id, (err2, tour) => {
                            if (err2) {
                                return rej(new Error('Could not fetch tour with id ' + r.tour_id + ': ' + err2.message));
                            }
                            r.tour = tour || null;
                            res(r);
                        });
                    });
                });

                Promise.all(promises).then(enriched => resolve(enriched)).catch(reject);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    // Alle User einer Tour laden
    // Supports either (tourId, callback) or returns a Promise when no callback provided
    getUsersByTour(tourId, callback) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'SELECT tour_id, user_id FROM user_tours WHERE tour_id = ?';
            this._conn.query(sql, [tourId], (err, results) => {
                if (err) {
                    return reject(new Error('Could not fetch users for tour: ' + err.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve([]);
                }
                const userDao = new UserDao(this._conn);
                const promiseAll = Promise.all(results.map(r => {
                    return new Promise((res, rej) => {
                        userDao.getUserByID(r.user_id, (err2, user) => {
                            if (err2) {
                                return rej(new Error('Could not fetch user with id ' + r.user_id + ': ' + err2.message));
                            }
                            r.user = user || null;
                            res(r);
                        });
                    });
                }));

                promiseAll.then(results => {
                    console.log('RESULT getUsersByTour:', results);
                    resolve(results);
                }).catch(err => {
                    reject(err);
                });
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    // Buchung löschen
    // Supports either (userId, tourId, callback) or returns a Promise when no callback provided
    cancelBooking(userId, tourId, callback) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'DELETE FROM user_tours WHERE user_id = ? AND tour_id = ?';
            this._conn.query(sql, [userId, tourId], (err, result) => {
                if (err) {
                    return reject(new Error('Could not cancel booking: ' + err.message));
                }
                resolve(result.affectedRows > 0);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }
}

module.exports = UserTourDao;