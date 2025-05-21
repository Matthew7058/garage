const {
    fetchAllBookings,
    fetchBookingById,
    insertBooking,
    updateBooking,
    removeBooking,
    fetchBookingsByBranchId,
    fetchBookingsByBranchAndDate
  } = require('../models/bookings-model');

  function formatLocalDate(dateObj) {
    const year  = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day   = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
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
    const { branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status } = req.body;
    insertBooking({ branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status })
      .then((newBooking) => res.status(201).send({ booking: newBooking }))
      .catch(next);
  };
  
  exports.patchBooking = (req, res, next) => {
    const { id } = req.params;
    const { branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status } = req.body;
    updateBooking(id, { branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status })
      .then((updatedBooking) => res.status(200).send({ booking: updatedBooking }))
      .catch(next);
  };
  
  exports.deleteBooking = (req, res, next) => {
    const { id } = req.params;
    removeBooking(id)
      .then((deletedBooking) => res.status(200).send({ booking: deletedBooking }))
      .catch(next);
  };

  exports.getBookingsByBranch = (req, res, next) => {
    const { branch_id } = req.params;
    fetchBookingsByBranchId(branch_id)
      .then((bookings) => res.status(200).send({ bookings }))
      .catch(next);
  };
  
  exports.getBookingsByBranchAndDate = (req, res, next) => {
    const { branch_id, date } = req.params;
    fetchBookingsByBranchAndDate(branch_id, date)
    .then((bookings) => {
      const formatted = bookings.map((b) => ({
        ...b,
        booking_date: formatLocalDate(b.booking_date),
      }));
      res.status(200).send({ bookings: formatted });
    })
    .catch(next);
  };