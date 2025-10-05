// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://asc-agent.onrender.com';

export const API_ENDPOINTS = {
  createHackathon: `${API_BASE_URL}/api/hackathons/create`,
  getHackathons: `${API_BASE_URL}/api/hackathons`,
  verifyHackathon: `${API_BASE_URL}/api/hackathons/verify`,
  submit: `${API_BASE_URL}/submit`,
  getDashboard: (hackathonId: string) => `${API_BASE_URL}/api/dashboard/${hackathonId}`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;