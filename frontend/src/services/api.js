import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // System Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Auth & Users
  getUsers: async () => {
    const res = await apiClient.get('/auth/users');
    return res.data;
  },
  registerUser: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  // Incident Tickets
  getTickets: async (params = {}) => {
    const res = await apiClient.get('/tickets/', { params });
    return res.data;
  },
  getTicketDetail: async (ticketId) => {
    const res = await apiClient.get(`/tickets/${ticketId}`);
    return res.data;
  },
  createTicket: async (ticketData) => {
    const res = await apiClient.post('/tickets/', ticketData);
    return res.data;
  },
  updateTicketStatus: async (ticketId, statusData) => {
    const res = await apiClient.patch(`/tickets/${ticketId}/status`, statusData);
    return res.data;
  },

  // Self-Healing Auto-Remediation
  getRunbooks: async () => {
    const res = await apiClient.get('/remediation/runbooks');
    return res.data;
  },
  triggerRemediation: async (ticketId, runbookId = null) => {
    const res = await apiClient.post(`/tickets/${ticketId}/remediate`, { runbook_id: runbookId });
    return res.data;
  },
};
