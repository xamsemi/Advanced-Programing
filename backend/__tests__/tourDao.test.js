const mysql = require('mysql2');
const TourDao = require('../dao/tourDao');

// Integration tests that use a real MySQL instance. Configure via env vars:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'my-secret-pw';
const DB_NAME = process.env.DB_NAME || 'busfahrt_app';

let db;

function parseLocalDatetimeString(dtStr) {
	// dtStr expected format: YYYY-MM-DD HH:MM:SS
	const m = dtStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
	if (!m) return new Date(dtStr);
	const [_, y, mm, d, hh, min, ss] = m;
	return new Date(Number(y), Number(mm) - 1, Number(d), Number(hh), Number(min), Number(ss));
}

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

    const tour_description = 'Integration Test Tour Init Data';
	const tour_date = new Date();
	const destination = 'Test City';
	const bus_id = 1;
	const picture_path = 'pic1.jpg';

	test('Function createTour', async () => {
		const dao = new TourDao(db);        
        //Create
		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(insertId).toBeGreaterThan(0);
		expect(typeof insertId).toBe('number');
	}, 20000);

	test('Function getTourById', async () => {
		const dao = new TourDao(db);        
		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		const tour = await new Promise((res, rej) => {
			console.log('Fetching tour with ID:', insertId);
			dao.getTourById(insertId, (err, t) => (err ? rej(err) : res(t)));
		});
		expect(tour).toBeDefined();
		expect(tour.tour_description).toBe(tour_description);
		expect(tour.tour_date instanceof Date).toBe(true);
		expect(tour.destination).toBe(destination);
		expect(tour.bus_id).toBe(bus_id);
		expect(tour.picture_path).toBe(picture_path);
	}, 20000);

	test('Function getAllTours', async () => {
		const dao = new TourDao(db);
		const tours = await new Promise((res, rej) => {
			dao.getAllTours((err, t) => (err ? rej(err) : res(t)));
		});
		expect(tours).toBeDefined();
		expect(Array.isArray(tours)).toBe(true);
		expect(tours.length).toBeGreaterThan(0);
	});	

	test('Function deleteTour', async () => {
		const dao = new TourDao(db);

		// create a tour to delete
		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(insertId).toBeGreaterThan(0);

		const ok = await new Promise((res, rej) => {
			dao.deleteTour(insertId, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

	test('Function loadMoreTours', async () => {
		const dao = new TourDao(db);        
        //Create Tours
		for (let i = 0; i < 5; i++) {
			const insertId = await new Promise((res, rej) => {
				dao.createTour(tour_description + ' More: ' + i, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
			});
			expect(insertId).toBeGreaterThan(0);
			expect(typeof insertId).toBe('number');
		}

        //Read
		const tours = await new Promise((res, rej) => {
			dao.loadMoreTours(0, 10, (err, t) => (err ? rej(err) : res(t)));
		});
		expect(tours).toBeDefined();
		expect(tours.length).toBeGreaterThan(0);

		expect(tours[5].destination).toBe(destination);
		expect(tours[5].bus_id).toBe(bus_id);
		expect(tours[5].picture_path).toBe(picture_path);
	}, 20000);

describe('Update Tour Data', () => {

	const tour_description = 'Integration Test Tour Update Data';
	const tour_date = new Date();
	const destination = 'New Test City';
	const bus_id = 2;
	const picture_path = 'pic5.jpg';


	test('with description change', async () => {
        const dao = new TourDao(db);

		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, new Date(), destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		console.log('Created tour with ID for update test:', insertId);
		expect(insertId).toBeGreaterThan(0);
		
		const ok = await new Promise((res, rej) => {
			dao.updateTour(insertId, { tour_description: 'Update the Tour Data Description' }, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

	test('with bus change', async () => {
        const dao = new TourDao(db);

		const bus_id = 12;
		const createBus = await new Promise((res, rej) => {
			dao.createBus(bus_id, 50, 'Mercedes', 'ABC-123', (err, id) => (err ? rej(err) : res(id)));
		});
		expect(createBus).toBeGreaterThan(0);

		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, new Date(), destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		console.log('Created tour with ID for update test:', insertId);
		expect(insertId).toBeGreaterThan(0);
		
		const ok = await new Promise((res, rej) => {
			dao.updateTour(insertId, { bus_id: 12 }, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

	test('with tour date change', async () => {
        const dao = new TourDao(db);

		const insertId = await new Promise((res, rej) => {
			dao.createTour(tour_description, new Date(), destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
		});
		console.log('Created tour with ID for update test:', insertId);
		expect(insertId).toBeGreaterThan(0);
		
		const ok = await new Promise((res, rej) => {
			dao.updateTour(insertId, { tour_date: new Date() }, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

});
});
