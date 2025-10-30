const helper = require('../helper.js');

class TourDao {
    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    async loadById(id) {
        const [rows] = await this._conn.promise().query(
            'SELECT tour_id, tour_name, tour_description, tour_date, destination FROM tours WHERE tour_id = ?',
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
                'SELECT tour_id, tour_name, tour_description, tour_date, destination FROM tours'
            );
            if (helper.isArrayEmpty(rows)) return [];
            return rows;
        } catch (err){
            throw new Error('Datenbankfehler loadAll: ' + err.message);
        }

    }


}

module.exports = TourDao;