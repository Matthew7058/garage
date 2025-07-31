// __tests__/confirmationEmail.test.js

// Silence console.error in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

jest.mock('resend', () => {
  // Create a private mock for send
  const mockSend = jest.fn();
  return {
    Resend: jest.fn(() => ({ emails: { send: mockSend } })),
    __mockSend: mockSend,  // export for tests
  };
});

const request = require('supertest');

let app;
let sendMock;

beforeEach(() => {
  // Reset module registry so mocks reapply
  jest.resetModules();

  // Re-require the mocked resend module to get the fresh mockSend instance
  const resend = require('resend');
  sendMock = resend.__mockSend;

  // Require the app after mocking
  app = require('../app');

  // Clear calls on the fresh mock
  sendMock.mockClear();
});

describe('POST /api/send-confirmation-email', () => {
  const endpoint = '/api/send-confirmation-email';
  const validBody = {
    email: 'test@example.com',
    bookingId: '12345',
    date: '2025-06-20',
    time: '14:00:00',
    service: 'Oil Change',
    branchName: 'Central Garage',
    vehicle: 'Toyota Land Cruiser',
    chain: 'Monopoly Garages',
    name: 'John Doe'
  };

  test('400 if missing fields', async () => {
    const res = await request(app).post(endpoint).send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields in request body.');
  });

  test('200 on success', async () => {
    // Mock Resend to resolve with a message id
    sendMock.mockResolvedValue({ id: 'msg_123' });

    const res = await request(app)
      .post(endpoint)
      .send(validBody);

    // Ensure send was called with expected payload
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.any(String),
      to: [validBody.email],
      subject: expect.any(String),
      html: expect.stringContaining(validBody.bookingId)
    }));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Confirmation email sent');
    expect(res.body).toHaveProperty('messageId', 'msg_123');
  });

  test('500 on error', async () => {
    // Simulate a failure in the Resend client
    sendMock.mockRejectedValue(new Error('fail'));

    const res = await request(app)
      .post(endpoint)
      .send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Server error sending confirmation email.');
  });
});