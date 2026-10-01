const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('opspilot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Request failed');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Requests
  createRequest: (body) => request('/requests', { method: 'POST', body: JSON.stringify(body) }),
  getMyRequests: (params = '') => request(`/requests/my${params ? `?${params}` : ''}`),
  getAllRequests: (params = '') => request(`/requests${params ? `?${params}` : ''}`),
  getRequestById: (id) => request(`/requests/${id}`),
  updateRequest: (id, body) => request(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  assignRequest: (id, body = {}) => request(`/requests/${id}/assign`, { method: 'POST', body: JSON.stringify(body) }),
  generateDraftReply: (id) => request(`/requests/${id}/draft-reply`, { method: 'POST' }),
  summarizeThread: (id) => request(`/requests/${id}/summarize`, { method: 'POST' }),

  // Comments
  getComments: (requestId) => request(`/comments/${requestId}`),
  addComment: (requestId, body) => request(`/comments/${requestId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Knowledge Base
  getArticles: (params = '') => request(`/knowledge${params ? `?${params}` : ''}`),
  getArticleById: (id) => request(`/knowledge/${id}`),
  createArticle: (body) => request('/knowledge', { method: 'POST', body: JSON.stringify(body) }),
  updateArticle: (id, body) => request(`/knowledge/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteArticle: (id) => request(`/knowledge/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // AI Operations Engine (Backend-only Gemini calls: React -> Express -> Controller -> Service -> Gemini)
  aiTriage: (text) => request('/ai/triage', { method: 'POST', body: JSON.stringify({ text }) }),
  aiInstantAnswer: (text, department) => request('/ai/instant-answer', { method: 'POST', body: JSON.stringify({ text, department }) }),
  aiCheckDuplicate: (text, department) => request('/ai/duplicate-check', { method: 'POST', body: JSON.stringify({ text, department }) }),
  aiDraftReply: (requestId) => request('/ai/draft-reply', { method: 'POST', body: JSON.stringify({ requestId }) }),
  aiSummarize: (requestId) => request('/ai/summarize', { method: 'POST', body: JSON.stringify({ requestId }) }),
  aiGetManagerInsights: () => request('/ai/manager-insights'),
  aiGetKnowledgeGaps: () => request('/ai/knowledge-gaps'),
  aiGetLogs: (limit = 20) => request(`/ai/logs?limit=${limit}`),

  // Admin Users
  getUsers: (params = '') => request(`/users${params ? `?${params}` : ''}`),
  updateUserRole: (id, role) => request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
};
