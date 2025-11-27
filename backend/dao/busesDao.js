const helper = require('../helper.js');
const BuscompaniesDao = require('./buscompaniesDao.js');

class BusesDao {

    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('BusesDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    async getAllBuses() {
        const sql = 'SELECT bus_id, bus_seats, company_id FROM buses';
        const [rows] = await this._conn.promise().query(sql);
        return rows;
    }

    async getBusById(id) {
        const buscompaniesDao = new BuscompaniesDao(this._conn);
        const sql = 'SELECT bus_id, bus_seats, company_id FROM buses WHERE bus_id = ?';
        try {
            var result = await this._conn.promise().query(sql, [id]);
            if (helper.isArrayEmpty(rows)) {
                throw new Error('No Record found by id=' + id);
            }
            result.company = buscompaniesDao.getBuscompanyById(rows[0].company_id);
            return result;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    async createBus({ bus_seats, company_id }) {
        const sql = "INSERT INTO buses (bus_seats, company_id) VALUES (?, ?)";
        try {
            const [result] = await this._conn.promise().query(sql, [bus_seats, company_id]);
            return result.insertId; // ID des neuen Busses
        } catch (error) {
            throw new Error("Database error: " + error.message);
        }
    }


    updateBus(bus_id, {bus_seats}) {

        const sql = "UPDATE buses SET bus_seats = ? WHERE bus_id = ?";
        const params = [bus_seats,bus_id];
        return new Promise((resolve, reject) => {
            this._conn.query(sql, params, (err, result) => {
                if (err) {
                    console.error("Fehler beim Update:", err);
                    reject(err);
                } else {
                    resolve({ affectedRows: result.affectedRows, bus_id });
                }
            });
        });
    }

    deleteBus(bus_id, callback) {
        try {
            var sql = 'DELETE FROM buses WHERE bus_id = ?';
            this._conn.query(sql, [bus_id], (error, result) => {
                if (error) {
                    return callback(new Error('Could not delete Record (bus) by id=' + bus_id + '. Reason: ' + error.message));
                }
                if (result.affectedRows != 1) {
                    return callback(new Error('Could not delete Record (bus) by id=' + bus_id));
                }
                return callback(null, true);
            });
            
        } catch (error) {
            return callback(new Error('Could not delete Record (bus) by id=' + bus_id + '. Reason: ' + error.message));
        }
    }
}

module.exports = BusesDao;