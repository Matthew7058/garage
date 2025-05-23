const {
    fetchAllBookingTypes,
    fetchBookingTypeById,
    insertBookingType,
    updateBookingType,
    removeBookingType,
    fetchBookingTypesByBranchId,
  } = require('../models/bookingTypes-model');
  
  exports.getBookingTypes = (req, res, next) => {
    fetchAllBookingTypes()
      .then((types) => res.status(200).send({ booking_types: types }))
      .catch(next);
  };
  
  exports.getBookingTypeById = (req, res, next) => {
    const { id } = req.params;
    fetchBookingTypeById(id)
      .then((type) => res.status(200).send({ booking_type: type }))
      .catch(next);
  };
  
  exports.postBookingType = (req, res, next) => {
    const { name, price, length } = req.body;
    insertBookingType({ name, price, length })
      .then((newType) => res.status(201).send({ booking_type: newType }))
      .catch(next);
  };
  
  exports.patchBookingType = (req, res, next) => {
    const { id } = req.params;
    const { name, price, length } = req.body;
    updateBookingType(id, { name, price, length })
      .then((updatedType) => res.status(200).send({ booking_type: updatedType }))
      .catch(next);
  };
  
  exports.deleteBookingType = (req, res, next) => {
    const { id } = req.params;
    removeBookingType(id)
      .then((deletedType) => res.status(200).send({ booking_type: deletedType }))
      .catch(next);
  };

  exports.getBookingTypesByBranch = (req, res, next) => {
    const { branch_id } = req.params;
    fetchBookingTypesByBranchId(branch_id)
      .then((booking_types) => res.status(200).send({ booking_types }))
      .catch(next);
  };