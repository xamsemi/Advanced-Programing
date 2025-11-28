const helper = require('../helper.js');

class BuscompaniesDao {

    constructor(dbConnection) { // Übergabe der Datenbankverbindung
        if (!dbConnection) {
            throw new Error('BuscompaniesDao requires a valid dbConnection');
        }
        this._conn = dbConnection;
    }

    async getAllBuscompanies() {
        const sql = 'SELECT company_id, company_name, contact_info, company_email FROM bus_companies';
        const [rows] = await this._conn.promise().query(sql);
        return rows;
    }

    async getBuscompanyById(id) {
        console.log("Fetching Buscompany with ID:", id);
        const sql = 'SELECT company_id, company_name, contact_info, company_email FROM bus_companies WHERE company_id = ?';
        try {
            const [rows] = await this._conn.promise().query(sql, [id]);
            if (helper.isArrayEmpty(rows)) {
                throw new Error('No Record found by company id=' + id);
            }
            return rows[0];
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    async createBuscompany({ company_name, contact_info, company_email }) {
        const sql = "INSERT INTO bus_companies (company_name, contact_info, company_email) VALUES (?, ?, ?)";
        try {
            const [result] = await this._conn.promise().query(sql, [company_name, contact_info, company_email]);
            return result.insertId; // ID des neuen Busunternehmen
        } catch (error) {
            throw new Error("Database error: " + error.message);
        }
    }

    updateBuscompany(company_id, { company_name, contact_info, company_email }) {
        const sql = "UPDATE bus_companies SET company_name = ?, contact_info = ?, company_email = ? WHERE company_id = ?";
        const params = [company_name, contact_info, company_email, company_id];

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
}

module.exports = BuscompaniesDao;