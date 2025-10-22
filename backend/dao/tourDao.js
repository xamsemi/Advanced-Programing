const helper = require('../helper.js');
//const ProduktkategorieDao = require('./genresDao.js');
//const MehrwertsteuerDao = require('./mehrwertsteuerDao.js');

class bookDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = `SELECT b.*, g.genre_type FROM books b LEFT JOIN genres g ON b.book_genreid = g.genre_id WHERE b.book_id = ?`;
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);
        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM books';
        var statement = this._conn.prepare(sql);
        var result = statement.all(); 
        if (helper.isArrayEmpty(result)) 
            return [];
        return result;
    }


    create(bookTitle, bookAuthor, bookGenre, bookDescription, bookNr, bookStore, bookPrice, bookPath) {
        const sql = `INSERT INTO books (book_title, book_author, book_genreid, book_description, book_nr, book_store, book_price, book_path)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const statement = this._conn.prepare(sql);
        const params = [bookTitle, bookAuthor, bookGenre, bookDescription, bookNr, bookStore, bookPrice, bookPath];
        const result = statement.run(params);

        if (result.changes != 1) {
            throw new Error('Could not insert new record. Data: ' + params);
        }

        return this.loadById(result.lastInsertRowid);
    }

    update(bookId, bookTitle, bookAuthor, bookGenreId, bookDescription, bookNr, bookStore, bookPrice, bookPath) {

        var sql = 'UPDATE books SET book_title = ?, book_author = ?, book_genreid = ?, book_description = ?, book_nr = ?, book_store = ?, book_price = ?, book_path = ? WHERE book_id = ?';
        var statement = this._conn.prepare(sql);
        var params = [bookTitle, bookAuthor, bookGenreId, bookDescription, bookNr, bookStore, bookPrice, bookPath, bookId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(bookId);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM books WHERE book_id = ?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ProduktDao [_conn=' + this._conn + ']');
    }
}

module.exports = bookDao;