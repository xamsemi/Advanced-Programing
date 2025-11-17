const helper = require('../helper.js');

class BusesDao {

    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('BusesDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }
/*
    getAllBuses(callback) {
        var sql = 'SELECT bus_id, bus_seats, company_id FROM buses';
        this._conn.query(sql, (error, results) => {
            if (error) {
                return callback(new Error('Database error: ' + error.message));
            }
            return callback(null, results);
        });
    }
*/

async getAllBuses() {
    const sql = 'SELECT bus_id, bus_seats, company_id FROM buses';
    const [rows] = await this._conn.promise().query(sql);
    return rows;
  }
/*
    //load tours on windows scroll
    loadMoreTours(offset, limit, callback) {
        var sql = 'SELECT * FROM tours LIMIT ?, ?';
         this._conn.query(sql, [offset, limit], (error, results) => {
            if (error) {
                return callback(new Error('Database error: ' + error.message));
            }
            if (helper.isArrayEmpty(results)) {
                return callback(null, []);
            }
            return callback(null, results);
        });
    }
*/
/* Variante wie in TourDao
    getBusById(id, callback) {
        var sql = 'SELECT bus_id, bus_seats, company_id FROM buses WHERE bus_id = ?';
        this._conn.query(sql, [id], (error, results) => {
            if (error) {
                return callback(new Error('Database error: ' + error.message));
            }
            if (helper.isArrayEmpty(results)) {
                return callback(new Error('No Record found by id=' + id));
            }
            return callback(null, results[0]);
        });
    }
*/
    async getBusById(id) {
    const sql = 'SELECT bus_id, bus_seats, company_id FROM buses WHERE bus_id = ?';
    try {
        const [rows] = await this._conn.promise().query(sql, [id]);
        if (helper.isArrayEmpty(rows)) {
            throw new Error('No Record found by id=' + id);
        }
        return rows[0];
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
        //console.log('Updating bus:', bus_seats);
        

        //const { bus_seats } = busData;
        const sql = `
            UPDATE buses
            SET bus_seats = ?
            WHERE bus_id = ?;
        `;

       const params = [bus_seats,bus_id];

       //this._conn.query(sql, params);
       //return id; // oder rows.affectedRows > 0
       //}
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


    deleteBus(id, callback) {
        try {
            var sql = 'DELETE FROM buses WHERE bus_id = ?';
            this._conn.query(sql, [id], (error, result) => {
                if (error) {
                    return callback(new Error('Could not delete Record (bus) by id=' + id + '. Reason: ' + error.message));
                }
                if (result.affectedRows != 1) {
                    return callback(new Error('Could not delete Record (bus) by id=' + id));
                }
                return callback(null, true);
            });
            
        } catch (ex) {
            return callback(new Error('Could not delete Record (bus) by id=' + id + '. Reason: ' + ex.message));
        }
        
    }

    toString() {
        console.log('BusesDao [_conn=' + this._conn + ']');
    }
}

module.exports = BusesDao;