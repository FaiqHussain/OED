/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const database = require('./database');

const sqlFile = database.sqlFile;

class User {
	/**
	 * @param id This users's ID. Should be undefined if the user is being newly created
	 * @param email This user's email
	 * @param passwordHash The user's passwordHash
	 */
	constructor(id, email, passwordHash) {
		this.id = id;
		this.email = email;
		this.passwordHash = passwordHash;
	}

	/**
	 * Returns a promise to create the users table
	 * @param conn is the connection to use.
	 * @returns {Promise.<>}
	 */
	static createTable(conn) {
		return conn.none(sqlFile('user/create_users_table.sql'));
	}

	/**
	 * Returns a promise to retrieve the user with the given id from the database.
	 * @param conn is the connection to use.
	 * @param id
	 * @returns {Promise.<User>}
	 */
	static async getByID(id, conn) {
		const row = await conn.one(sqlFile('user/get_user_by_id.sql'), { id: id });
		return new User(row.id, row.email);
	}

	/**
	 * Returns a promise to retrieve the user with the given email from the database.
	 * This exposes the user's password_hash and should only be used for authentication purposes.
	 * @param email the email to look up
	 * @param conn the connection to use.
	 * @returns {Promise.<User>}
	 */
	static async getByEmail(email, conn) {
		const row = await conn.one(sqlFile('user/get_user_by_email.sql'), { email: email });
		return new User(row.id, row.email, row.password_hash);
	}

	/**
	 * Returns a promise to get all of the user from the database
	 * @param conn is the connection to use.
	 * @returns {Promise.<array.<User>>}
	 */
	static async getAll(conn) {
		const rows = await conn.any(sqlFile('user/get_all_users.sql'));
		return rows.map(row => new User(row.id, row.email));
	}

	/**
	 * Returns a promise to update a user's password
	 * @param email the email of the user whose password is to be updated
	 * @param passwordHash the new password's hash
	 * @param conn is the connection to use.
	 * @returns {Promise.<array.<User>>}
	 */
	static async updateUserPassword(email, passwordHash, conn) {
		return conn.none(sqlFile('user/update_user_password.sql'), { email: email, password_hash: passwordHash });
	}

	/**
	 * Returns a promise to insert this user into the database
	 * @param conn is the connection to use.
	 * @returns {Promise.<>}
	 */
	async insert(conn) {
		const user = this;
		if (user.id !== undefined) {
			throw new Error('Attempted to insert a user that already has an ID');
		}
		return await conn.none(sqlFile('user/insert_new_user.sql'), user);
	}
}

module.exports = User;
