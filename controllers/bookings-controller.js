const {
    fetchAllBookings,
    fetchBookingById,
    insertBooking,
    updateBooking,
    removeBooking,
  } = require('../models/bookings-model');
  
  exports.getBookings = (req, res, next) => {
    fetchAllBookings()
      .then((bookings) => res.status(200).send({ bookings }))
      .catch(next);
  };
  
  exports.getBookingById = (req, res, next) => {
    const { id } = req.params;
    fetchBookingById(id)
      .then((booking) => res.status(200).send({ booking }))
      .catch(next);
  };
  
  exports.postBooking = (req, res, next) => {
    const { branch_id, user_id, booking_date, booking_time, booking_type_id, status } = req.body;
    insertBooking({ branch_id, user_id, booking_date, booking_time, booking_type_id, status })
      .then((newBooking) => res.status(201).send({ booking: newBooking }))
      .catch(next);
  };
  
  exports.patchBooking = (req, res, next) => {
    const { id } = req.params;
    const { branch_id, user_id, booking_date, booking_time, booking_type_id, status } = req.body;
    updateBooking(id, { branch_id, user_id, booking_date, booking_time, booking_type_id, status })
      .then((updatedBooking) => res.status(200).send({ booking: updatedBooking }))
      .catch(next);
  };
  
  exports.deleteBooking = (req, res, next) => {
    const { id } = req.params;
    removeBooking(id)
      .then((deletedBooking) => res.status(200).send({ booking: deletedBooking }))
      .catch(next);
  };