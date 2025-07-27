const db = require('../db/connection');

/**
 * Helpers
 */
function groupPresetRows(rows) {
  const map = new Map();
  rows.forEach(r => {
    if (!map.has(r.preset_id)) {
      map.set(r.preset_id, {
        id: r.preset_id,
        branch_id: r.branch_id,
        name: r.name,
        category: r.category,
        active: r.active,
        vin:         r.vin,
        mileage:     r.mileage,
        technician:  r.technician,
        booking_id:  r.booking_id,
        created_at: r.created_at,
        items: []
      });
    }
    if (r.item_id) {
      map.get(r.preset_id).items.push({
        id: r.item_id,
        preset_id: r.preset_id,
        type: r.type,
        description: r.description,
        quantity: r.quantity,
        price: r.price,
        vat_applies: r.vat_applies,
        quantity_default: r.quantity_default
      });
    }
  });
  return Array.from(map.values());
}

/**
 * PRESETS
 */
exports.fetchAllPresets = ({ branch_id, includeInactive = true } = {}) => {
  const params = [];
  let where = '';
  if (branch_id) {
    params.push(branch_id);
    where += `p.branch_id = $${params.length}`;
  }
  if (!includeInactive) {
    params.push(true);
    where += (where ? ' AND ' : '') + `p.active = $${params.length}`;
  }
  const whereSql = where ? `WHERE ${where}` : '';

  const sql = `
    SELECT
      p.id AS preset_id, p.branch_id, p.name, p.category, p.active, p.vin, p.mileage, p.technician, p.booking_id, p.created_at,
      i.id AS item_id, i.type, i.description, i.quantity, i.price, i.vat_applies, i.quantity_default
    FROM invoice_presets p
    LEFT JOIN invoice_preset_items i ON i.preset_id = p.id
    ${whereSql}
    ORDER BY p.id, i.id;
  `;
  return db.query(sql, params).then(res => groupPresetRows(res.rows));
};

/**
 * Fetch all presets belonging to a single branch.
 * @param {number} branch_id – the branch’s id
 * @param {Object} [opts]    – options (currently only includeInactive)
 * @param {boolean} [opts.includeInactive=true] – include inactive presets?
 * @returns {Promise<Array>} – array of grouped preset objects
 */
exports.fetchPresetsByBranch = (branch_id, { includeInactive = true } = {}) => {
  if (!branch_id) return Promise.reject({ status: 400, msg: 'branch_id is required' });
  return exports.fetchAllPresets({ branch_id, includeInactive });
};

exports.fetchPresetById = (id) => {
  const sql = `
    SELECT
      p.id AS preset_id, p.branch_id, p.name, p.category, p.active, p.vin, p.mileage, p.technician, p.booking_id, p.created_at,
      i.id AS item_id, i.type, i.description, i.quantity, i.price, i.vat_applies, i.quantity_default
    FROM invoice_presets p
    LEFT JOIN invoice_preset_items i ON i.preset_id = p.id
    WHERE p.id = $1
    ORDER BY i.id;
  `;
  return db.query(sql, [id]).then(res => {
    if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Preset not found' });
    return groupPresetRows(res.rows)[0];
  });
};

/**
 * Fetch a single Job‑Sheet by its booking_id.
 * There should be at most one job‑sheet per booking.
 * Returns the grouped preset object or a 404.
 * @param {number} booking_id
 */
exports.fetchJobSheetByBookingId = (booking_id) => {
  const sql = `
    SELECT
      p.id AS preset_id, p.branch_id, p.name, p.category, p.active,
      p.vin, p.mileage, p.technician, p.booking_id, p.created_at,
      i.id AS item_id, i.type, i.description, i.quantity, i.price,
      i.vat_applies, i.quantity_default
    FROM invoice_presets p
    LEFT JOIN invoice_preset_items i ON i.preset_id = p.id
    WHERE p.booking_id = $1
    ORDER BY i.id;
  `;
  return db.query(sql, [booking_id]).then(res => {
    if (!res.rows.length) {
      return Promise.reject({ status: 404, msg: 'Job sheet not found' });
    }
    return groupPresetRows(res.rows)[0];
  });
};

exports.insertPreset = async ({ branch_id, name, category = null, active = true,
                                vin = null, mileage = null, technician = null,
                                booking_id = null, items = [] }) => {
  await db.query('BEGIN');
  try {
    const presetRes = await db.query(
      `INSERT INTO invoice_presets (branch_id, name, category, active, vin, mileage, technician, booking_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [branch_id, name, category, active, vin, mileage, technician, booking_id]
    );
    const preset = presetRes.rows[0];

    const insertedItems = [];
    for (const it of items) {
      const itemRes = await db.query(
        `INSERT INTO invoice_preset_items
           (preset_id, type, description, quantity, price, vat_applies, quantity_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *;`,
        [
          preset.id,
          it.type || null,
          it.description || '',
          it.quantity ?? null,
          it.price ?? 0,
          it.vat_applies ?? true,
          it.quantity_default ?? 1
        ]
      );
      insertedItems.push(itemRes.rows[0]);
    }

    await db.query('COMMIT');
    return { ...preset, items: insertedItems };
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
};

exports.updatePreset = (id, { branch_id, name, category, active, vin, mileage, technician, booking_id }) => {
  return db
    .query(
      `UPDATE invoice_presets
       SET branch_id = COALESCE($1, branch_id),
           name      = COALESCE($2, name),
           category  = COALESCE($3, category),
           active    = COALESCE($4, active),
           vin         = COALESCE($5, vin),
           mileage     = COALESCE($6, mileage),
           technician  = COALESCE($7, technician),
           booking_id  = COALESCE($8, booking_id),
           created_at = created_at
       WHERE id = $9
       RETURNING *;`,
      [branch_id, name, category, active, vin, mileage, technician, booking_id, id]
    )
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Preset not found' });
      return res.rows[0];
    });
};

exports.removePreset = (id) => {
  return db
    .query('DELETE FROM invoice_presets WHERE id = $1 RETURNING *;', [id])
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Preset not found' });
      return res.rows[0];
    });
};

/**
 * ITEMS
 */
exports.insertPresetItem = ({ preset_id, type = null, description = '', quantity = null, price = 0, vat_applies = true, quantity_default = 1 }) => {
  return db
    .query(
      `INSERT INTO invoice_preset_items
         (preset_id, type, description, quantity, price, vat_applies, quantity_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [preset_id, type, description, quantity, price, vat_applies, quantity_default]
    )
    .then(res => res.rows[0])
    .catch(err => {
      // FK violation => preset doesn't exist -> surface as 404 instead of 500
      if (err.code === '23503' && /preset_id.*fkey/i.test(err.constraint || '')) {
        return Promise.reject({ status: 404, msg: 'Preset not found' });
      }
      throw err;
    });
};

exports.updatePresetItem = (itemId, { type, description, quantity, price, vat_applies, quantity_default }) => {
  return db
    .query(
      `UPDATE invoice_preset_items
       SET type             = COALESCE($1, type),
           description      = COALESCE($2, description),
           quantity         = COALESCE($3, quantity),
           price            = COALESCE($4, price),
           vat_applies      = COALESCE($5, vat_applies),
           quantity_default = COALESCE($6, quantity_default)
       WHERE id = $7
       RETURNING *;`,
      [type, description, quantity, price, vat_applies, quantity_default, itemId]
    )
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Preset item not found' });
      return res.rows[0];
    });
};

exports.removePresetItem = (itemId) => {
  return db
    .query('DELETE FROM invoice_preset_items WHERE id = $1 RETURNING *;', [itemId])
    .then(res => {
      if (!res.rows.length) return Promise.reject({ status: 404, msg: 'Preset item not found' });
      return res.rows[0];
    });
};