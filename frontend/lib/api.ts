const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (data: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getCurrentUser: async (token: string) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  // Employees
  getEmployees: async (token: string) => {
    const res = await fetch(`${API_URL}/api/employees`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  getEmployee: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  createEmployee: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/api/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateEmployee: async (token: string, id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteEmployee: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  // Salary Slips
  getSalarySlips: async (token: string, params?: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/salary-slips?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  createSalarySlip: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/api/salary-slips`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  downloadSalarySlipPDF: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/api/salary-slips/${id}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.blob();
  },

  // Payments
  getPayments: async (token: string, params?: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/payments?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  // Dashboard
    getDashboardStats: async (token: string) => {
      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return res.json();
    },

    
};