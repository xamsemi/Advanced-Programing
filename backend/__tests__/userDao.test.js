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

let user_id

describe('UserDao integration with real DB.', () => {

    const username = 'integration_user_' + Date.now();
    const email = 'integration@example.test';
    const role = 'user';
    const password = 'Int3gration#Test';

	test('Function createUser', async () => {
		const dao = new UserDao(db);        
		const insertId = await new Promise((res, rej) => {
			dao.createUser(username, email, role, password, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(typeof insertId).toBe('number');
		user_id = insertId;
		expect(insertId).toBeGreaterThan(0);
	}, 20000);

	test('Function getUserByUserName', async () => {
		const dao = new UserDao(db);
		const user = await new Promise((res, rej) => {
			dao.getUserByUserName(username, (err, u) => (err ? rej(err) : res(u)));
		});
		expect(user).toBeDefined();
		expect(user.username).toBe(username);
	}, 20000);

	test('Function comparePassword', async () => {
		const dao = new UserDao(db);
		const user = await new Promise((res, rej) => {
			dao.getUserByUserName(username, (err, u) => (err ? rej(err) : res(u)));
		});
		expect(user).toBeDefined();
        //Verify Password
		const ok = await new Promise((res, rej) => {
			dao.comparePassword(password, user.password_hash, (err, matched) => (err ? rej(err) : res(matched)));
		});
		expect(ok).toBe(true);

	}, 20000);

    test('Function deleteUser', async () => {
        const dao = new UserDao(db);
        const ok = await new Promise((res, rej) => {
			dao.deleteUserByID(user_id, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(ok).toBe(true);
	});

});

describe('Change User Data', () => {

	const username = 'change_user_' + Date.now();
	const email = 'change@example.test';
	const role = 'user';
	const password = 'Change#Test1';

	test('Create User for Change Tests', async () => {
		const dao = new UserDao(db);
		const insertId = await new Promise((res, rej) => {
			dao.createUser(username, email, role, password, (err, id) => (err ? rej(err) : res(id)));
		});
		expect(typeof insertId).toBe('number');
		user_id = insertId;
		expect(insertId).toBeGreaterThan(0);
	}, 20000);

	test('Update Email', async () => {
		const dao = new UserDao(db);
		const newEmail = 'change_new@example.test';
		const ok = await new Promise((res, rej) => {
			dao.updateUser(user_id, { email: newEmail }, (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(true);
	}, 20000);

	test('Update Password', async () => {
		const dao = new UserDao(db);
		const newPassword = 'Newpass#123';
		const ok = await new Promise((res, rej) => {
			dao.updateUser(user_id, { password_hash: newPassword }, (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(true);
	}, 20000);

	test('Update Role', async () => {
		const dao = new UserDao(db);
		const newRole = 'admin';
		const ok = await new Promise((res, rej) => {
			dao.updateUser(user_id, { user_role: newRole }, (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(true);
	}, 20000);

	test('Update UserName', async () => {
		const dao = new UserDao(db);
		const newUsername = 'changed_user_' + Date.now();
		const ok = await new Promise((res, rej) => {
			dao.updateUser(user_id, { username: newUsername }, (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(true);
	}, 20000);
});

describe('UserDao edge cases', () => {

	const username = 'edgecase_user_' + Date.now();
	const email = 'edgecase@example.test';
	const role = 'noadmin';
	const password = 'Edgecase#Test1';

	test('Wrong Userrole provided, user creation should fail', async () => {
		const dao = new UserDao(db);
		// call createUser and expect the operation to reject due to invalid ENUM value
		const promise = new Promise((res, rej) => {
			dao.createUser(username, email, role, password, (err, id) => (err ? rej(err) : res(id)));
		});

		// Promise should be rejected
		await expect(promise).rejects.toThrow();
	}, 20000);

	test('Get non-existing user by username should return null', async () => {
		const dao = new UserDao(db);
		const promise = new Promise((res, rej) => {
			dao.getUserByUserName('non_existing_user', (err, u) => (err ? rej(err) : res(u)));
		});

		// Expect the DAO to reject for a non-existing user lookup in this test
		await expect(promise).rejects.toThrow();
	}, 20000);

	test('Compare password with invalid hash should return false', async () => {
		//expect false when hash is invalid with error message logged
		const dao = new UserDao(db);
		const promise = new Promise((res, rej) => {
			dao.comparePassword('somepassword', 'invalid_hash', (err, matched) => (err ? rej(err) : res(matched)));
		});
		await expect(promise).rejects.toThrow();
	}, 20000);

	test('Change password for non-existing user should return false', async () => {
		const dao = new UserDao(db);
		const ok = await new Promise((res, rej) => {
			dao.updateUser('999999999', { password_hash: 'Newpass#123' }, (err, success) => (err ? rej(err) : res(success)));
		});
		console.log('Test result for changing password of non-existing user:', ok);
		expect(ok).toBe(false);
	}, 20000);

	test('Delete non-existing user should return false', async () => {
		const dao = new UserDao(db);
		const ok = await new Promise((res, rej) => {
			dao.deleteUserByID('999999999', (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(false);
	}, 20000);

	test('Change email for non-existing user should return false', async () => {
		const dao = new UserDao(db);
		const ok = await new Promise((res, rej) => {
			dao.updateUser('999999999', { email: 'new_email@example.com' }, (err, success) => (err ? rej(err) : res(success)));
		});
		expect(ok).toBe(false);
	}, 20000);
});
