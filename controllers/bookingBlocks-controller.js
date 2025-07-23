// controllers/bookingBlocks-controller.js
const {
  fetchAllBlocks,
  fetchBlockById,
  insertBlock,
  updateBlock,
  removeBlock,
  fetchBlocksByBranchDate,
  fetchBlocksByBranchRange
} = require('../models/bookingBlocks-model');

// Format date to YYYY-MM-DD and time to HH:MM for FE consistency
function fmtRow(r) {
  const d = new Date(r.date);
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');

  const toHHMM = (t) => (t ? t.toString().slice(0, 5) : null);
  const toNum  = (v) => (v === null || v === undefined ? null : Number(v));

  return {
    ...r,
    date: `${year}-${month}-${day}`,
    start_time: toHHMM(r.start_time),
    end_time:   toHHMM(r.end_time),
    capacity_per_hour: toNum(r.capacity_per_hour)
  };
}

exports.getAllBlocks = (req, res, next) => {
  fetchAllBlocks()
    .then(rows => res.status(200).send({ blocks: rows.map(fmtRow) }))
    .catch(next);
};

exports.getBlockById = (req, res, next) => {
  fetchBlockById(req.params.id)
    .then(row => res.status(200).send({ block: fmtRow(row) }))
    .catch(next);
};

exports.postBlock = (req, res, next) => {
  insertBlock(req.body)
    .then(newRow => res.status(201).send({ block: fmtRow(newRow) }))
    .catch(next);
};

exports.patchBlock = (req, res, next) => {
  updateBlock(req.params.id, req.body)
    .then(updatedRow => res.status(200).send({ block: fmtRow(updatedRow) }))
    .catch(next);
};

exports.deleteBlock = (req, res, next) => {
  removeBlock(req.params.id)
    .then(deletedRow => res.status(200).send({ block: fmtRow(deletedRow) }))
    .catch(next);
};

exports.getBlocksByBranchAndDate = (req, res, next) => {
  const { branch_id, date } = req.params;
  fetchBlocksByBranchDate(branch_id, date)
    .then(rows => res.status(200).send({ blocks: rows.map(fmtRow) }))
    .catch(next);
};