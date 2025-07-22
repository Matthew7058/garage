const db = require('../db/connection');

exports.fetchAllOperatingHours = () => {
  return db.query('SELECT * FROM operating_hours;').then((result) => result.rows);
};

exports.fetchOperatingHourById = (id) => {
  return db
    .query('SELECT * FROM operating_hours WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Operating hour not found' });
      return result.rows[0];
    });
};

exports.insertOperatingHour = ({ branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity }) => {
  return db
    .query(
      `INSERT INTO operating_hours (branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity]
    )
    .then((result) => result.rows[0]);
};

exports.updateOperatingHour = (id, { branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity }) => {
  return db
    .query(
      `UPDATE operating_hours
       SET branch_id = COALESCE($1, branch_id),
           day_of_week = COALESCE($2, day_of_week),
           open_time = COALESCE($3, open_time),
           close_time = COALESCE($4, close_time),
           capacity_per_hour = COALESCE($5, capacity_per_hour),
           daily_capacity   = COALESCE($6, daily_capacity),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *;`,
      [branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Operating hour not found' });
      return result.rows[0];
    });
};

exports.removeOperatingHour = (id) => {
  return db
    .query('DELETE FROM operating_hours WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Operating hour not found' });
      return result.rows[0];
    });
};

exports.fetchOperatingHoursByBranchId = (branch_id) => {
  return db
    .query('SELECT * FROM operating_hours WHERE branch_id = $1;', [branch_id])
    .then((result) => result.rows);
};