const format = require('pg-format');
const db = require('../connection');

const seed = ({ chainsData, usersData, bookingsData, bookingTypesData, hoursData, overridesData, branchesData, blocksData, presetsData, presetItemsData }) => {
    // Drop tables in dependency order (children first)
    return db.query('DROP TABLE IF EXISTS invoice_preset_items;')
      .then(() => db.query('DROP TABLE IF EXISTS invoice_presets;'))
      .then(() => db.query('DROP TABLE IF EXISTS bookings;'))
      .then(() => db.query('DROP TABLE IF EXISTS booking_blocks;'))
      .then(() => db.query('DROP TABLE IF EXISTS booking_types;'))
      .then(() => db.query('DROP TABLE IF EXISTS operating_hours_override;'))
      .then(() => db.query('DROP TABLE IF EXISTS operating_hours;'))
      .then(() => db.query('DROP TABLE IF EXISTS users;'))
      .then(() => db.query('DROP TABLE IF EXISTS branches;'))
      .then(() => db.query('DROP TABLE IF EXISTS garage_chains;'))
      // Create tables sequentially
      .then(() => {
        return db.query(`
          CREATE TABLE garage_chains (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            contact VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE branches (
            id SERIAL PRIMARY KEY,
            garage_id INTEGER REFERENCES garage_chains(id) ON DELETE CASCADE,
            branch_name VARCHAR(255) NOT NULL,
            address VARCHAR(255),
            phone VARCHAR(50),
            email VARCHAR(255),
            lat Decimal(9,7),
            lng Decimal(10,7),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            garage_id INTEGER REFERENCES garage_chains(id) ON DELETE CASCADE,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            password_hash VARCHAR(255),
            address VARCHAR(255),
            postcode VARCHAR(20),
            role VARCHAR(50), 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE operating_hours (
            id SERIAL PRIMARY KEY,
            branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            day_of_week INTEGER,
            open_time TIME,
            close_time TIME,
            capacity_per_hour INTEGER,
            daily_capacity INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE operating_hours_override (
            id SERIAL PRIMARY KEY,
            branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            date DATE       NOT NULL,
            is_closed BOOLEAN DEFAULT FALSE,
            open_time TIME,
            close_time TIME,
            capacity_per_hour INTEGER,
            daily_capacity INTEGER,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (branch_id, date)
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE booking_blocks (
            id SERIAL PRIMARY KEY,
            branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            capacity_per_hour INTEGER,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE booking_types (
            id SERIAL PRIMARY KEY,
            branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            name VARCHAR(50) NOT NULL,
            price NUMERIC(10, 2),
            length INTEGER
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE bookings (
            id SERIAL PRIMARY KEY,
            branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            booking_date DATE,
            booking_time TIME,
            booking_type_id INTEGER REFERENCES booking_types(id) ON DELETE CASCADE,
            status VARCHAR(50),
            vehicle VARCHAR(20),
            comments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE invoice_presets (
            id SERIAL PRIMARY KEY,
            branch_id   INTEGER REFERENCES branches(id) ON DELETE CASCADE,
            booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
            name        TEXT NOT NULL,
            category    TEXT,
            vin         TEXT,
            mileage     INTEGER,
            technician  TEXT,
            comments    TEXT,
            active      BOOLEAN DEFAULT TRUE,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      })
      .then(() => {
        return db.query(`
          CREATE TABLE invoice_preset_items (
            id SERIAL PRIMARY KEY,
            preset_id        INTEGER REFERENCES invoice_presets(id) ON DELETE CASCADE,
            type             TEXT,
            description      TEXT,
            quantity         NUMERIC(6,2),
            price            NUMERIC(10,2) NOT NULL DEFAULT 0,
            vat_applies      BOOLEAN DEFAULT TRUE,
            quantity_default NUMERIC(6,2) NOT NULL DEFAULT 1
          );
        `);
      })
      // Insert data into garage_chains
      .then(() => {
        const insertGarageChainsQuery = format(
          `INSERT INTO garage_chains (name, contact) VALUES %L RETURNING *;`,
          chainsData.map(({ name, contact }) => [name, contact])
        );
        return db.query(insertGarageChainsQuery);
      })
      // Insert data into branches
      .then(() => {
        const insertBranchesQuery = format(
          `INSERT INTO branches (garage_id, branch_name, address, phone, email, lat, lng) VALUES %L RETURNING *;`,
          branchesData.map(({ garage_id, branch_name, address, phone, email, lat, lng }) =>
            [garage_id, branch_name, address, phone, email, lat, lng]
          )
        );
        return db.query(insertBranchesQuery);
      })
      // Insert data into users
      .then(() => {
        const insertUsersQuery = format(
          `INSERT INTO users (garage_id, first_name, last_name, email, phone, password_hash, address, postcode, role) VALUES %L RETURNING *;`,
          usersData.map(({ garage_id, first_name, last_name, email, phone, password_hash, address, postcode, role }) =>
            [garage_id, first_name, last_name, email, phone, password_hash, address, postcode, role]
          )
        );
        return db.query(insertUsersQuery);
      })
      // Insert data into operating_hours
      .then(() => {
        const insertOperatingHoursQuery = format(
          `INSERT INTO operating_hours (branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity) VALUES %L RETURNING *;`,
          hoursData.map(({ branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity }) =>
            [branch_id, day_of_week, open_time, close_time, capacity_per_hour, daily_capacity]
          )
        );
        return db.query(insertOperatingHoursQuery);
      })
      // Insert data into operating_hours_override
      .then(() => {
        const insertOverridesQuery = format(
          `INSERT INTO operating_hours_override
            (branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason)
          VALUES %L RETURNING *;`,
          overridesData.map(({ branch_id, date, is_closed, open_time, close_time, capacity_per_hour, daily_capacity, reason }) => [
            branch_id,
            date,
            is_closed,
            open_time,
            close_time,
            capacity_per_hour, 
            daily_capacity,
            reason,
          ])
        );
        return db.query(insertOverridesQuery);
      })
      // Insert data into booking_blocks
      .then(() => {
        if (!blocksData || !blocksData.length) return Promise.resolve();
        const insertBlocksQuery = format(
          `INSERT INTO booking_blocks (branch_id, date, start_time, end_time, capacity_per_hour, reason) VALUES %L RETURNING *;`,
          blocksData.map(({ branch_id, date, start_time, end_time, capacity_per_hour, reason }) => [
            branch_id,
            date,
            start_time,
            end_time,
            capacity_per_hour,
            reason
          ])
        );
        return db.query(insertBlocksQuery);
      })
      // Insert data into booking_types
      .then(() => {
        const insertBookingTypesQuery = format(
          `INSERT INTO booking_types (branch_id, name, price, length) VALUES %L RETURNING *;`,
          bookingTypesData.map(({ branch_id, name, price, length }) => [branch_id, name, price, length])
        );
        return db.query(insertBookingTypesQuery);
      })
      .then(() => {
        if (!presetsData || !presetsData.length) return Promise.resolve();
        const insertPresetsQuery = format(
          `INSERT INTO invoice_presets (branch_id, name, category, active, vin, mileage, technician, booking_id, comments) VALUES %L RETURNING *;`,
          presetsData.map(({ branch_id, name, category = null, active = true, vin = null, mileage = null, technician = null, booking_id = null, comments = null }) =>
            [branch_id, name, category, active, vin, mileage, technician, booking_id, comments]
          )
        );
        return db.query(insertPresetsQuery);
      })
      .then(() => {
        if (!presetItemsData || !presetItemsData.length) return Promise.resolve();
        const insertItemsQuery = format(
          `INSERT INTO invoice_preset_items (preset_id, type, description, quantity, price, vat_applies, quantity_default) VALUES %L RETURNING *;`,
          presetItemsData.map(({ preset_id, type = null, description = '', quantity = null, price = 0, vat_applies = true, quantity_default = 1 }) => [preset_id, type, description, quantity, price, vat_applies, quantity_default])
        );
        return db.query(insertItemsQuery);
      })
      // Insert data into bookings
      .then(() => {
        const insertBookingsQuery = format(
          `INSERT INTO bookings (branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status) VALUES %L RETURNING *;`,
          bookingsData.map(({ branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status }) =>
            [branch_id, user_id, booking_date, booking_time, booking_type_id, vehicle, comments, status]
          )
        );
        return db.query(insertBookingsQuery);
      })
      .then(() => {
        console.log('Seeding complete!');
      })
      .catch((err) => {
        console.error('Seeding error:', err);
      });
  };
  
  module.exports = seed;