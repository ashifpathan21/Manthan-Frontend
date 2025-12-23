import axios from 'axios';

// const API_BASE_URL = '';
//@ts-ignore
const API_BASE_URL = import.meta.env.VITE_BASE_URL

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
  create: (data: { title: string; description: string; skillRequired: string[]; experienceRequired: number; vacancies: number }) =>
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
  update: (id: string, data: { title: string }) => api.put(`/folder/${id}`, data),
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
    priority: { skills: number; experience: number; projects: number, location: number, qualifications: number };
  }) => api.post('/report', data),
  getAll: () => api.get('/report'),
  getById: (id: string) => api.get(`/report/${id}`),
  delete: (id: string) => api.delete(`/report/${id}`)
};

// Applicant endpoints
export const applicantAPI = {
  // Get full applicant profile (optional but recommended)
  getById: (id: string) =>
    api.get(`/applicant/${id}`),

  // Verify applicant socials & skills
  verifyById: (id: string) =>
    api.post(`/applicant/${id}`),
};

// Project endpoints
export const projectAPI = {
  analyse: (url: string) =>
    api.post('/applicant/project/analyse', { url }),
};

export default api;
