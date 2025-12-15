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
        const tourDao = new TourDao(this._conn);        
        const promise = new Promise((resolve, reject) => {
            const sql = `SELECT user_id, tour_id FROM user_tours WHERE user_id = ?`;
            this._conn.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(new Error('Could not fetch tours for user: ' + err.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve({ user_id: userId, tours: [] });
                }

                // deduplizieren, sortieren und in gewünschtes Format bringen
                const tourIds = Array.from(new Set(results.map(r => r.tour_id))).sort((a, b) => a - b);
                const tours = tourIds.map(id => ({ tour_id: id }));

                //Detaillierte Tour-Daten laden
                const detailedTourPromises = tours.map(t => tourDao.getTourById(t.tour_id));
                Promise.all(detailedTourPromises).then(detailedTours => {
                    //console.log('DETAILED TOURS:', detailedTours); // DEBUG
                    return resolve({ user_id: userId, tours: detailedTours });
                }).catch(err => {
                    return reject(new Error('Could not fetch detailed tour data: ' + err.message));
                });
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    // Alle Touren eines Users laden (einfache Version ohne Details)
    getToursByUserSimple(userId, callback) {
        const tourDao = new TourDao(this._conn);        
        const promise = new Promise((resolve, reject) => {
            const sql = `SELECT user_id, tour_id FROM user_tours WHERE user_id = ?`;
            this._conn.query(sql, [userId], (err, results) => {
                if (err) {
                    return reject(new Error('Could not fetch tours for user: ' + err.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve({ user_id: userId, tours: [] });
                }

                //einfache Tour-Daten laden
                return resolve({ user_id: userId, tours: results });
                });
            });
    
        return require('../helper.js').maybeCallback(promise, callback);
    }





    // Alle User einer Tour laden
    // Supports either (tourId, callback) or returns a Promise when no callback provided
    getUsersByTour(tourId, callback) {
        const userDao = new UserDao(this._conn);
        const promise = new Promise((resolve, reject) => {
            const sql = 'SELECT tour_id, user_id FROM user_tours WHERE tour_id = ?';
            this._conn.query(sql, [tourId], (err, results) => {
                if (err) {
                    return reject(new Error('Could not fetch users for tour: ' + err.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return resolve({ tour_id: tourId, users: [] });
                }

                // deduplizieren, sortieren und in gewünschtes Format bringen
                const userIds = Array.from(new Set(results.map(r => r.user_id))).sort((a, b) => a - b);
                const users = userIds.map(id => ({ user_id: id }));

                // Optional: Detaillierte Tour-Daten laden
                const detailedUserPromises = users.map(t => userDao.getTourById(t.tour_id));
                Promise.all(detailedUserPromises).then(detailedUsers => {
                    console.log('DETAILED USERS:', detailedUsers);
                    return resolve({ tour_id: tourId, users: detailedUsers });
                }).catch(err => {
                    return reject(new Error('Could not fetch detailed user data: ' + err.message));
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