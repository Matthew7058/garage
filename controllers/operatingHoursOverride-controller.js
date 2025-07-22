const {
  fetchAllOverrides,
  fetchOverrideById,
  insertOverride,
  updateOverride,
  removeOverride,
  fetchOverridesByBranchDate,
} = require('../models/operatingHoursOverride-model');

// helper to format a single row’s date as local YYYY-MM-DD
function fmtRow(r) {
  const d = r.date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return { ...r, date: `${year}-${month}-${day}` };
}

exports.getAllOverrides = (req, res, next) => {
  fetchAllOverrides()
    .then((rows) => {
      const formatted = rows.map(fmtRow);
      res.status(200).send({ overrides: formatted });
    })
    .catch(next);
};

exports.getOverrideById = (req, res, next) => {
  fetchOverrideById(req.params.id)
    .then((row) => {
      const formatted = fmtRow(row);
      res.status(200).send({ override: formatted });
    })
    .catch(next);
};

exports.postOverride = (req, res, next) => {
  insertOverride(req.body)
    .then((newRow) => {
      const formatted = fmtRow(newRow);
      res.status(201).send({ override: formatted });
    })
    .catch(next);
};

exports.patchOverride = (req, res, next) => {
  updateOverride(req.params.id, req.body)
    .then((updatedRow) => {
      const formatted = fmtRow(updatedRow);
      res.status(200).send({ override: formatted });
    })
    .catch(next);
};

exports.deleteOverride = (req, res, next) => {
  removeOverride(req.params.id)
    .then((deletedRow) => {
      const formatted = fmtRow(deletedRow);
      res.status(200).send({ override: formatted });
    })
    .catch(next);
};

exports.getOverridesByBranchDate = (req, res, next) => {
  const { branch_id, date } = req.params;
  fetchOverridesByBranchDate(branch_id, date)
    .then((rows) => {
      const formatted = rows.map(fmtRow);
      res.status(200).send({ overrides: formatted });
    })
    .catch(next);
};