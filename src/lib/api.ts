import axios from 'axios';

const API_BASE_URL = 'https://smarthire-backend-y1sr.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data: { username: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
};



// Job endpoints
export const jobAPI = {
  create: (data: { title: string; description: string; skills: string[]; experience: number; vacancies: number }) =>
    api.post('/job', data),
  getAll: () => api.get('/job'),
  update: (id: string, data: any) => api.put(`/job/${id}`, data),
  delete: (id: string) => api.delete(`/job/${id}`),
};

// Folder endpoints
export const folderAPI = {
  create: (data: { title: string; }) =>
    api.post('/folder', data),
  getAll: () => api.get('/folder'),
  getById: (id: string) => api.get(`/folder/${id}`),
  delete: (id: string) => api.delete(`/folder/${id}`),
};

// Resume endpoints
export const resumeAPI = {
  upload: (folderId: string, files: FormData) =>
    api.post(`/resume/upload/${folderId}`, files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/resume/${id}`),
};

// Report endpoints
export const reportAPI = {
  create: (data: {
    jobId: string;
    folderId: string;
    priorities: { skills: number; experience: number; projects: number, location: number, qualifications: number };
  }) => api.post('/report', data),
  getAll: () => api.get('/report'),
  getById: (id: string) => api.get(`/report/${id}`),
  getApplicants: (id: string) => api.get(`/report/${id}/applicants`),
};

// Applicant endpoints
export const applicantAPI = {
  // Get full applicant profile (optional but recommended)
  getById: (id: string) =>
    api.get(`/applicant/${id}`),

  // Verify applicant socials & skills
  verifyById: (id: string) =>
    api.post(`/applicant/verify/${id}`),
};

// Project endpoints
export const projectAPI = {
  analyse: (url: string) =>
    api.post('/project/analyse', { url }),
};

export default api;
