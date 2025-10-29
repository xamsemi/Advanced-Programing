const mysql = require('mysql2');
const TourDao = require('../dao/tourDao');

// Integration tests that use a real MySQL instance. Configure via env vars:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'my-secret-pw';
const DB_NAME = process.env.DB_NAME || 'busfahrt_app';

let db;

function queryPromise(conn, sql, params) {
	return new Promise((resolve, reject) => {
		conn.query(sql, params, (err, res) => (err ? reject(err) : resolve(res)));
	});
}

beforeAll(async () => {
	// connect to server (without selecting DB yet)
	db = mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
	await new Promise((res, rej) => db.connect(err => (err ? rej(err) : res())));

	// create database if missing
	await queryPromise(db, `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
	// switch to db
	await queryPromise(db, `USE \`${DB_NAME}\``);

	// create users table if missing
	const createSql = `CREATE TABLE IF NOT EXISTS tours (
  tour_id INT AUTO_INCREMENT PRIMARY KEY,
  tour_description TEXT NOT NULL,
  tour_date DATETIME NOT NULL,
  destination VARCHAR(100) NOT NULL,
  bus_id INT NOT NULL,
  picture_path VARCHAR(255),
  FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)`;


	await queryPromise(db, createSql);

	// clean tours table for deterministic tests - disable FK checks while deleting
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=0');
	await queryPromise(db, 'DELETE FROM tours');
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=1');
});

afterAll(async () => {
	if (db && db.end) await new Promise(res => db.end(res));
});

describe('TourDao integration with real DB', () => {

    const tour_description = 'Integration Test Tour';
    const tour_date = '2024-12-31 10:00:00';
	const destination = 'Test City';
	const bus_id = 1;
	const picture_path = 'pic1.jpg';

	test('createTour -> getTourById', async () => {
		const dao = new TourDao(db);        
        //Create
		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(insertId).toBeGreaterThan(0);
		expect(typeof insertId).toBe('number');

        //Read
		const tour = await new Promise((res, rej) => {
			dao.getTourById(insertId, (err, t) => (err ? rej(err) : res(t)));
		});
		expect(tour).toBeDefined();
		expect(tour.tour_description).toBe(tour_description);
		expect(tour.tour_date).toBe(tour_date);
		expect(tour.destination).toBe(destination);
		expect(tour.bus_id).toBe(bus_id);
		expect(tour.picture_path).toBe(picture_path);
	}, 20000);

	test('Change Tour in Database', async () => {
        const dao = new TourDao(db);

        const ok = await new Promise((res, rej) => {
			dao.updateTour(insertId, { tour_description: 'Updated Tour' }, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);

		const tour = await new Promise((res, rej) => {
			dao.getTourById(insertId, (err, t) => (err ? rej(err) : res(t)));
			});
		expect(tour).toBeDefined();
		expect(tour.tour_description).toBe('Updated Tour');
	});

    test('delete Tour from Database', async () => {
        const dao = new TourDao(db);

        const ok = await new Promise((res, rej) => {
			dao.deleteTour(insertId, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

});
