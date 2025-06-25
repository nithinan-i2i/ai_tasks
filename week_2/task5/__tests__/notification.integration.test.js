const request = require('supertest');
// Adjust the path if your Express app is elsewhere
const app = require('../src/app');
const NotificationModel = require('../src/models/NotificationModel');
const UserModel = require('../src/models/UserModel'); // If available

// Helper: create a user and return user + token (mock or real)
async function registerAndLoginUser() {
  const userData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPass123!',
  };
  const res = await request(app)
    .post('/users')
    .send(userData);
  // If your app returns a token on registration, extract it
  // Otherwise, login and get token
  // const token = res.body.token || ...
  return { user: res.body, token: '' };
}

describe('Notification System Integration', () => {
  let user, token, notifId;

  beforeAll(async () => {
    // Optionally clear test DB
    await NotificationModel.deleteMany({});
    if (UserModel) await UserModel.deleteMany({});
  });

  it('registers a user and creates a notification', async () => {
    const result = await registerAndLoginUser();
    user = result.user;
    token = result.token;
    expect(user).toHaveProperty('_id');
    // Fetch notifications
    const notifRes = await request(app)
      .get('/notifications')
      // .set('Authorization', `Bearer ${token}`) // Uncomment if auth required
      .send();
    expect(notifRes.status).toBe(200);
    expect(Array.isArray(notifRes.body)).toBe(true);
    expect(notifRes.body.length).toBeGreaterThan(0);
    notifId = notifRes.body[0]._id;
  });

  it('marks notification as read', async () => {
    const res = await request(app)
      .post('/notifications/mark-read')
      // .set('Authorization', `Bearer ${token}`)
      .send({ ids: [notifId] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deletes notification', async () => {
    const res = await request(app)
      .delete(`/notifications/${notifId}`)
      // .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 