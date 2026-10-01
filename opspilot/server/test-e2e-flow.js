/**
 * OpsPilot End-to-End Enterprise Flow Verification Suite (Criterion 4.11)
 * Tests the complete operational lifecycle:
 * REGISTER → LOGIN → DASHBOARD → NEW REQUEST → AI TRIAGE → INSTANT ANSWER
 * → AGENT QUEUE → REQUEST DETAIL → AI DRAFT → AGENT RESPONSE → RESOLVE
 * → ANALYTICS → AI INSIGHTS
 */

import http from 'http';
import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/utils/seed.js';

let server;
const TEST_PORT = 5099;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// HTTP Client Helper
const apiCall = ({ method = 'GET', path, token = null, body = null }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {};
    let postData = null;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers
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

const runE2EJourney = async () => {
  console.log('\n======================================================');
  console.log('   🚀 OPSPOLOT CRITERION 4.11 END-TO-END FLOW TEST    ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, stage, details = '') => {
    if (condition) {
      console.log(`  ✓ [PASS] [STAGE: ${stage}] ${details}`);
      passed++;
    } else {
      console.error(`  ✕ [FAIL] [STAGE: ${stage}] ${details}`);
      failed++;
    }
  };

  try {
    // 0. Initialize Backend and Start Server
    await connectDB();
    await seedDatabase();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`  ⚡ Server listening on ${BASE_URL}\n`);
        resolve();
      });
    });

    const timestamp = Date.now();
    const employeeEmail = `e2e_user_${timestamp}@opspilot.com`;
    const employeePassword = 'password123';
    let employeeToken = null;
    let agentToken = null;
    let adminToken = null;
    let createdRequestId = null;
    let aiDraftText = null;

    // -----------------------------------------------------------------
    // STAGE 1: REGISTER
    // -----------------------------------------------------------------
    console.log('--- 1. REGISTER ---');
    const registerRes = await apiCall({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Alex Rivera',
        email: employeeEmail,
        password: employeePassword,
        role: 'employee',
        department: 'Engineering'
      }
    });
    assert(registerRes.statusCode === 201, 'REGISTER', `Status 201 created. Got: ${registerRes.statusCode}`);
    assert(registerRes.body?.token !== undefined, 'REGISTER', 'Session token returned on registration');

    // -----------------------------------------------------------------
    // STAGE 2: LOGIN
    // -----------------------------------------------------------------
    console.log('\n--- 2. LOGIN ---');
    const loginRes = await apiCall({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: employeeEmail,
        password: employeePassword
      }
    });
    assert(loginRes.statusCode === 200, 'LOGIN', `Status 200 ok. Got: ${loginRes.statusCode}`);
    employeeToken = loginRes.body?.token;
    assert(Boolean(employeeToken), 'LOGIN', 'Authenticated JWT token received for employee');

    // -----------------------------------------------------------------
    // STAGE 3: DASHBOARD
    // -----------------------------------------------------------------
    console.log('\n--- 3. DASHBOARD ---');
    const dashboardRes = await apiCall({
      method: 'GET',
      path: '/api/requests/my',
      token: employeeToken
    });
    assert(dashboardRes.statusCode === 200, 'DASHBOARD', `Employee requests loaded with status 200`);
    assert(Array.isArray(dashboardRes.body?.requests), 'DASHBOARD', 'Requests list array present in dashboard');

    // -----------------------------------------------------------------
    // STAGE 4: NEW REQUEST
    // -----------------------------------------------------------------
    console.log('\n--- 4. NEW REQUEST ---');
    const newReqRes = await apiCall({
      method: 'POST',
      path: '/api/requests',
      token: employeeToken,
      body: {
        title: "My VPN isn't working and dropping connections",
        description: 'Unable to connect to internal GitHub and Jira repositories from home Wi-Fi using GlobalProtect VPN.',
        department: 'IT',
        priority: 'high'
      }
    });
    assert(newReqRes.statusCode === 201, 'NEW REQUEST', `Inquiry successfully created with HTTP 201`);
    const createdReq = newReqRes.body?.request || newReqRes.body;
    createdRequestId = createdReq._id || createdReq.id;
    assert(Boolean(createdRequestId), 'NEW REQUEST', `Generated request ID: ${createdRequestId}`);

    // -----------------------------------------------------------------
    // STAGE 5: AI TRIAGE
    // -----------------------------------------------------------------
    console.log('\n--- 5. AI TRIAGE ---');
    const triageRes = await apiCall({
      method: 'POST',
      path: '/api/ai/triage',
      token: employeeToken,
      body: {
        title: "My VPN isn't working and dropping connections",
        description: 'Unable to connect to internal GitHub and Jira repositories from home Wi-Fi using GlobalProtect VPN.'
      }
    });
    assert(triageRes.statusCode === 200, 'AI TRIAGE', `AI Smart Triage executed successfully`);
    const triage = triageRes.body?.triage || triageRes.body;
    assert(triage.department === 'IT', 'AI TRIAGE', `Auto-classified department: ${triage.department}`);
    assert(Boolean(triage.priority), 'AI TRIAGE', `Assigned priority: ${triage.priority}`);
    assert(Boolean(triage.category), 'AI TRIAGE', `Assigned category: ${triage.category}`);
    assert(Boolean(triage.summary), 'AI TRIAGE', `Generated executive summary: "${triage.summary?.slice(0, 45)}..."`);

    // -----------------------------------------------------------------
    // STAGE 6: INSTANT ANSWER / RAG
    // -----------------------------------------------------------------
    console.log('\n--- 6. INSTANT ANSWER / RAG ---');
    const instantRes = await apiCall({
      method: 'POST',
      path: '/api/ai/instant-answer',
      token: employeeToken,
      body: {
        query: 'How to connect and fix GlobalProtect VPN issues'
      }
    });
    assert(instantRes.statusCode === 200, 'INSTANT ANSWER', `Instant answer endpoint executed with HTTP 200`);
    const hasAnswer = Boolean(instantRes.body?.answer);
    assert(hasAnswer, 'INSTANT ANSWER', `Generated answer: "${instantRes.body?.answer?.slice(0, 50)}..."`);
    assert(typeof instantRes.body?.confidence === 'number', 'INSTANT ANSWER', `Confidence score: ${instantRes.body?.confidence}`);

    // -----------------------------------------------------------------
    // STAGE 7: AGENT QUEUE
    // -----------------------------------------------------------------
    console.log('\n--- 7. AGENT QUEUE ---');
    const agentLoginRes = await apiCall({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'agent@opspilot.com', password: 'password123' }
    });
    agentToken = agentLoginRes.body?.token;
    assert(Boolean(agentToken), 'AGENT QUEUE', 'Support agent logged in successfully');

    const queueRes = await apiCall({
      method: 'GET',
      path: '/api/requests?limit=10',
      token: agentToken
    });
    assert(queueRes.statusCode === 200, 'AGENT QUEUE', `Agent queue loaded with HTTP 200`);
    const queueRequests = queueRes.body?.requests || [];
    const foundInQueue = queueRequests.some(r => (r._id || r.id) === createdRequestId);
    assert(foundInQueue, 'AGENT QUEUE', 'Created request is visible in the enterprise agent queue');

    // -----------------------------------------------------------------
    // STAGE 8: REQUEST DETAIL
    // -----------------------------------------------------------------
    console.log('\n--- 8. REQUEST DETAIL ---');
    const detailRes = await apiCall({
      method: 'GET',
      path: `/api/requests/${createdRequestId}`,
      token: agentToken
    });
    assert(detailRes.statusCode === 200, 'REQUEST DETAIL', `Request detail fetched with HTTP 200`);
    const detail = detailRes.body?.request || detailRes.body;
    assert(detail.title.includes('VPN'), 'REQUEST DETAIL', `Title verified: "${detail.title}"`);
    assert(Boolean(detail.slaDeadline), 'REQUEST DETAIL', `SLA Deadline tracked: ${detail.slaDeadline}`);

    // -----------------------------------------------------------------
    // STAGE 9: AI DRAFT
    // -----------------------------------------------------------------
    console.log('\n--- 9. AI DRAFT ---');
    const draftRes = await apiCall({
      method: 'POST',
      path: `/api/requests/${createdRequestId}/draft-reply`,
      token: agentToken
    });
    assert(draftRes.statusCode === 200, 'AI DRAFT', `AI Draft Reply generated with HTTP 200`);
    aiDraftText = draftRes.body?.draft || draftRes.body?.reply;
    assert(Boolean(aiDraftText) && aiDraftText.length > 20, 'AI DRAFT', `Draft content: "${aiDraftText?.slice(0, 60)}..."`);

    // -----------------------------------------------------------------
    // STAGE 10: AGENT RESPONSE
    // -----------------------------------------------------------------
    console.log('\n--- 10. AGENT RESPONSE ---');
    const commentRes = await apiCall({
      method: 'POST',
      path: `/api/comments/${createdRequestId}`,
      token: agentToken,
      body: {
        content: aiDraftText || 'We have reset your VPN session gateway profile. Please reconnect.',
        isInternal: false
      }
    });
    assert(commentRes.statusCode === 201, 'AGENT RESPONSE', `Agent response comment posted with HTTP 201`);
    assert(commentRes.body?.comment !== undefined || commentRes.body?.content !== undefined, 'AGENT RESPONSE', 'Comment stored in discussion history');

    // -----------------------------------------------------------------
    // STAGE 11: RESOLVE
    // -----------------------------------------------------------------
    console.log('\n--- 11. RESOLVE ---');
    const resolveRes = await apiCall({
      method: 'PATCH',
      path: `/api/requests/${createdRequestId}`,
      token: agentToken,
      body: {
        status: 'resolved'
      }
    });
    assert(resolveRes.statusCode === 200, 'RESOLVE', `Request status updated to resolved with HTTP 200`);
    const resolvedReq = resolveRes.body?.request || resolveRes.body;
    assert(resolvedReq.status === 'resolved', 'RESOLVE', `Verified request status: '${resolvedReq.status}'`);
    assert(Boolean(resolvedReq.resolvedAt), 'RESOLVE', `Resolved timestamp logged: ${resolvedReq.resolvedAt}`);

    // -----------------------------------------------------------------
    // STAGE 12: ANALYTICS
    // -----------------------------------------------------------------
    console.log('\n--- 12. ANALYTICS ---');
    const adminLoginRes = await apiCall({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'admin@opspilot.com', password: 'password123' }
    });
    adminToken = adminLoginRes.body?.token;
    assert(Boolean(adminToken), 'ANALYTICS', 'Admin authentication session established');

    const analyticsRes = await apiCall({
      method: 'GET',
      path: '/api/analytics',
      token: adminToken
    });
    assert(analyticsRes.statusCode === 200, 'ANALYTICS', `Enterprise operations analytics loaded with HTTP 200`);
    const summary = analyticsRes.body?.summary || {};
    assert(typeof summary.totalRequests === 'number' && summary.totalRequests > 0, 'ANALYTICS', `Total Requests: ${summary.totalRequests}`);
    assert(typeof summary.resolvedCount === 'number' && summary.resolvedCount >= 1, 'ANALYTICS', `Resolved Requests: ${summary.resolvedCount}`);

    // -----------------------------------------------------------------
    // STAGE 13: AI INSIGHTS
    // -----------------------------------------------------------------
    console.log('\n--- 13. AI INSIGHTS ---');
    const insightsRes = await apiCall({
      method: 'GET',
      path: '/api/ai/manager-insights',
      token: adminToken
    });
    assert(insightsRes.statusCode === 200, 'AI INSIGHTS', `Executive AI manager insights retrieved with HTTP 200`);
    const insightsList = insightsRes.body?.insights || [];
    const recommendationsList = insightsRes.body?.recommendations || [];
    assert(Array.isArray(insightsList) && insightsList.length >= 2, 'AI INSIGHTS', `Generated ${insightsList.length} strategic executive insights`);
    assert(Array.isArray(recommendationsList) && recommendationsList.length >= 1, 'AI INSIGHTS', `Generated ${recommendationsList.length} operational recommendations`);

    const gapsRes = await apiCall({
      method: 'GET',
      path: '/api/ai/knowledge-gaps',
      token: adminToken
    });
    assert(gapsRes.statusCode === 200, 'AI INSIGHTS', `Knowledge gap synthesis retrieved with HTTP 200`);
    assert(Array.isArray(gapsRes.body?.gaps), 'AI INSIGHTS', `Detected recurring knowledge gaps: ${gapsRes.body?.gaps?.length || 0}`);

    // -----------------------------------------------------------------
    // SUMMARY REPORT
    // -----------------------------------------------------------------
    console.log('\n======================================================');
    console.log(`   END-TO-END CHAIN COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log('======================================================\n');

    if (failed === 0) {
      console.log('🎉 ALL 13 PHASES OF THE JOURNEY VERIFIED SUCCESSFULLY:');
      console.log('   REGISTER → LOGIN → DASHBOARD → NEW REQUEST → AI TRIAGE');
      console.log('   → INSTANT ANSWER → AGENT QUEUE → REQUEST DETAIL');
      console.log('   → AI DRAFT → AGENT RESPONSE → RESOLVE → ANALYTICS');
      console.log('   → AI INSIGHTS');
    }

  } catch (err) {
    console.error('Fatal E2E Test Suite Error:', err);
    failed++;
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runE2EJourney();
