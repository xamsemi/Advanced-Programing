const mysql = require('mysql2');
const UserDao = require('../dao/userDao');

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
	const createSql = `CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  user_role ENUM('admin', 'user') DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;


	await queryPromise(db, createSql);

	// clean users table for deterministic tests - disable FK checks while deleting
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=0');
	await queryPromise(db, 'DELETE FROM users');
	await queryPromise(db, 'SET FOREIGN_KEY_CHECKS=1');
});

afterAll(async () => {
	if (db && db.end) await new Promise(res => db.end(res));
});

describe('UserDao integration with real DB', () => {

    const username = 'integration_user_' + Date.now();
    const email = 'integration@example.test';
    const role = 'user';
    const password = 'Int3gration#Test';

	test('createUser -> getUserByUsername -> comparePassword', async () => {
		const dao = new UserDao(db);        
        //Create
		const insertId = await new Promise((res, rej) => {
			dao.createUser(username, email, role, password, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(insertId).toBeGreaterThan(0);

        //Read
		const user = await new Promise((res, rej) => {
			dao.getUserByUsername(username, (err, u) => (err ? rej(err) : res(u)));
		});
		expect(user).toBeDefined();
		expect(user.username).toBe(username);
		expect(user.password_hash).toBeTruthy();
        //Verify Password
		const ok = await new Promise((res, rej) => {
			dao.comparePassword(password, user.password_hash, (err, matched) => (err ? rej(err) : res(matched)));
		});
		expect(ok).toBe(true);

	}, 20000);

    test('delete User from Database', async () => {
        const dao = new UserDao(db);

        const ok = await new Promise((res, rej) => {
			dao.deleteUser(username, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

});
