const endpointsJson = require("../endpoints.json");

/* Set up your test imports here */

const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const { chainsData, usersData, bookingsData, bookingTypesData, hoursData, branchesData } = require("../db/data/test-data/index");

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed({ chainsData, usersData, bookingsData, bookingTypesData, hoursData, branchesData }));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

// --------------------
// Garage Chains Endpoints
// --------------------
describe("Garage Chains Endpoints", () => {
    describe("GET /api/garage-chains", () => {
      test("200: Responds with all garage chains", () => {
        return request(app)
          .get("/api/garage-chains")
          .expect(200)
          .then(({ body: { chains } }) => {
            expect(Array.isArray(chains)).toBe(true);
            expect(chains.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/garage-chains/:id", () => {
      test("200: Responds with a single garage chain", () => {
        return request(app)
          .get("/api/garage-chains/1")
          .expect(200)
          .then(({ body: { chain } }) => {
            expect(chain).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if garage chain not found", () => {
        return request(app)
          .get("/api/garage-chains/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Garage chain not found");
          });
      });
    });
  
    describe("POST /api/garage-chains", () => {
      test("201: Creates a new garage chain", () => {
        const newChain = { name: "New Garage", contact: "new@garage.com" };
        return request(app)
          .post("/api/garage-chains")
          .send(newChain)
          .expect(201)
          .then(({ body: { chain } }) => {
            expect(chain).toHaveProperty("id");
            expect(chain.name).toBe(newChain.name);
            expect(chain.contact).toBe(newChain.contact);
          });
      });
    });
  
    describe("PATCH /api/garage-chains/:id", () => {
      test("200: Updates a garage chain", () => {
        const updatedData = { name: "Updated Garage", contact: "updated@garage.com" };
        return request(app)
          .patch("/api/garage-chains/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { chain } }) => {
            expect(chain.name).toBe(updatedData.name);
            expect(chain.contact).toBe(updatedData.contact);
          });
      });
      test("404: Returns error if garage chain not found", () => {
        const updatedData = { name: "Updated Garage", contact: "updated@garage.com" };
        return request(app)
          .patch("/api/garage-chains/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Garage chain not found");
          });
      });
    });
  
    describe("DELETE /api/garage-chains/:id", () => {
      test("200: Deletes a garage chain", () => {
        return request(app)
          .delete("/api/garage-chains/1")
          .expect(200)
          .then(({ body: { chain } }) => {
            expect(chain).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if garage chain not found", () => {
        return request(app)
          .delete("/api/garage-chains/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Garage chain not found");
          });
      });
    });

    describe("GET /api/garage-chains/:chain_id/branches", () => {
      test("200: Responds with all branches for a given chain", () => {
        return request(app)
          .get("/api/garage-chains/1/branches")
          .expect(200)
          .then(({ body: { branches } }) => {
            // cheeky check: every branch should belong to chain 1
            expect(Array.isArray(branches)).toBe(true);
            expect(branches.length).toBeGreaterThan(0);
            branches.forEach((b) => {
              expect(b).toHaveProperty("garage_id", 1);
            });
          });
      });

      test("200: Returns an empty array if chain exists but has no branches", () => {
        // assuming chain 999 exists in test seed but has no branches
        return request(app)
          .get("/api/garage-chains/999/branches")
          .expect(200)
          .then(({ body: { branches } }) => {
            expect(Array.isArray(branches)).toBe(true);
            expect(branches).toHaveLength(0);
          });
      });
    });
  });
  
  // --------------------
  // Branches Endpoints
  // --------------------
  describe("Branches Endpoints", () => {
    describe("GET /api/branches", () => {
      test("200: Responds with all branches", () => {
        return request(app)
          .get("/api/branches")
          .expect(200)
          .then(({ body: { branches } }) => {
            expect(Array.isArray(branches)).toBe(true);
            expect(branches.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/branches/:id", () => {
      test("200: Responds with a single branch", () => {
        return request(app)
          .get("/api/branches/1")
          .expect(200)
          .then(({ body: { branch } }) => {
            expect(branch).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if branch not found", () => {
        return request(app)
          .get("/api/branches/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Branch not found");
          });
      });
    });
  
    describe("POST /api/branches", () => {
      test("201: Creates a new branch", () => {
        const newBranch = {
          garage_id: 1,
          branch_name: "New Branch",
          address: "123 Main St",
          phone: "123-456-7890",
          email: "branch@example.com"
        };
        return request(app)
          .post("/api/branches")
          .send(newBranch)
          .expect(201)
          .then(({ body: { branch } }) => {
            expect(branch).toHaveProperty("id");
            expect(branch.branch_name).toBe(newBranch.branch_name);
          });
      });
    });
  
    describe("PATCH /api/branches/:id", () => {
      test("200: Updates a branch", () => {
        const updatedData = {
          branch_name: "Updated Branch",
          address: "456 New Address",
          phone: "987-654-3210",
          email: "updated@branch.com"
        };
        return request(app)
          .patch("/api/branches/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { branch } }) => {
            expect(branch.branch_name).toBe(updatedData.branch_name);
            expect(branch.address).toBe(updatedData.address);
          });
      });
      test("404: Returns error if branch not found", () => {
        const updatedData = { branch_name: "Updated Branch" };
        return request(app)
          .patch("/api/branches/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Branch not found");
          });
      });
    });
  
    describe("DELETE /api/branches/:id", () => {
      test("200: Deletes a branch", () => {
        return request(app)
          .delete("/api/branches/1")
          .expect(200)
          .then(({ body: { branch } }) => {
            expect(branch).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if branch not found", () => {
        return request(app)
          .delete("/api/branches/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Branch not found");
          });
      });
    });
  });
  
  // --------------------
  // Users Endpoints
  // --------------------
  describe("Users Endpoints", () => {
    describe("GET /api/users", () => {
      test("200: Responds with all users", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then(({ body: { users } }) => {
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/users/:id", () => {
      test("200: Responds with a single user", () => {
        return request(app)
          .get("/api/users/1")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if user not found", () => {
        return request(app)
          .get("/api/users/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("User not found");
          });
      });
    });
  
    describe("POST /api/users", () => {
      test("201: Creates a new user", () => {
        const newUser = {
          garage_id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "johndoe@example.com",
          phone: "1234567890",
          password_hash: "hashedpassword",
          role: "customer"
        };
        return request(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).toHaveProperty("id");
            expect(user.first_name).toBe(newUser.first_name);
          });
      });
    });
  
    describe("PATCH /api/users/:id", () => {
      test("200: Updates a user", () => {
        const updatedData = {
          first_name: "Jane",
          last_name: "Smith",
          email: "janesmith@example.com",
          phone: "0987654321",
          password_hash: "newhashedpassword",
          role: "admin"
        };
        return request(app)
          .patch("/api/users/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user.first_name).toBe(updatedData.first_name);
            expect(user.role).toBe(updatedData.role);
          });
      });
      test("404: Returns error if user not found", () => {
        const updatedData = { first_name: "Jane" };
        return request(app)
          .patch("/api/users/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("User not found");
          });
      });
    });
  
    describe("DELETE /api/users/:id", () => {
      test("200: Deletes a user", () => {
        return request(app)
          .delete("/api/users/1")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if user not found", () => {
        return request(app)
          .delete("/api/users/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("User not found");
          });
      });
    });
  });
  
  // --------------------
  // Operating Hours Endpoints
  // --------------------
  describe("Operating Hours Endpoints", () => {
    describe("GET /api/operating-hours", () => {
      test("200: Responds with all operating hours", () => {
        return request(app)
          .get("/api/operating-hours")
          .expect(200)
          .then(({ body: { operating_hours } }) => {
            expect(Array.isArray(operating_hours)).toBe(true);
            expect(operating_hours.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/operating-hours/:id", () => {
      test("200: Responds with a single operating hour record", () => {
        return request(app)
          .get("/api/operating-hours/1")
          .expect(200)
          .then(({ body: { operating_hour } }) => {
            expect(operating_hour).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if operating hour not found", () => {
        return request(app)
          .get("/api/operating-hours/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Operating hour not found");
          });
      });
    });
  
    describe("POST /api/operating-hours", () => {
      test("201: Creates a new operating hour record", () => {
        const newHour = {
          branch_id: 1,
          day_of_week: 3,
          open_time: "09:00:00",
          close_time: "17:00:00",
          capacity_per_hour: 5
        };
        return request(app)
          .post("/api/operating-hours")
          .send(newHour)
          .expect(201)
          .then(({ body: { operating_hour } }) => {
            expect(operating_hour).toHaveProperty("id");
            expect(operating_hour.day_of_week).toBe(newHour.day_of_week);
          });
      });
    });
  
    describe("PATCH /api/operating-hours/:id", () => {
      test("200: Updates an operating hour record", () => {
        const updatedData = {
          open_time: "10:00:00",
          close_time: "18:00:00"
        };
        return request(app)
          .patch("/api/operating-hours/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { operating_hour } }) => {
            expect(operating_hour.open_time).toBe(updatedData.open_time);
            expect(operating_hour.close_time).toBe(updatedData.close_time);
          });
      });
      test("404: Returns error if operating hour not found", () => {
        const updatedData = { open_time: "10:00:00" };
        return request(app)
          .patch("/api/operating-hours/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Operating hour not found");
          });
      });
    });
  
    describe("DELETE /api/operating-hours/:id", () => {
      test("200: Deletes an operating hour record", () => {
        return request(app)
          .delete("/api/operating-hours/1")
          .expect(200)
          .then(({ body: { operating_hour } }) => {
            expect(operating_hour).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if operating hour not found", () => {
        return request(app)
          .delete("/api/operating-hours/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Operating hour not found");
          });
      });
    });

    // 1. Operating hours by branch
    describe("GET /api/branchees/:branch_id/operating-hours", () => {
      test("200: returns operating hours for branch 1", () => {
        return request(app)
          .get("/api/operating-hours/branch/1")
          .expect(200)
          .then(({ body: { operating_hours } }) => {
            expect(Array.isArray(operating_hours)).toBe(true);
            expect(operating_hours.length).toBeGreaterThan(0);
            operating_hours.forEach((oh) => {
              expect(oh).toHaveProperty("branch_id", 1);
              expect(oh).toHaveProperty("open_time");
              expect(oh).toHaveProperty("close_time");
            });
          });
      });

      test("200: returns empty array for a branch with no hours (e.g. 999)", () => {
        return request(app)
          .get("/api/operating-hours/branch/999")
          .expect(200)
          .then(({ body: { operating_hours } }) => {
            expect(Array.isArray(operating_hours)).toBe(true);
            expect(operating_hours).toHaveLength(0);
          });
      });
    });
  });
  
  // --------------------
  // Booking Types Endpoints
  // --------------------
  describe("Booking Types Endpoints", () => {
    describe("GET /api/booking-types", () => {
      test("200: Responds with all booking types", () => {
        return request(app)
          .get("/api/booking-types")
          .expect(200)
          .then(({ body: { booking_types } }) => {
            expect(Array.isArray(booking_types)).toBe(true);
            expect(booking_types.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/booking-types/:id", () => {
      test("200: Responds with a single booking type", () => {
        return request(app)
          .get("/api/booking-types/1")
          .expect(200)
          .then(({ body: { booking_type } }) => {
            expect(booking_type).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if booking type not found", () => {
        return request(app)
          .get("/api/booking-types/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking type not found");
          });
      });
    });
  
    describe("POST /api/booking-types", () => {
      test("201: Creates a new booking type", () => {
        const newType = { name: "Filter Change", price: 29.99 };
        return request(app)
          .post("/api/booking-types")
          .send(newType)
          .expect(201)
          .then(({ body: { booking_type } }) => {
            expect(booking_type).toHaveProperty("id");
            expect(booking_type.name).toBe(newType.name);
            expect(Number(booking_type.price)).toBe(newType.price);
          });
      });
    });
  
    describe("PATCH /api/booking-types/:id", () => {
      test("200: Updates a booking type", () => {
        const updatedData = { name: "Tire Rotation", price: 19.99 };
        return request(app)
          .patch("/api/booking-types/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { booking_type } }) => {
            expect(booking_type.name).toBe(updatedData.name);
            expect(Number(booking_type.price)).toBe(updatedData.price);
          });
      });
      test("404: Returns error if booking type not found", () => {
        const updatedData = { name: "Tire Rotation" };
        return request(app)
          .patch("/api/booking-types/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking type not found");
          });
      });
    });
  
    describe("DELETE /api/booking-types/:id", () => {
      test("200: Deletes a booking type", () => {
        return request(app)
          .delete("/api/booking-types/1")
          .expect(200)
          .then(({ body: { booking_type } }) => {
            expect(booking_type).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if booking type not found", () => {
        return request(app)
          .delete("/api/booking-types/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking type not found");
          });
      });
    });

    // 2. Booking types by branch
    describe("GET /api/booking-types/branch/:branch_id", () => {
      test("200: returns booking types for branch 1", () => {
        return request(app)
          .get("/api/booking-types/branch/1")
          .expect(200)
          .then(({ body: { booking_types } }) => {
            expect(Array.isArray(booking_types)).toBe(true);
            expect(booking_types.length).toBeGreaterThan(0);
            booking_types.forEach((bt) => {
              expect(bt).toHaveProperty("branch_id", 1);
              expect(bt).toHaveProperty("name");
              expect(bt).toHaveProperty("price");
            });
          });
      });

      test("200: empty array when branch has no types (e.g. 999)", () => {
        return request(app)
          .get("/api/booking-types/branch/999")
          .expect(200)
          .then(({ body: { booking_types } }) => {
            expect(Array.isArray(booking_types)).toBe(true);
            expect(booking_types).toHaveLength(0);
          });
      });
    });
  });
  
  // --------------------
  // Bookings Endpoints
  // --------------------
  describe("Bookings Endpoints", () => {
    describe("GET /api/bookings", () => {
      test("200: Responds with all bookings", () => {
        return request(app)
          .get("/api/bookings")
          .expect(200)
          .then(({ body: { bookings } }) => {
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings.length).toBeGreaterThan(0);
          });
      });
    });
  
    describe("GET /api/bookings/:id", () => {
      test("200: Responds with a single booking", () => {
        return request(app)
          .get("/api/bookings/1")
          .expect(200)
          .then(({ body: { booking } }) => {
            expect(booking).toHaveProperty("id", 1);
          });
      });
      test("404: Responds with error if booking not found", () => {
        return request(app)
          .get("/api/bookings/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking not found");
          });
      });
    });
  
    describe("POST /api/bookings", () => {
      test("201: Creates a new booking", () => {
        const newBooking = {
          branch_id: 1,
          user_id: 1,
          booking_date: "2025-01-01",
          booking_time: "10:00:00",
          booking_type_id: 1,
          status: "confirmed"
        };
        return request(app)
          .post("/api/bookings")
          .send(newBooking)
          .expect(201)
          .then(({ body: { booking } }) => {
            expect(booking).toHaveProperty("id");
            expect(booking.status).toBe(newBooking.status);
          });
      });
    });
  
    describe("PATCH /api/bookings/:id", () => {
      test("200: Updates a booking", () => {
        const updatedData = { status: "cancelled" };
        return request(app)
          .patch("/api/bookings/1")
          .send(updatedData)
          .expect(200)
          .then(({ body: { booking } }) => {
            expect(booking.status).toBe(updatedData.status);
          });
      });
      test("404: Returns error if booking not found", () => {
        const updatedData = { status: "cancelled" };
        return request(app)
          .patch("/api/bookings/9999")
          .send(updatedData)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking not found");
          });
      });
    });
  
    describe("DELETE /api/bookings/:id", () => {
      test("200: Deletes a booking", () => {
        return request(app)
          .delete("/api/bookings/1")
          .expect(200)
          .then(({ body: { booking } }) => {
            expect(booking).toHaveProperty("id", 1);
          });
      });
      test("404: Returns error if booking not found", () => {
        return request(app)
          .delete("/api/bookings/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Booking not found");
          });
      });
    });

    // 3. All bookings at a branch
    describe("GET /api/bookings/branch/:branch_id", () => {
      test("200: returns all bookings for branch 1", () => {
        return request(app)
          .get("/api/bookings/branch/1")
          .expect(200)
          .then(({ body: { bookings } }) => {
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings.length).toBeGreaterThan(0);
            bookings.forEach((b) => {
              expect(b).toHaveProperty("branch_id", 1);
              expect(b).toHaveProperty("booking_date");
              expect(b).toHaveProperty("booking_time");
            });
          });
      });

      test("200: empty array for branch with no bookings (e.g. 999)", () => {
        return request(app)
          .get("/api/bookings/branch/999")
          .expect(200)
          .then(({ body: { bookings } }) => {
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings).toHaveLength(0);
          });
      });
    });

    // 4. Bookings at a branch on a specific date
    describe("GET /api/bookings/branch/:branch_id/date/:date", () => {
      test("200: returns only branch 1's bookings on 2025-05-01", () => {
        return request(app)
          .get("/api/bookings/branch/1/date/2025-05-01")
          .expect(200)
          .then(({ body: { bookings } }) => {
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings.length).toBeGreaterThan(0);
            bookings.forEach((b) => {
              expect(b).toHaveProperty("branch_id", 1);
              expect(b).toHaveProperty("booking_date", "2025-05-01");
            });
          });
      });

      test("200: returns empty array when no bookings on that date", () => {
        return request(app)
          .get("/api/bookings/branch/1/date/2099-01-01")
          .expect(200)
          .then(({ body: { bookings } }) => {
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings).toHaveLength(0);
          });
      });
    });
  });
  
  // --------------------
  // Invalid Routes
  // --------------------
  describe("Invalid Routes", () => {
    test("404: Responds with an error message for invalid route", () => {
      return request(app)
        .get("/api/non-existent")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Route not found");
        });
    });
  });