const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */

const app = require('../app');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const { chainsData, usersData, bookingsData, bookingTypesData, hoursData, overridesData, branchesData, blocksData, presetsData, presetItemsData } = require("../db/data/test-data/index");

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => seed({ chainsData, usersData, bookingsData, bookingTypesData, hoursData, overridesData, branchesData, blocksData, presetsData, presetItemsData }));
afterAll(() => db.end());

const adminToken = jwt.sign(
  { id: usersData[0].id, email: usersData[0].email, role: 'admin' },
  process.env.JWT_SECRET || 'test_secret',
  { expiresIn: '1h' }
);

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
});

// --------------------
// Users Endpoints
// --------------------
describe("Users Endpoints", () => {
  // --------------------
  // GET /api/users  (auth protected)
  // --------------------
  describe("GET /api/users", () => {
    test("401: responds with unauthorised when no token provided", () => {
      return request(app)
        .get("/api/users")
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/invalid token/i);
        });
    });

    test("200: responds with all users when a valid ADMIN token is provided", () => {
      // Manually sign an ADMIN JWT so we don't depend on signup role assignment
      const adminPayload = {
        id: usersData[0].id,
        email: usersData[0].email,
        role: 'admin'
      };
      const adminToken = jwt.sign(
        adminPayload,
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      return request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .then(({ body: { users } }) => {
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBeGreaterThan(0);
        });
    });
  });

  describe("GET /api/users/:id", () => {
    test("401: unauthorised when no token", () => {
      return request(app)
        .get("/api/users/1")
        .expect(401);
    });

    test("200: returns a single user with valid ADMIN token", () => {
      return request(app)
        .get("/api/users/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).toHaveProperty("id", 1);
          expect(user).toHaveProperty("address");
          expect(user).toHaveProperty("postcode");
        });
    });

    test("404: user not found still needs token", () => {
      return request(app)
        .get("/api/users/9999")
        .set("Authorization", `Bearer ${adminToken}`)
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
        role: "customer",
        address: "221B Baker St",
        postcode: "NW1 6XE"
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body: { user } }) => {
          expect(user).toHaveProperty("id");
          expect(user.first_name).toBe(newUser.first_name);
          expect(user.address).toBe(newUser.address);
          expect(user.postcode).toBe(newUser.postcode);
        });
    });
  });
  describe("POST /api/users/check-or-create", () => {
    test("200: returns an existing user when a match is found", () => {
      const existing = usersData[0]; // seeded user
      const payload = {
        garage_id: existing.garage_id,
        first_name: existing.first_name,
        last_name: existing.last_name,
        email: existing.email,
        phone: existing.phone,
        address: existing.address,
        postcode: existing.postcode
      };

      return request(app)
        .post("/api/users/check-or-create")
        .send(payload)
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).toHaveProperty("id");
          expect(user.email).toBe(existing.email);
          expect(user.first_name).toBe(existing.first_name);
          expect(user.garage_id).toBe(existing.garage_id);
        });
    });

    test("201: creates and returns a new user when no match is found", () => {
      const uniqueEmail = `brandnew${Date.now()}@example.com`;
      const payload = {
        garage_id: 1,
        first_name: "Brand",
        last_name: "New",
        email: uniqueEmail,
        phone: "07700900000",
        address: "1 Test Street",
        postcode: "AA1 1AA"
      };

      return request(app)
        .post("/api/users/check-or-create")
        .send(payload)
        .expect(201)
        .then(({ body: { user } }) => {
          expect(user).toHaveProperty("id");
          expect(user.email).toBe(uniqueEmail);
          expect(user.first_name).toBe(payload.first_name);
          expect(user.garage_id).toBe(payload.garage_id);
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

    test("200: Updates a user's address & postcode", () => {
      const updatedAddress = {
        address: "42 Wallaby Way",
        postcode: "2000"
      };
      return request(app)
        .patch("/api/users/1")
        .send(updatedAddress)
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user.address).toBe(updatedAddress.address);
          expect(user.postcode).toBe(updatedAddress.postcode);
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
  describe("GET /api/operating-hours/:id", () => {
    test("200: Responds with a single operating hour record", () => {
      return request(app)
        .get("/api/operating-hours/1")
        .expect(200)
        .then(({ body: { operating_hour } }) => {
          expect(operating_hour).toHaveProperty("id", 1);
          expect(operating_hour).toHaveProperty('daily_capacity');
          expect(operating_hour).toHaveProperty('capacity_per_hour');
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

  // 1. Operating hours by branch
  describe("GET /api/branches/:branch_id/operating-hours", () => {
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
            expect(oh).toHaveProperty('daily_capacity');
            expect(oh).toHaveProperty('capacity_per_hour');
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
// Operating Hours Override Endpoints
// --------------------
describe("Operating Hours Override Endpoints", () => {
  describe("GET /api/operating-hours-override", () => {
    test("200: Responds with all overrides", () => {
      return request(app)
        .get("/api/operating-hours-override")
        .expect(200)
        .then(({ body: { overrides } }) => {
          expect(Array.isArray(overrides)).toBe(true);
          expect(overrides.length).toBeGreaterThan(0);
          overrides.forEach((ov) => {
            expect(ov).toHaveProperty("id");
            expect(ov).toHaveProperty("branch_id");
            expect(ov).toHaveProperty("date");
            expect(ov).toHaveProperty("is_closed");
            expect(ov).toHaveProperty("daily_capacity");
            expect(ov).toHaveProperty("reason");
            expect(ov).toHaveProperty("capacity_per_hour");
          });
        });
    });
  });

  describe("GET /api/operating-hours-override/:id", () => {
    test("200: Responds with a single override record", () => {
      return request(app)
        .get("/api/operating-hours-override/1")
        .expect(200)
        .then(({ body: { override } }) => {
          expect(override).toHaveProperty("id", 1);
          expect(override).toHaveProperty("branch_id");
          expect(override).toHaveProperty("date");
          expect(override).toHaveProperty("is_closed");
          expect(override).toHaveProperty("capacity_per_hour");
        });
    });
    test("404: Responds with error if override not found", () => {
      return request(app)
        .get("/api/operating-hours-override/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Override not found");
        });
    });
  });

  describe("POST /api/operating-hours-override", () => {
    test("201: Creates a new override", () => {
      const newOv = {
        branch_id: 1,
        date: "2025-10-01",
        is_closed: false,
        open_time: "08:00:00",
        close_time: "12:00:00",
        daily_capacity: 6,
        capacity_per_hour: 2,
        reason: "Test override",
      };
      return request(app)
        .post("/api/operating-hours-override")
        .send(newOv)
        .expect(201)
        .then(({ body: { override } }) => {
          expect(override).toHaveProperty("id");
          expect(override.branch_id).toBe(newOv.branch_id);
          expect(override.date).toBe(newOv.date);
          expect(override.is_closed).toBe(newOv.is_closed);
          expect(override.daily_capacity).toBe(newOv.daily_capacity);
          expect(override.capacity_per_hour).toBe(newOv.capacity_per_hour);
        });
    });
  });

  describe("PATCH /api/operating-hours-override/:id", () => {
    test("200: Updates an override record", () => {
      const updatedData = { reason: "Updated reason" };
      return request(app)
        .patch("/api/operating-hours-override/1")
        .send(updatedData)
        .expect(200)
        .then(({ body: { override } }) => {
          expect(override.reason).toBe(updatedData.reason);
        });
    });
    test("404: Returns error if override not found", () => {
      return request(app)
        .patch("/api/operating-hours-override/9999")
        .send({ reason: "Nope" })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Override not found");
        });
    });
  });

  describe("DELETE /api/operating-hours-override/:id", () => {
    test("200: Deletes an override record", () => {
      return request(app)
        .delete("/api/operating-hours-override/1")
        .expect(200)
        .then(({ body: { override } }) => {
          expect(override).toHaveProperty("id", 1);
        });
    });
    test("404: Returns error if override not found", () => {
      return request(app)
        .delete("/api/operating-hours-override/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Override not found");
        });
    });
  });

  describe("GET /api/branches/:branch_id/operating-hours-override/:date", () => {
    test("200: returns overrides for branch 1 on 2025-08-02", () => {
      return request(app)
        .get("/api/branches/1/operating-hours-override/2025-08-02")
        .expect(200)
        .then(({ body: { overrides } }) => {
          expect(Array.isArray(overrides)).toBe(true);
          expect(overrides.length).toBe(1);
          const ov = overrides[0];
          expect(ov.branch_id).toBe(1);
          expect(ov.date).toBe("2025-08-02");
          expect(ov.is_closed).toBe(true);
          expect(ov).toHaveProperty("capacity_per_hour");
        });
    });
    test("200: returns empty array for no overrides", () => {
      return request(app)
        .get("/api/branches/1/operating-hours-override/2099-01-01")
        .expect(200)
        .then(({ body: { overrides } }) => {
          expect(Array.isArray(overrides)).toBe(true);
          expect(overrides).toHaveLength(0);
        });
    });
  });
});
// --------------------
// --------------------
// Booking Blocks Endpoints
// --------------------
describe("Booking Blocks Endpoints", () => {
  describe("GET /api/booking-blocks", () => {
    test("200: responds with all booking blocks", () => {
      return request(app)
        .get("/api/booking-blocks")
        .expect(200)
        .then(({ body: { blocks } }) => {
          expect(Array.isArray(blocks)).toBe(true);
          expect(blocks.length).toBeGreaterThan(0);
          blocks.forEach((b) => {
            expect(b).toHaveProperty("id");
            expect(b).toHaveProperty("branch_id");
            expect(b).toHaveProperty("date");
            expect(b).toHaveProperty("start_time");
            expect(b).toHaveProperty("end_time");
            expect(b).toHaveProperty("capacity_per_hour");
          });
        });
    });
  });

  describe("GET /api/booking-blocks/:id", () => {
    test("200: responds with a single block", () => {
      return request(app)
        .get("/api/booking-blocks")
        .then(({ body: { blocks } }) => {
          const id = blocks[0].id;
          return request(app)
            .get(`/api/booking-blocks/${id}`)
            .expect(200)
            .then(({ body: { block } }) => {
              expect(block).toHaveProperty("id", id);
            });
        });
    });

    test("404: responds with error if block not found", () => {
      return request(app)
        .get("/api/booking-blocks/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/block not found/i);
        });
    });
  });

  describe("POST /api/booking-blocks", () => {
    test("201: creates a new block", () => {
      const newBlock = {
        branch_id: 1,
        date: "2025-10-10",
        start_time: "10:00",
        end_time: "12:00",
        capacity_per_hour: 0,
        reason: "Doctor appt"
      };
      return request(app)
        .post("/api/booking-blocks")
        .send(newBlock)
        .expect(201)
        .then(({ body: { block } }) => {
          expect(block).toHaveProperty("id");
          expect(block.branch_id).toBe(newBlock.branch_id);
          expect(block.date).toBe(newBlock.date);
          expect(block.start_time).toBe(newBlock.start_time);
          expect(block.end_time).toBe(newBlock.end_time);
          expect(block.capacity_per_hour).toBe(newBlock.capacity_per_hour);
          expect(block.reason).toBe(newBlock.reason);
        });
    });
  });

  describe("PATCH /api/booking-blocks/:id", () => {
    test("200: updates a block", () => {
      const patchData = { capacity_per_hour: 5, reason: "Extra tester in" };
      return request(app)
        .get("/api/booking-blocks")
        .then(({ body: { blocks } }) => {
          const id = blocks[0].id;
          return request(app)
            .patch(`/api/booking-blocks/${id}`)
            .send(patchData)
            .expect(200)
            .then(({ body: { block } }) => {
              expect(block.capacity_per_hour).toBe(patchData.capacity_per_hour);
              expect(block.reason).toBe(patchData.reason);
            });
        });
    });

    test("404: returns error if block not found", () => {
      return request(app)
        .patch("/api/booking-blocks/999999")
        .send({ capacity_per_hour: 0 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/block not found/i);
        });
    });
  });

  describe("DELETE /api/booking-blocks/:id", () => {
    test("200: deletes a block", () => {
      return request(app)
        .get("/api/booking-blocks")
        .then(({ body: { blocks } }) => {
          const id = blocks[0].id;
          return request(app)
            .delete(`/api/booking-blocks/${id}`)
            .expect(200)
            .then(({ body: { block } }) => {
              expect(block).toHaveProperty("id", id);
            });
        });
    });

    test("404: returns error if block not found", () => {
      return request(app)
        .delete("/api/booking-blocks/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/block not found/i);
        });
    });
  });

  describe("GET /api/booking-blocks/branch/:branch_id/date/:date", () => {
    test("200: responds with blocks for branch and date", () => {
      const sample = blocksData[0];
      return request(app)
        .get(`/api/booking-blocks/branch/${sample.branch_id}/date/${sample.date}`)
        .expect(200)
        .then(({ body: { blocks } }) => {
          expect(Array.isArray(blocks)).toBe(true);
          blocks.forEach((b) => {
            expect(b.branch_id).toBe(sample.branch_id);
            expect(b.date).toBe(sample.date);
          });
        });
    });

    test("200: empty array when no blocks for that date", () => {
      return request(app)
        .get("/api/booking-blocks/branch/1/date/2099-01-01")
        .expect(200)
        .then(({ body: { blocks } }) => {
          expect(Array.isArray(blocks)).toBe(true);
          expect(blocks).toHaveLength(0);
        });
    });
  });
});
// --------------------
// Invoice Presets Endpoints
// --------------------
describe("Invoice Presets Endpoints", () => {
  describe("POST /api/invoice-presets", () => {
    test("201: creates a preset with its items", () => {
      const payload = {
        branch_id: 1,
        name: "Spark Plug Change",
        category: "Engine",
        items: [
          { type: "labour", description: "Labour", quantity_default: 1.5, price: 60.0, vat_applies: true },
          { type: "part", description: "Spark Plug", quantity_default: 4, price: 3.25, vat_applies: true }
        ]
      };
      return request(app)
        .post("/api/invoice-presets")
        .send(payload)
        .expect(201)
        .then(({ body: { preset } }) => {
          expect(preset).toHaveProperty("id");
          expect(preset.name).toBe(payload.name);
          expect(preset.branch_id).toBe(payload.branch_id);
          expect(Array.isArray(preset.items)).toBe(true);
          expect(preset.items.length).toBe(2);
          const item = preset.items[0];
          expect(item).toHaveProperty("id");
          expect(item).toHaveProperty("preset_id", preset.id);
          expect(item).toHaveProperty("price");
        });
    });
  });

  describe("PATCH /api/invoice-presets/:id", () => {
    test("200: updates preset fields (name/active)", () => {
      const create = {
        branch_id: 1,
        name: "Air Filter Swap",
        category: "Service",
        items: []
      };
      return request(app)
        .post("/api/invoice-presets")
        .send(create)
        .expect(201)
        .then(({ body: { preset } }) => {
          const patchData = { name: "Air Filter Replacement", active: false };
          return request(app)
            .patch(`/api/invoice-presets/${preset.id}`)
            .send(patchData)
            .expect(200)
            .then(({ body: { preset: updated } }) => {
              expect(updated.name).toBe(patchData.name);
              expect(updated.active).toBe(patchData.active);
            });
        });
    });

    test("404: returns error when preset id not found", () => {
      return request(app)
        .patch("/api/invoice-presets/999999")
        .send({ name: "Nope" })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/preset not found/i);
        });
    });
  });

  describe("DELETE /api/invoice-presets/:id", () => {
    test("200: deletes a preset", () => {
      const make = { branch_id: 1, name: "Temp Preset", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(make)
        .expect(201)
        .then(({ body: { preset } }) => {
          return request(app)
            .delete(`/api/invoice-presets/${preset.id}`)
            .expect(200)
            .then(({ body: { preset: deleted } }) => {
              expect(deleted).toHaveProperty("id", preset.id);
            });
        });
    });

    test("404: returns error if preset not found", () => {
      return request(app)
        .delete("/api/invoice-presets/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/preset not found/i);
        });
    });
  });

  describe("POST /api/invoice-presets/:id/items", () => {
    test("201: adds an item to an existing preset", () => {
      const base = { branch_id: 1, name: "Brake Service", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(base)
        .expect(201)
        .then(({ body: { preset } }) => {
          const newItem = { type: "part", description: "Brake Fluid", quantity_default: 1, price: 12.5, vat_applies: true };
          return request(app)
            .post(`/api/invoice-presets/${preset.id}/items`)
            .send(newItem)
            .expect(201)
            .then(({ body: { item } }) => {
              expect(item).toHaveProperty("id");
              expect(item).toHaveProperty("preset_id", preset.id);
              expect(item.description).toBe(newItem.description);
            });
        });
    });

    test("404: error when adding item to unknown preset", () => {
      const newItem = { type: "part", description: "Ghost Part", quantity_default: 1, price: 1.0, vat_applies: true };
      return request(app)
        .post("/api/invoice-presets/999999/items")
        .send(newItem)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/preset not found/i);
        });
    });
  });

  describe("PATCH /api/invoice-presets/items/:itemId", () => {
    test("200: edits an item", () => {
      const base = { branch_id: 1, name: "AC Service", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(base)
        .expect(201)
        .then(({ body: { preset } }) => {
          const itemPayload = { type: "labour", description: "AC Labour", quantity_default: 1, price: 50, vat_applies: true };
          return request(app)
            .post(`/api/invoice-presets/${preset.id}/items`)
            .send(itemPayload)
            .expect(201)
            .then(({ body: { item } }) => {
              const patch = { price: 65.25, description: "AC System Labour" };
              return request(app)
                .patch(`/api/invoice-presets/items/${item.id}`)
                .send(patch)
                .expect(200)
                .then(({ body: { item: updated } }) => {
                  expect(Number(updated.price)).toBe(patch.price);
                  expect(updated.description).toBe(patch.description);
                });
            });
        });
    });

    test("404: error when item not found", () => {
      return request(app)
        .patch("/api/invoice-presets/items/999999")
        .send({ price: 1 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/item not found/i);
        });
    });

    test("200: edits multiple numeric and boolean fields", () => {
      const base = { branch_id: 1, name: "Coolant Flush", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(base)
        .expect(201)
        .then(({ body: { preset } }) => {
          const itemPayload = {
            type: "labour",
            description: "Coolant Flush Labour",
            quantity_default: 1,
            price: 80,
            vat_applies: true
          };
          return request(app)
            .post(`/api/invoice-presets/${preset.id}/items`)
            .send(itemPayload)
            .expect(201)
            .then(({ body: { item } }) => {
              const patch = { quantity_default: '2.00', vat_applies: false };
              return request(app)
                .patch(`/api/invoice-presets/items/${item.id}`)
                .send(patch)
                .expect(200)
                .then(({ body: { item: updated } }) => {
                  expect(updated.quantity_default).toBe(patch.quantity_default);
                  expect(updated.vat_applies).toBe(patch.vat_applies);
                });
            });
        });
    });
  });

  describe("DELETE /api/invoice-presets/items/:itemId", () => {
    test("200: deletes an item", () => {
      const base = { branch_id: 1, name: "Tyre Change", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(base)
        .expect(201)
        .then(({ body: { preset } }) => {
          const itemPayload = { type: "part", description: "Valve", quantity_default: 4, price: 1.5, vat_applies: true };
          return request(app)
            .post(`/api/invoice-presets/${preset.id}/items`)
            .send(itemPayload)
            .expect(201)
            .then(({ body: { item } }) => {
              return request(app)
                .delete(`/api/invoice-presets/items/${item.id}`)
                .expect(200)
                .then(({ body: { item: deleted } }) => {
                  expect(deleted).toHaveProperty("id", item.id);
                });
            });
        });
    });

    test("404: error when deleting unknown item", () => {
      return request(app)
        .delete("/api/invoice-presets/items/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/item not found/i);
        });
    });

    test("404: deleting the same item twice returns error", () => {
      const base = { branch_id: 1, name: "Oil Top-Up", items: [] };
      return request(app)
        .post("/api/invoice-presets")
        .send(base)
        .expect(201)
        .then(({ body: { preset } }) => {
          const itemPayload = {
            type: "part",
            description: "Oil Litre",
            quantity_default: 1,
            price: 5,
            vat_applies: true
          };
          return request(app)
            .post(`/api/invoice-presets/${preset.id}/items`)
            .send(itemPayload)
            .expect(201)
            .then(({ body: { item } }) => {
              return request(app)
                .delete(`/api/invoice-presets/items/${item.id}`)
                .expect(200)
                .then(() => {
                  return request(app)
                    .delete(`/api/invoice-presets/items/${item.id}`)
                    .expect(404)
                    .then(({ body: { msg } }) => {
                      expect(msg).toMatch(/item not found/i);
                    });
                });
            });
        });
    });
  });
});
  // 2. Presets by branch
  describe("GET /api/invoice-presets/branch/:branch_id", () => {
    test("200: returns all presets for branch 1", () => {
      return request(app)
        .get("/api/invoice-presets/branch/1")
        .expect(200)
        .then(({ body: { presets } }) => {
          expect(Array.isArray(presets)).toBe(true);
          expect(presets.length).toBeGreaterThan(0);
          presets.forEach((p) => {
            expect(p).toHaveProperty("branch_id", 1);
            expect(p).toHaveProperty("name");
            expect(Array.isArray(p.items)).toBe(true);
          });
        });
    });

    test("200: empty array when branch has no presets (e.g. 999)", () => {
      return request(app)
        .get("/api/invoice-presets/branch/999")
        .expect(200)
        .then(({ body: { presets } }) => {
          expect(Array.isArray(presets)).toBe(true);
          expect(presets).toHaveLength(0);
        });
    });
  });
// --------------------
// Job Sheets Endpoints
// --------------------
describe("Job Sheets Endpoints", () => {

  // 2. Create a job sheet
  describe("POST /api/job-sheets", () => {
    test("201: creates a job sheet with its items", () => {
      const payload = {
        branch_id: 1,
        booking_id: 1,
        name: "Service Job Sheet",
        category: "jobsheet",
        vin: "WBA1234567890",
        mileage: 123456,
        comments: "Service is due soon",
        technician: "Gaz",
        items: [
          { type: "labour", description: "Inspection", quantity_default: 1, price: 40, vat_applies: true }
        ]
      };
      return request(app)
        .post("/api/job-sheets")
        .send(payload)
        .expect(201)
        .then(({ body: { job_sheet } }) => {
          expect(job_sheet).toHaveProperty("id");
          expect(job_sheet.name).toBe(payload.name);
          expect(job_sheet.category).toBe("jobsheet");
          expect(job_sheet.booking_id).toBe(payload.booking_id);
          expect(Array.isArray(job_sheet.items)).toBe(true);
          expect(job_sheet.items.length).toBe(1);
          expect(job_sheet.comments).toBe(payload.comments);
        });
    });
  });

  // 3. Get by id
  describe("GET /api/job-sheets/:id", () => {
    test("200: gets a job sheet by id", () => {
      const make = { branch_id: 1, booking_id: 1, name: "Temp Sheet", category: "jobsheet", comments: "Temp comment", items: [] };
      return request(app)
        .post("/api/job-sheets")
        .send(make)
        .expect(201)
        .then(({ body: { job_sheet } }) => {
          return request(app)
            .get(`/api/job-sheets/${job_sheet.id}`)
            .expect(200)
            .then(({ body: { job_sheet: fetched } }) => {
              expect(fetched).toHaveProperty("id", job_sheet.id);
              expect(fetched.comments).toBe(make.comments);
            });
        });
    });

    test("404: returns error if sheet not found", () => {
      return request(app)
        .get("/api/job-sheets/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/Preset not found/i);
        });
    });
  });

  // 4. Get by booking id
  describe("GET /api/job-sheets/booking/:booking_id", () => {
    test("200: gets job sheet by booking id", () => {
      const make = { branch_id: 1, booking_id: 2, name: "Booking Sheet", category: "jobsheet", comments: "Booking comment", items: [] };
      return request(app)
        .post("/api/job-sheets")
        .send(make)
        .expect(201)
        .then(() => {
          return request(app)
            .get(`/api/job-sheets/booking/${make.booking_id}`)
            .expect(200)
            .then(({ body: { job_sheet } }) => {
              expect(job_sheet).toHaveProperty("booking_id", make.booking_id);
              expect(job_sheet.comments).toBe(make.comments);
            });
        });
    });
  });

  // 5. Patch a job sheet
  describe("PATCH /api/job-sheets/:id", () => {
    test("200: updates a job sheet", () => {
      const make = { branch_id: 1, booking_id: 3, name: "Update Sheet", category: "jobsheet", comments: "Initial comment", items: [] };
      return request(app)
        .post("/api/job-sheets")
        .send(make)
        .expect(201)
        .then(({ body: { job_sheet } }) => {
          const patchData = { name: "Updated Job Sheet", mileage: 150000, comments: "Updated comment" };
          return request(app)
            .patch(`/api/job-sheets/${job_sheet.id}`)
            .send(patchData)
            .expect(200)
            .then(({ body: { job_sheet: updated } }) => {
              expect(updated.name).toBe(patchData.name);
              expect(updated.mileage).toBe(patchData.mileage);
              expect(updated.comments).toBe(patchData.comments);
            });
        });
    });
  });

  // 6. Delete a job sheet
  describe("DELETE /api/job-sheets/:id", () => {
    test("200: deletes a job sheet", () => {
      const make = { branch_id: 1, booking_id: 4, name: "Delete Sheet", category: "jobsheet", items: [] };
      return request(app)
        .post("/api/job-sheets")
        .send(make)
        .expect(201)
        .then(({ body: { job_sheet } }) => {
          return request(app)
            .delete(`/api/job-sheets/${job_sheet.id}`)
            .expect(200)
            .then(({ body: { job_sheet: deleted } }) => {
              expect(deleted).toHaveProperty("id", job_sheet.id);
            });
        });
    });
  });
});

// --------------------
// Booking Types Endpoints
// --------------------
describe("Booking Types Endpoints", () => {
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
    test("401: unauthorised when no token", () => {
      return request(app)
        .get("/api/bookings/branch/1")
        .expect(401);
    });

    test("200: returns bookings for branch 1 with ADMIN token", () => {
      return request(app)
        .get("/api/bookings/branch/1")
        .set("Authorization", `Bearer ${adminToken}`)
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

    test("200: empty array for unknown branch with token", () => {
      return request(app)
        .get("/api/bookings/branch/999")
        .set("Authorization", `Bearer ${adminToken}`)
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
// Auth Endpoints
// --------------------

describe('Auth Endpoints', () => {
  const testUser = {
    garage_id: 1,
    first_name: 'Cheeky',
    last_name: 'Chappy',
    email: `cheeky${Date.now()}@example.com`,
    role: 'temporary',
    password: 'sneakyPass123'
  };
  const testUser2 = {
    garage_id: 1,
    first_name: 'Cheeky',
    last_name: 'Guy',
    email: `cheeky${Date.now()}@example.com`,
    role: 'customer',
    password: 'sneakyPass123'
  };

  describe('POST /api/auth/signup', () => {
    test('201 then 409 on duplicate signup in one go when role is customer', () => {
      return request(app)
        .post('/api/auth/signup')
        .send(testUser2)
        .expect(201)
        .then(() => {
          return request(app)
            .post('/api/auth/signup')
            .send(testUser2)
            .expect(409)
            .then(({ body: { msg } }) => {
              expect(msg).toMatch(/Email already in use/i);
            });
        });
    });
  });

  describe('POST /api/auth/login', () => {
    test('200 on correct credentials, then 401 on wrong password', () => {
      // first sign up so login can succeed
      return request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .then(() => {
          // correct credentials
          return request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200)
            .then(({ body: { user } }) => {
              expect(user).toHaveProperty('id');
              expect(user.email).toBe(testUser.email);
            });
        })
        .then(() => {
          // wrong password
          return request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongPass' })
            .expect(401)
            .then(({ body: { msg } }) => {
              expect(msg).toMatch(/Invalid credentials/i);
            });
        });
    });

    test('404 on unknown email', () => {
      return request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@nowhere.com', password: 'irrelevant' })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toMatch(/User not found/i);
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

// --------------------
// Bookings by User Email & Name
// --------------------
describe("GET /api/bookings/user/email/:email", () => {
  test("200: responds with only that user's bookings", () => {
    const testUser = usersData[0];
    return request(app)
      .get(`/api/bookings/user/email/${testUser.email}`)
      .expect(200)
      .then(({ body: { bookings } }) => {
        expect(Array.isArray(bookings)).toBe(true);
        expect(bookings.length).toBeGreaterThan(0);
        // all bookings must share the same user_id
        const firstUid = bookings[0].user_id;
        bookings.forEach((b) => {
          expect(b).toHaveProperty("user_id", firstUid);
        });
      });
  });

  test("200: responds with an empty array for an unknown email", () => {
    return request(app)
      .get("/api/bookings/user/email/noone@example.com")
      .expect(200)
      .then(({ body: { bookings } }) => {
        expect(Array.isArray(bookings)).toBe(true);
        expect(bookings).toHaveLength(0);
      });
  });
});

describe("GET /api/bookings/user/search/:name", () => {
  test("200: responds with bookings for a matching (first) name", () => {
    const testUser = usersData[1];
    const nameParam = testUser.first_name.toUpperCase(); // test case-insensitivity
    return request(app)
      .get(`/api/bookings/user/search/${nameParam}`)
      .expect(200)
      .then(({ body: { bookings } }) => {
        expect(Array.isArray(bookings)).toBe(true);
        expect(bookings.length).toBeGreaterThan(0);
        // again, every booking should belong to the same user_id
        const firstUid = bookings[0].user_id;
        bookings.forEach((b) => {
          expect(b).toHaveProperty("user_id", firstUid);
        });
      });
  });

  test("200: responds with an empty array if no name matches", () => {
    return request(app)
      .get("/api/bookings/user/search/DefinitelyNotAName")
      .expect(200)
      .then(({ body: { bookings } }) => {
        expect(Array.isArray(bookings)).toBe(true);
        expect(bookings).toHaveLength(0);
      });
  });
});