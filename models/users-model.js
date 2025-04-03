const db = require('../db/connection');

exports.fetchAllUsers = () => {
  return db.query('SELECT * FROM users;').then((result) => result.rows);
};

exports.fetchUserById = (id) => {
  return db
    .query('SELECT * FROM users WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'User not found' });
      return result.rows[0];
    });
};

exports.insertUser = ({ garage_id, first_name, last_name, email, phone, password_hash, role }) => {
  return db
    .query(
      `INSERT INTO users (garage_id, first_name, last_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [garage_id, first_name, last_name, email, phone, password_hash, role]
    )
    .then((result) => result.rows[0]);
};

exports.updateUser = (id, { garage_id, first_name, last_name, email, phone, password_hash, role }) => {
  return db
    .query(
      `UPDATE users
       SET garage_id = COALESCE($1, garage_id),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           password_hash = COALESCE($6, password_hash),
           role = COALESCE($7, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *;`,
      [garage_id, first_name, last_name, email, phone, password_hash, role, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'User not found' });
      return result.rows[0];
    });
};

exports.removeUser = (id) => {
  return db
    .query('DELETE FROM users WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'User not found' });
      return result.rows[0];
    });
};