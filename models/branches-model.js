const db = require('../db/connection');

exports.fetchAllBranches = () => {
  return db.query('SELECT * FROM branches;').then((result) => result.rows);
};

exports.fetchBranchById = (id) => {
  return db
    .query('SELECT * FROM branches WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Branch not found' });
      return result.rows[0];
    });
};

exports.insertBranch = ({ garage_id, branch_name, address, phone, email }) => {
  return db
    .query(
      `INSERT INTO branches (garage_id, branch_name, address, phone, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [garage_id, branch_name, address, phone, email]
    )
    .then((result) => result.rows[0]);
};

exports.updateBranch = (id, { garage_id, branch_name, address, phone, email }) => {
  return db
    .query(
      `UPDATE branches
       SET garage_id = COALESCE($1, garage_id),
           branch_name = COALESCE($2, branch_name),
           address = COALESCE($3, address),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *;`,
      [garage_id, branch_name, address, phone, email, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Branch not found' });
      return result.rows[0];
    });
};

exports.removeBranch = (id) => {
  return db
    .query('DELETE FROM branches WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Branch not found' });
      return result.rows[0];
    });
};