const db = require('../db/connection');

exports.fetchAllBookingTypes = () => {
  return db.query('SELECT * FROM booking_types;').then((result) => result.rows);
};

exports.fetchBookingTypeById = (id) => {
  return db
    .query('SELECT * FROM booking_types WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking type not found' });
      return result.rows[0];
    });
};

exports.insertBookingType = ({ name, price }) => {
  return db
    .query(
      `INSERT INTO booking_types (name, price)
       VALUES ($1, $2)
       RETURNING *;`,
      [name, price]
    )
    .then((result) => result.rows[0]);
};

exports.updateBookingType = (id, { name, price }) => {
  return db
    .query(
      `UPDATE booking_types
       SET name = COALESCE($1, name),
           price = COALESCE($2, price)
       WHERE id = $3
       RETURNING *;`,
      [name, price, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking type not found' });
      return result.rows[0];
    });
};

exports.removeBookingType = (id) => {
  return db
    .query('DELETE FROM booking_types WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Booking type not found' });
      return result.rows[0];
    });
};