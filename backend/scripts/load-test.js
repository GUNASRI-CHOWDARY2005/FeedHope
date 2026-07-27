import http from 'k6/http';
import { check, sleep } from 'k6';

// FeedHope API Load Testing Configuration
export const options = {
  vus: 100, // 100 concurrent Virtual Users
  duration: '1m', // Run for 1 minute continuously
  thresholds: {
    http_req_failed: ['rate<0.05'], // Error rate must be under 5%
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete under 1.5s
  },
};

export default function () {
  const BASE_URL = __ENV.BACKEND_URL || 'http://localhost:5000';

  // 1. Health Check Endpoint
  const healthRes = http.get(`${BASE_URL}/`);
  check(healthRes, {
    'Health check status is 200': (r) => r.status === 200,
  });

  // 2. Fetch Users List
  const usersRes = http.get(`${BASE_URL}/api/users`);
  check(usersRes, {
    'Get users status is 200': (r) => r.status === 200,
  });

  // 3. Fetch Active Rescues
  const rescuesRes = http.get(`${BASE_URL}/api/rescues`);
  check(rescuesRes, {
    'Get rescues status is 200': (r) => r.status === 200,
  });

  // 4. Fetch Notifications
  const notifRes = http.get(`${BASE_URL}/api/notifications?userId=user-1`);
  check(notifRes, {
    'Get notifications status is 200': (r) => r.status === 200,
  });

  // 5. Chatbot Query
  const chatPayload = JSON.stringify({
    userId: 'user-load-test',
    role: 'volunteer',
    message: 'hi',
  });
  const chatParams = {
    headers: { 'Content-Type': 'application/json' },
  };
  const chatRes = http.post(`${BASE_URL}/api/chatbot`, chatPayload, chatParams);
  check(chatRes, {
    'Chatbot response status is 200': (r) => r.status === 200,
  });

  sleep(0.5); // Short pause between iterations
}
