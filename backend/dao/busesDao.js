const helper = require('../helper.js');

class TourDao {
    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    async loadById(id) {
        const [rows] = await this._conn.promise().query(
            'SELECT bus_id, bus_seats_company_id FROM buses WHERE bus_id = ?',
            [id]
        );
        if (helper.isArrayEmpty(rows)) {
            throw new Error('No Record found by id=' + id);
        }
        return rows[0];
    }

    async loadAll(){
        try {
            const [rows] = await this._conn.promise().query(
                'SELECT bus_id, bus_seats_company_id FROM buses'
            );
            if (helper.isArrayEmpty(rows)) return [];
            return rows;
        } catch (err){
            throw new Error('Datenbankfehler loadAll: ' + err.message);
        }

    }


}

module.exports = TourDao;