const db = require('../db/connection');

exports.fetchAllBookings = () => {
  return db.query('SELECT * FROM bookings;').then((result) => result.rows);
};

exports.fetchBookingById = (id) => {
  return db
    .query('SELECT * FROM bookings WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking not found' });
      return result.rows[0];
    });
};

exports.insertBooking = ({ branch_id, user_id, booking_date, booking_time, booking_type_id, status }) => {
  return db
    .query(
      `INSERT INTO bookings (branch_id, user_id, booking_date, booking_time, booking_type_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [branch_id, user_id, booking_date, booking_time, booking_type_id, status]
    )
    .then((result) => result.rows[0]);
};

exports.updateBooking = (id, { branch_id, user_id, booking_date, booking_time, booking_type_id, status }) => {
  return db
    .query(
      `UPDATE bookings
       SET branch_id = COALESCE($1, branch_id),
           user_id = COALESCE($2, user_id),
           booking_date = COALESCE($3, booking_date),
           booking_time = COALESCE($4, booking_time),
           booking_type_id = COALESCE($5, booking_type_id),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *;`,
      [branch_id, user_id, booking_date, booking_time, booking_type_id, status, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking not found' });
      return result.rows[0];
    });
};

exports.removeBooking = (id) => {
  return db
    .query('DELETE FROM bookings WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking not found' });
      return result.rows[0];
    });
};