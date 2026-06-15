// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zenith-banking-management.onrender.com';
// const API_URL = `${API_BASE_URL}/api`;

// export const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Keep Authorization as a fallback for browsers/environments that reject cross-site cookies.
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle responses
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth API calls
// export const authAPI = {
//   register: (data) => api.post('/auth/register', data),
//   login: (data) => api.post('/auth/login', data),
//   logout: () => api.post('/auth/logout'),
// };

// // Account API calls
// export const accountAPI = {
//   createAccount: () => api.post('/accounts'),
//   getUserAccounts: () => api.get('/accounts'),
//   getAccountBalance: (accountId) => api.get(`/accounts/balance/${accountId}`),
// };

// // Transaction API calls
// export const transactionAPI = {
//   createTransaction: (data) => api.post('/transactions', data),
//   createInitialFunds: (data) => api.post('/transactions/system/initial-funds', data),
// };

// export default api;


import axios from 'axios';

// VITE_API_URL points to the server root (e.g. https://zenith-banking-management.onrender.com)
// We append /api once here so every service call is relative to that.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zenith-banking-management.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
};

// ── Accounts ────────────────────────────────────────────────────────────────
export const accountAPI = {
  createAccount:     ()           => api.post('/accounts'),
  getUserAccounts:   ()           => api.get('/accounts'),
  getAccountBalance: (accountId)  => api.get(`/accounts/balance/${accountId}`),
  // Search other users' accounts by name (≥3 chars) or exact email
  searchAccounts:    (query)      => api.get('/accounts/search', { params: { query } }),
};

// ── Transactions ─────────────────────────────────────────────────────────────

export const transactionAPI = {
  createTransaction: (data) => api.post('/transactions', data),
  createInitialFunds: (data) => api.post('/transactions/system/initial-funds', data),
  createSystemSend: (data) => api.post('/transactions/system/send', data), // add
};

export default api;