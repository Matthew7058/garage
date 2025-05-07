const {
    fetchAllOperatingHours,
    fetchOperatingHourById,
    insertOperatingHour,
    updateOperatingHour,
    removeOperatingHour,
    fetchOperatingHoursByBranchId,
  } = require('../models/operatingHours-model');
  
  exports.getOperatingHours = (req, res, next) => {
    fetchAllOperatingHours()
      .then((hours) => res.status(200).send({ operating_hours: hours }))
      .catch(next);
  };
  
  exports.getOperatingHourById = (req, res, next) => {
    const { id } = req.params;
    fetchOperatingHourById(id)
      .then((hour) => res.status(200).send({ operating_hour: hour }))
      .catch(next);
  };
  
  exports.postOperatingHour = (req, res, next) => {
    const { branch_id, day_of_week, open_time, close_time, capacity_per_hour } = req.body;
    insertOperatingHour({ branch_id, day_of_week, open_time, close_time, capacity_per_hour })
      .then((newHour) => res.status(201).send({ operating_hour: newHour }))
      .catch(next);
  };
  
  exports.patchOperatingHour = (req, res, next) => {
    const { id } = req.params;
    const { branch_id, day_of_week, open_time, close_time, capacity_per_hour } = req.body;
    updateOperatingHour(id, { branch_id, day_of_week, open_time, close_time, capacity_per_hour })
      .then((updatedHour) => res.status(200).send({ operating_hour: updatedHour }))
      .catch(next);
  };
  
  exports.deleteOperatingHour = (req, res, next) => {
    const { id } = req.params;
    removeOperatingHour(id)
      .then((deletedHour) => res.status(200).send({ operating_hour: deletedHour }))
      .catch(next);
  };

  exports.getOperatingHoursByBranch = (req, res, next) => {
    const { branch_id } = req.params;
    fetchOperatingHoursByBranchId(branch_id)
      .then((operating_hours) => res.status(200).send({ operating_hours }))
      .catch(next);
  };