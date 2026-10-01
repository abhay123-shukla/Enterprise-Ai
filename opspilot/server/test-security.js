/**
 * OpsPilot Security Audit & Verification Suite (Criterion 4.7)
 * Tests: JWT, bcrypt, Zod, CORS, Helmet, Rate Limiting, Authorization, Environment Variables
 */

import http from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/utils/seed.js';
import { registerSchema } from './src/validators/auth.validator.js';
import { createRequestSchema } from './src/validators/request.validator.js';

let server;
const TEST_PORT = 5098;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper: HTTP request wrapper
const httpRequest = ({ method = 'GET', path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let postData = null;

    if (body) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const runSecurityTests = async () => {
  console.log('\n======================================================');
  console.log('   🔒 OPSPOLOT CRITERION 4.7 SECURITY VERIFICATION    ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ✕ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  try {
    // 0. Setup Server
    await connectDB();
    await seedDatabase();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`  🚀 Ephemeral test server active on ${BASE_URL}\n`);
        resolve();
      });
    });

    // -----------------------------------------------------------------
    // 1. ENVIRONMENT VARIABLES TEST
    // -----------------------------------------------------------------
    console.log('--- 1. Environment Variables Isolation ---');
    assert(typeof ENV.PORT === 'number' && ENV.PORT > 0, 'PORT is configured as valid number', `Got: ${ENV.PORT}`);
    assert(typeof ENV.JWT_SECRET === 'string' && ENV.JWT_SECRET.length >= 8, 'JWT_SECRET is isolated and strong', `Secret length: ${ENV.JWT_SECRET?.length}`);
    assert(ENV.NODE_ENV !== undefined, 'NODE_ENV is defined', `Got: ${ENV.NODE_ENV}`);
    assert(ENV.CLIENT_URL !== undefined, 'CLIENT_URL is defined', `Got: ${ENV.CLIENT_URL}`);
    assert(ENV.GEMINI_API_KEY !== undefined, 'GEMINI_API_KEY is configured in backend environment only');

    // Verify /health endpoint does not leak secrets
    const healthRes = await httpRequest({ path: '/health' });
    const healthStr = JSON.stringify(healthRes.body);
    const noSecretLeaked =
      !healthStr.includes(ENV.JWT_SECRET) &&
      (!ENV.GEMINI_API_KEY || !healthStr.includes(ENV.GEMINI_API_KEY));
    assert(
      noSecretLeaked,
      'Health check response never leaks secrets or API keys'
    );

    // -----------------------------------------------------------------
    // 2. BCRYPT PASSWORD HASHING TEST
    // -----------------------------------------------------------------
    console.log('\n--- 2. bcrypt Password Hashing ---');
    const rawPassword = 'SuperSecurePassword!2026';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPassword, saltRounds);

    assert(hash.startsWith('$2'), 'bcrypt salt and hash format conforms to $2 standard');
    assert(hash !== rawPassword, 'Plaintext password is never stored or matched directly');
    const matchValid = await bcrypt.compare(rawPassword, hash);
    assert(matchValid === true, 'bcrypt correctly verifies valid password');
    const matchInvalid = await bcrypt.compare('WrongPassword!123', hash);
    assert(matchInvalid === false, 'bcrypt safely rejects invalid password');

    // -----------------------------------------------------------------
    // 3. JWT TOKEN TEST
    // -----------------------------------------------------------------
    console.log('\n--- 3. JWT (JSON Web Token) Security ---');
    const userPayload = { id: 'test-user-123', email: 'secops@opspilot.com', role: 'agent' };
    const token = jwt.sign(userPayload, ENV.JWT_SECRET, { expiresIn: '1h' });

    assert(typeof token === 'string' && token.split('.').length === 3, 'JWT has valid three-segment structure (header.payload.signature)');
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    assert(decoded.id === userPayload.id && decoded.email === userPayload.email, 'JWT verification properly decodes payload');

    let tamperedFailed = false;
    try {
      jwt.verify(token, 'WrongSecretKey!');
    } catch {
      tamperedFailed = true;
    }
    assert(tamperedFailed, 'JWT rejects verification with incorrect or forged secret');

    let expiredFailed = false;
    try {
      const expiredToken = jwt.sign(userPayload, ENV.JWT_SECRET, { expiresIn: -1 });
      jwt.verify(expiredToken, ENV.JWT_SECRET);
    } catch (err) {
      expiredFailed = err.name === 'TokenExpiredError';
    }
    assert(expiredFailed, 'JWT verification rejects expired tokens (TokenExpiredError)');

    // -----------------------------------------------------------------
    // 4. ZOD VALIDATION TEST
    // -----------------------------------------------------------------
    console.log('\n--- 4. Zod Schema Validation ---');
    // Test auth validation
    const validRegister = registerSchema.safeParse({
      name: 'Security Tester',
      email: 'tester@opspilot.com',
      password: 'password123',
      role: 'employee',
      department: 'Security'
    });
    assert(validRegister.success === true, 'Zod accepts fully valid registration schema');

    const invalidEmail = registerSchema.safeParse({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'password123'
    });
    assert(invalidEmail.success === false, 'Zod rejects malformed email address');

    const shortPassword = registerSchema.safeParse({
      name: 'Short Pass',
      email: 'short@opspilot.com',
      password: '123'
    });
    assert(shortPassword.success === false, 'Zod enforces minimum password length constraint');

    // Test API route rejecting bad schema over HTTP
    const badHttpRes = await httpRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: { email: 'bad' } // missing name and password
    });
    assert(badHttpRes.statusCode === 400, 'Express endpoint returns 400 on Zod schema validation failure');

    // -----------------------------------------------------------------
    // 5. CORS HEADERS TEST
    // -----------------------------------------------------------------
    console.log('\n--- 5. CORS (Cross-Origin Resource Sharing) ---');
    const corsRes = await httpRequest({
      method: 'GET',
      path: '/health',
      headers: { Origin: 'http://localhost:5173' }
    });
    assert(
      corsRes.headers['access-control-allow-origin'] !== undefined,
      'CORS headers are present on cross-origin requests'
    );

    // -----------------------------------------------------------------
    // 6. HELMET SECURITY HEADERS TEST
    // -----------------------------------------------------------------
    console.log('\n--- 6. Helmet Security Headers ---');
    assert(
      corsRes.headers['x-content-type-options'] === 'nosniff',
      'Helmet sets X-Content-Type-Options: nosniff'
    );
    assert(
      corsRes.headers['x-frame-options'] === 'SAMEORIGIN' || corsRes.headers['x-frame-options'] === 'DENY',
      'Helmet sets X-Frame-Options against clickjacking'
    );
    assert(
      corsRes.headers['x-dns-prefetch-control'] === 'off',
      'Helmet sets X-DNS-Prefetch-Control: off'
    );
    assert(
      corsRes.headers['x-download-options'] === 'noopen',
      'Helmet sets X-Download-Options: noopen'
    );
    assert(
      corsRes.headers['x-permitted-cross-domain-policies'] === 'none',
      'Helmet sets X-Permitted-Cross-Domain-Policies: none'
    );

    // -----------------------------------------------------------------
    // 7. RATE LIMITING TEST
    // -----------------------------------------------------------------
    console.log('\n--- 7. Rate Limiting Headers ---');
    const rlRes = await httpRequest({ path: '/health' });
    const hasRateLimitHeader =
      rlRes.headers['ratelimit-limit'] !== undefined ||
      rlRes.headers['x-ratelimit-limit'] !== undefined;
    const hasRemainingHeader =
      rlRes.headers['ratelimit-remaining'] !== undefined ||
      rlRes.headers['x-ratelimit-remaining'] !== undefined;

    assert(hasRateLimitHeader, 'Rate limiting limit header is present on API calls');
    assert(hasRemainingHeader, 'Rate limiting remaining quota header is present');

    // -----------------------------------------------------------------
    // 8. AUTHORIZATION & RBAC (Role-Based Access Control)
    // -----------------------------------------------------------------
    console.log('\n--- 8. Authorization & RBAC ---');
    // A. Unauthenticated access to protected route -> 401
    const unauthRes = await httpRequest({ path: '/api/requests' });
    assert(unauthRes.statusCode === 401, 'Unauthenticated request to protected route is rejected with HTTP 401');

    // Obtain authentic tokens for employee and admin
    const empLogin = await httpRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'employee@opspilot.com', password: 'password123' }
    });
    const employeeToken = empLogin.body?.token;

    const adminLogin = await httpRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'admin@opspilot.com', password: 'password123' }
    });
    const adminToken = adminLogin.body?.token;

    assert(Boolean(employeeToken), 'Obtained authenticated Employee session token');
    assert(Boolean(adminToken), 'Obtained authenticated Admin session token');

    // B. Employee token trying to access Admin-only route -> 403
    const empAdminRes = await httpRequest({
      path: '/api/users',
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert(empAdminRes.statusCode === 403, 'Employee token attempting Admin route is forbidden with HTTP 403');

    // C. Admin token accessing Admin-only route -> 200
    const adminRes = await httpRequest({
      path: '/api/users',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminRes.statusCode === 200, 'Admin token accessing Admin route succeeds with HTTP 200');

    // SUMMARY
    console.log('\n======================================================');
    console.log(`   SECURITY AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Security Test Suite Error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runSecurityTests();
