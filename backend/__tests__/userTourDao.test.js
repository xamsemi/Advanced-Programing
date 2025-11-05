const mysql = require('mysql2');
const UserTourDao = require('../dao/userTourDao');
const UserDao = require('../dao/userDao');
const TourDao = require('../dao/tourDao');

// Integration tests that use a real MySQL instance. Configure via env vars:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'my-secret-pw';
const DB_NAME = process.env.DB_NAME || 'busfahrt_app';

let db;
let dao;
let userDao;
let tourDao;

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

	// create user_tours table if missing
	const createSql = `CREATE TABLE IF NOT EXISTS user_tours (
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  PRIMARY KEY (user_id, tour_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(tour_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)`;

	await queryPromise(db, createSql);

	// clean users table for deterministic tests - disable FK checks while deleting
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=0');
	await queryPromise(db, 'DELETE FROM users');
	await queryPromise(db, 'DELETE FROM tours');
	await queryPromise(db, 'DELETE FROM user_tours');
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=1');

	// Insert some test data into user_tours, users and tours
	await queryPromise(db, 'INSERT INTO users (user_id, email, username, password_hash) VALUES (1, "user1@example.com", "User One", "hashed_password_1"), (2, "user2@example.com", "User Two", "hashed_password_2"), (3, "user3@example.com", "User Three", "hashed_password_3");');
	await queryPromise(db, 'INSERT INTO tours (tour_id, tour_description, tour_date, destination, bus_id) VALUES (1, "Tour One", "2023-01-01", "Destination One", 1), (2, "Tour Two", "2023-01-02", "Destination Two", 2), (3, "Tour Three", "2023-01-03", "Destination Three", 3);');
	await queryPromise(db, 'INSERT INTO user_tours (user_id, tour_id) VALUES (1, 3), (1, 2), (1, 1), (2, 2), (3, 1), (3, 3);');

	// Create a tour to use for booking
	const tour_description = 'Integration Test Tour for UserTourDao';
	const tour_date = new Date();
	const destination = 'Test City';
	const bus_id = 1;
	const picture_path = 'path/to/picture.jpg';

	tourDao = new TourDao(db);

	tourID = await new Promise((res, rej) => {
		tourDao.createTour(tour_description, tour_date, destination, bus_id, picture_path, (err, id) => (err ? rej(err) : res(id)));
	});


	// Create a user to use for booking
	const username = 'user_tour';
	const email = 'user_tour@example.com';
	const role = 'user';
	const password = 'Int3gration#Test';

	userDao = new UserDao(db);

	userID = await new Promise((res, rej) => {
		userDao.createUser(username, email, role, password, (err, id) => (err ? rej(err) : res(id)));
	});

	dao = new UserTourDao(db);
});

afterAll(async () => {
	if (db && db.end) await new Promise(res => db.end(res));
});

describe('UserTourDao integration with real DB.', () => {

	test('Function bookTour', async () => {
		const insertId = await dao.bookTour(userID, tourID);
		expect(typeof insertId).toBe('number');
		expect(insertId).toBeGreaterThan(0);
	}, 20000);

	test('Function getTourByUser', async () => {
		const tours = await dao.getToursByUser(userID);
		expect(tours).toBeDefined();
		expect(tours[0].tour_id).toBe(tourID);		
	}, 20000);

	test('Function getTourByUser Multi', async () => {
		const tours = await dao.getToursByUser(userID);
		expect(tours.length).toBeGreaterThan(0);
		expect(tours[0].tour.tour_id).toBe(tourID);
	}, 20000);

	test('Function getUsersByTour', async () => {
		const user = await dao.getUsersByTour(tourID);
		expect(user).toBeDefined();
		expect(user[0].user.user_id).toBe(userID);
	}, 20000);

    test('Function deleteBooking', async () => {
        const ok = await dao.cancelBooking(userID, tourID);
		expect(ok).toBe(true);
	});
});