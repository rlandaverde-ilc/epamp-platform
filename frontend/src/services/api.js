import axios from 'axios';

const API_URL = 'https://epamp-platform.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
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

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Users
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getStudents = (params) => api.get('/users/students', { params });
export const getTeachers = () => api.get('/users/teachers');
export const getParents = () => api.get('/users/parents');
export const togglePayment = (id) => api.put(`/users/${id}/payment`);

// Levels
export const getLevels = (params) => api.get('/levels', { params });
export const getLevel = (id) => api.get(`/levels/${id}`);
export const createLevel = (levelData) => api.post('/levels', levelData);
export const updateLevel = (id, levelData) => api.put(`/levels/${id}`, levelData);
export const deleteLevel = (id) => api.delete(`/levels/${id}`);

// Grades
export const getGrades = (params) => api.get('/grades', { params });
export const getStudentGrades = (id) => api.get(`/grades/student/${id}`);
export const getStudentAverage = (id) => api.get(`/grades/average/${id}`);
export const createGrade = (gradeData) => api.post('/grades', gradeData);
export const updateGrade = (id, gradeData) => api.put(`/grades/${id}`, gradeData);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params });
export const getStudentAttendance = (id) => api.get(`/attendance/student/${id}`);
export const recordAttendance = (data) => api.post('/attendance', data);
export const bulkRecordAttendance = (data) => api.post('/attendance/bulk', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Certificates
export const getCertificates = (params) => api.get('/certificates', { params });
export const getStudentCertificates = (id) => api.get(`/certificates/student/${id}`);
export const requestCertificate = (data) => api.post('/certificates', data);
export const approveCertificate = (id) => api.put(`/certificates/${id}/approve`);
export const downloadCertificate = (id) => api.get(`/certificates/${id}/download`);

// Reports
export const generateStudentReport = (id) => api.get(`/reports/student/${id}`, { responseType: 'blob' });
export const getOverviewStats = () => api.get('/reports/overview');
export const getGradeStats = () => api.get('/reports/grades');
export const getAttendanceStats = () => api.get('/reports/attendance');

export default api;
