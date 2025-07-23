// models/bookingBlocks-model.js
const db = require('../db/connection');

/**
 * Shape:
 *  id SERIAL PK
 *  branch_id INT FK
 *  date DATE (yyyy-mm-dd)
 *  start_time TIME WITHOUT TIME ZONE
 *  end_time   TIME WITHOUT TIME ZONE
 *  capacity_per_hour INT NULL  // 0 = block completely, >0 = override capacity for that span
 *  reason TEXT (optional)
 *  created_at, updated_at
 */

exports.fetchAllBlocks = () => {
  return db.query('SELECT * FROM booking_blocks;').then(res => res.rows);
};

exports.fetchBlockById = (id) => {
  return db
    .query('SELECT * FROM booking_blocks WHERE id = $1;', [id])
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Block not found' });
      return res.rows[0];
    });
};

exports.insertBlock = ({ branch_id, date, start_time, end_time, capacity_per_hour = null, reason = null }) => {
  return db
    .query(
      `INSERT INTO booking_blocks
         (branch_id, date, start_time, end_time, capacity_per_hour, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [branch_id, date, start_time, end_time, capacity_per_hour, reason]
    )
    .then(res => res.rows[0]);
};

exports.updateBlock = (
  id,
  { branch_id, date, start_time, end_time, capacity_per_hour, reason }
) => {
  return db
    .query(
      `UPDATE booking_blocks
       SET branch_id        = COALESCE($1, branch_id),
           date             = COALESCE($2, date),
           start_time       = COALESCE($3, start_time),
           end_time         = COALESCE($4, end_time),
           capacity_per_hour= COALESCE($5, capacity_per_hour),
           reason           = COALESCE($6, reason),
           updated_at       = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *;`,
      [branch_id, date, start_time, end_time, capacity_per_hour, reason, id]
    )
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Block not found' });
      return res.rows[0];
    });
};

exports.removeBlock = (id) => {
  return db
    .query('DELETE FROM booking_blocks WHERE id = $1 RETURNING *;', [id])
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Block not found' });
      return res.rows[0];
    });
};

/** All blocks for a single branch + date */
exports.fetchBlocksByBranchDate = (branch_id, date) => {
  return db
    .query(
      'SELECT * FROM booking_blocks WHERE branch_id = $1 AND date = $2;',
      [branch_id, date]
    )
    .then(res => res.rows);
};

/** Optional helper: get blocks in a date range (useful for month view) */
exports.fetchBlocksByBranchRange = (branch_id, start_date, end_date) => {
  return db
    .query(
      `SELECT * FROM booking_blocks
       WHERE branch_id = $1 AND date BETWEEN $2 AND $3;`,
      [branch_id, start_date, end_date]
    )
    .then(res => res.rows);
};