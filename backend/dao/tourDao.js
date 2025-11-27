const helper = require('../helper.js');
const BusDao = require('./busesDao.js');

class TourDao {

    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('TourDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    getAllTours(callback) {
        const sql = 'SELECT tour_id, tour_description, tour_date, destination, bus_id, picture_path FROM tours';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, (error, results) => {
                if (error) {
                    return reject(new Error('Database error: ' + error.message));
                }
                resolve(results);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    //load tours on windows scroll
    loadMoreTours(offset, limit, callback) {
        const sql = 'SELECT * FROM tours LIMIT ?, ?';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [offset, limit], (error, results) => {
                if (error) {
                    return reject(new Error('Database error: ' + error.message));
                }
                if (helper.isArrayEmpty(results)) {
                    resolve([]);
                }
                resolve(results);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    getTourById(id, callback) {
        const sql = 'SELECT tour_id, tour_description, tour_date, destination, bus_id, picture_path FROM tours WHERE tour_id = ?';
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [id], (error, results) => {
                if (error) {
                    return reject(new Error('Database error: ' + error.message));
                }
                if (helper.isArrayEmpty(results)) {
                    return reject(new Error('No Record found by id=' + id));
                }

                const busDao = new BusDao(this._conn);
                busObject = busDao.getBusById(results[0].bus_id)
                    if (busError) {
                        return reject(new Error('Could not fetch bus with id ' + results[0].bus_id + ': ' + busError.message));
                    }
                    //remove bus_id field and add bus object
                    delete results[0].bus_id;
                    results[0].bus = bus || null;

                    // Debug log removed for production
                    resolve(results[0]);
                });
            });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    createTour(tour_description, tour_date, destination, bus_id, picture_path, callback) {
        const sql = `INSERT INTO tours (tour_description, destination, picture_path, tour_date, bus_id) VALUES (?, ?, ?, ?, ?)`;
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, [tour_description, destination, picture_path, tour_date, bus_id], (err, result) => {
                if (err) {
                    console.error('Error creating tour:', err.message);
                    return reject(err);
                }
                resolve(result.insertId);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    updateTour(tour_id, tourData, callback) {
        // Dynamically build SET clause based on provided tourData
        const setClauses = [];
        const params = [];
        for (const [key, value] of Object.entries(tourData)) {
            setClauses.push(`${key} = ?`);
            params.push(value);
        }
        const sql = 'UPDATE tours SET ' + setClauses.join(', ') + ' WHERE tour_id = ?';
        params.push(tour_id);
        const promise = new Promise((resolve, reject) => {
            this._conn.query(sql, params, (error, result) => {
                if (error) {
                    return reject(new Error('Could not update Record. Reason: ' + error.message));
                }
                resolve(true);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }

    deleteTour(id, callback) {
        const sql = 'DELETE FROM tours WHERE tour_id = ?';
        const promise = new Promise((resolve, reject) => {
        this._conn.query(sql, [id], (error, result) => {
                if (error) {
                    return reject(new Error('Could not delete Record by id=' + id + '. Reason: ' + error.message));
                }
                if (result.affectedRows != 1) {
                    return reject(new Error('Could not delete Record by id=' + id));
                }
                resolve(true);
            });
        });
        return require('../helper.js').maybeCallback(promise, callback);
    }
}

module.exports = TourDao;