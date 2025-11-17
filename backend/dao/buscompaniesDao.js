const helper = require('../helper.js');

class BuscompaniesDao {

    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('BuscompaniesDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }
/*
    getAllBuscompanies(callback) {
        var sql = 'SELECT company_id, company_name FROM bus_companies';
        this._conn.query(sql, (error, results) => {
            if (error) {
                return callback(new Error('Database error: ' + error.message));
            }
            return callback(null, results);
        });
    }
*/

    async getAllBuscompanies() {
        const sql = 'SELECT company_id, company_name, contact_info, company_email FROM bus_companies';
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
    async getBuscompanyById(id) {
    const sql = 'SELECT company_id, company_name, contact_info, company_email FROM bus_companies WHERE company_id = ?';
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


    async createBuscompany({ company_name, contact_info, company_email   }) {
    const sql = "INSERT INTO bus_companies (company_name, contact_info, company_email) VALUES (?, ?, ?)";
    try {
        const [result] = await this._conn.promise().query(sql, [company_name, contact_info, company_email]);
        return result.insertId; // ID des neuen Busses
    } catch (error) {
        throw new Error("Database error: " + error.message);
    }
    }


    updateBuscompany(company_id, { company_name, contact_info, company_email }) {
        const sql = `
            UPDATE bus_companies
            SET company_name = ?, contact_info = ?, company_email = ?
            WHERE company_id = ?;
        `;

       const params = [company_name, contact_info, company_email, company_id];

       //this._conn.query(sql, params);
       //return id; // oder rows.affectedRows > 0
       //}
      return new Promise((resolve, reject) => {
      this._conn.query(sql, params, (err, result) => {
        if (err) {
          console.error("Fehler beim Update Company:", err);
          reject(err);
        } else {
          resolve({ affectedRows: result.affectedRows, company_id });
            }
        });
        });
        }






/*
   

    updateTour(tour_id, tourData, callback) {
        console.log('Updating tour:', tourData);
        var sql = 'UPDATE tours';

        // Dynamically build SET clause based on provided tourData
        const setClauses = [];
        const params = [];
        for (const [key, value] of Object.entries(tourData)) {
            setClauses.push(`${key} = ?`);
            params.push(value);
            console.log(`Updating field ${key} to value ${value}`);
        }
        sql += ' SET ' + setClauses.join(', ') + ' WHERE tour_id = ?';
        params.push(tour_id);

        console.log('Executing SQL:', sql, 'with params:', params);

        this._conn.query(sql, params, (error, result) => {
            if (error) {
                return callback(new Error('Could not update Record. Reason: ' + error.message));
            }
            return callback(null, true);
        });
    }

    
    deleteBuscompany(id, callback) {
        try {
            var sql = 'DELETE FROM bus_companies WHERE company_id = ?';
            this._conn.query(sql, [id], (error, result) => {
                if (error) {
                    return callback(new Error('Could not delete Record by id=' + id + '. Reason: ' + error.message));
                }
                if (result.affectedRows != 1) {
                    return callback(new Error('Could not delete Record by id=' + id));
                }
            });
            return callback(null, true);
        } catch (ex) {
            return callback(new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message));
        }
        
    }
    */
    toString() {
        console.log('BuscompaniesDao [_conn=' + this._conn + ']');
    }
}

module.exports = BuscompaniesDao;