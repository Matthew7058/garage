const db = require('../db/connection');

exports.fetchAllOverrides = () => {
  return db
    .query('SELECT * FROM operating_hours_override;')
    .then((res) => res.rows);
};

exports.fetchOverrideById = (id) => {
  return db
    .query('SELECT * FROM operating_hours_override WHERE id = $1;', [id])
    .then((res) => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Override not found' });
      return res.rows[0];
    });
};

exports.insertOverride = ({
  branch_id,
  date,
  is_closed = false,
  open_time = null,
  close_time = null,
  capacity_per_hour = null,
  daily_capacity = null,
  reason = null,
}) => {
  return db
    .query(
      `INSERT INTO operating_hours_override
         (branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason]
    )
    .then((res) => res.rows[0]);
};

exports.updateOverride = (
  id,
  { branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason }
) => {
  return db
    .query(
      `UPDATE operating_hours_override
       SET branch_id     = COALESCE($1, branch_id),
           date          = COALESCE($2, date),
           is_closed     = COALESCE($3, is_closed),
           open_time     = COALESCE($4, open_time),
           close_time    = COALESCE($5, close_time),
           capacity_per_hour = COALESCE($6, capacity_per_hour),
           daily_capacity= COALESCE($7, daily_capacity),
           reason        = COALESCE($8, reason),
           updated_at    = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *;`,
      [branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason, id]
    )
    .then((res) => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Override not found' });
      return res.rows[0];
    });
};

exports.removeOverride = (id) => {
  return db
    .query('DELETE FROM operating_hours_override WHERE id = $1 RETURNING *;', [id])
    .then((res) => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Override not found' });
      return res.rows[0];
    });
};

exports.fetchOverridesByBranchDate = (branch_id, date) => {
  return db
    .query(
      'SELECT * FROM operating_hours_override WHERE branch_id = $1 AND date = $2;',
      [branch_id, date]
    )
    .then((res) => res.rows);
};