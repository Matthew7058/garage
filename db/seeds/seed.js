const format = require('pg-format');
const db = require('../connection');

const seed = ({ chainsData, usersData, bookingsData, bookingTypesData, hoursData, branchesData }) => {
    // Drop tables in order (most dependent first)
    return db.query(`DROP TABLE IF EXISTS bookings;`)
      .then(() => db.query(`DROP TABLE IF EXISTS booking_types;`))
      .then(() => db.query(`DROP TABLE IF EXISTS operating_hours;`))
      .then(() => db.query(`DROP TABLE IF EXISTS users;`))
      .then(() => db.query(`DROP TABLE IF EXISTS branches;`))
      .then(() => db.query(`DROP TABLE IF EXISTS garage_chains;`))
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
            lat Decimal(8,6),
            lng Decimal(9,6),
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
            name VARCHAR(50) UNIQUE NOT NULL,
            price NUMERIC(10, 2)
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
          `INSERT INTO users (garage_id, first_name, last_name, email, phone, password_hash, role) VALUES %L RETURNING *;`,
          usersData.map(({ garage_id, first_name, last_name, email, phone, password_hash, role }) =>
            [garage_id, first_name, last_name, email, phone, password_hash, role]
          )
        );
        return db.query(insertUsersQuery);
      })
      // Insert data into operating_hours
      .then(() => {
        const insertOperatingHoursQuery = format(
          `INSERT INTO operating_hours (branch_id, day_of_week, open_time, close_time, capacity_per_hour) VALUES %L RETURNING *;`,
          hoursData.map(({ branch_id, day_of_week, open_time, close_time, capacity_per_hour }) =>
            [branch_id, day_of_week, open_time, close_time, capacity_per_hour]
          )
        );
        return db.query(insertOperatingHoursQuery);
      })
      // Insert data into booking_types
      .then(() => {
        const insertBookingTypesQuery = format(
          `INSERT INTO booking_types (branch_id, name, price) VALUES %L RETURNING *;`,
          bookingTypesData.map(({ branch_id, name, price }) => [branch_id, name, price])
        );
        return db.query(insertBookingTypesQuery);
      })

      // Insert data into bookings
      .then(() => {
        const insertBookingsQuery = format(
          `INSERT INTO bookings (branch_id, user_id, booking_date, booking_time, booking_type_id, status) VALUES %L RETURNING *;`,
          bookingsData.map(({ branch_id, user_id, booking_date, booking_time, booking_type_id, status }) =>
            [branch_id, user_id, booking_date, booking_time, booking_type_id, status]
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