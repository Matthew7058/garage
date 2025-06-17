jest.mock('node-fetch');
const fetch = require('node-fetch');
const request = require('supertest');

let app;
let clearTokenCache;

beforeEach(() => {
  jest.resetModules();
  fetch.mockReset();
  app = require('../app');
  ({ clearTokenCache } = require('../controllers/motHistory-controller'));
  clearTokenCache();
});

// __tests__/motHistory.test.js

describe('GET /api/mot-history/:vrn', () => {
  const vrn = 'AB12CDE';
  let fetchMock, request, app, clearTokenCache;

  beforeEach(() => {
    // 1) Clear Jest's module registry so every require() yields a fresh module
    jest.resetModules();

    // 2) Create a fresh mock fn for fetch, and ensure all require('node-fetch') calls get it
    fetchMock = jest.fn();
    jest.doMock('node-fetch', () => fetchMock);

    // 3) Now that fetch is mocked, import the app and controller helpers
    app = require('../app');
    ({ clearTokenCache } = require('../controllers/motHistory-controller'));

    // 4) Reset the controller’s internal token cache
    clearTokenCache();

    // 5) Bring in supertest now that app is loaded
    request = require('supertest');
  });

  test('200: returns proxied MOT history JSON', async () => {
    // First call: Azure AD token endpoint
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token_type: 'Bearer',
        expires_in: 3600,
        access_token: 'fake-test-token'
      })
    });
    // Second call: MOT-history lookup
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        make: 'TestMake',
        model: 'TestModel',
        motTests: [{
          completedDate: '2025-01-01',
          testResult: 'PASSED',
          odometerValue: 12345
        }]
      })
    });

    const res = await request(app).get(`/api/mot-history/${vrn}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('make', 'TestMake');
    expect(res.body).toHaveProperty('model', 'TestModel');
    expect(Array.isArray(res.body.motTests)).toBe(true);
  });

  test('404: when external API returns 404', async () => {
    // Token OK
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token_type: 'Bearer',
        expires_in: 3600,
        access_token: 'fake-test-token'
      })
    });
    // MOT endpoint returns 404
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Vehicle not found' })
    });

    const res = await request(app).get('/api/mot-history/NOTFOUND');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Vehicle not found');
  });
});