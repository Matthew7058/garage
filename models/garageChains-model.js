const db = require('../db/connection');

exports.fetchAllGarageChains = () => {
  return db.query('SELECT * FROM garage_chains;').then((result) => result.rows);
};

exports.fetchGarageChainById = (id) => {
  return db
    .query('SELECT * FROM garage_chains WHERE id = $1;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Garage chain not found' });
      return result.rows[0];
    });
};

exports.insertGarageChain = ({ name, contact }) => {
  return db
    .query(
      `INSERT INTO garage_chains (name, contact)
       VALUES ($1, $2)
       RETURNING *;`,
      [name, contact]
    )
    .then((result) => result.rows[0]);
};

exports.updateGarageChain = (id, { name, contact }) => {
  return db
    .query(
      `UPDATE garage_chains
       SET name = COALESCE($1, name),
           contact = COALESCE($2, contact),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *;`,
      [name, contact, id]
    )
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Garage chain not found' });
      return result.rows[0];
    });
};

exports.removeGarageChain = (id) => {
  return db
    .query('DELETE FROM garage_chains WHERE id = $1 RETURNING *;', [id])
    .then((result) => {
      if (result.rows.length === 0)
        return Promise.reject({ status: 404, msg: 'Garage chain not found' });
      return result.rows[0];
    });
};