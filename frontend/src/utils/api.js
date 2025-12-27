import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request');
        case 404:
          throw new Error(data.message || 'Resource not found');
        case 500:
          throw new Error(data.message || 'Server error');
        default:
          throw new Error(data.message || `HTTP ${status} error`);
      }
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const assignmentAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  getByDifficulty: async (difficulty) => {
    const response = await api.get(`/assignments/difficulty/${difficulty}`);
    return response.data;
  },

  getSampleData: async (id) => {
    const response = await api.get(`/assignments/${id}/sample-data`);
    return response.data;
  },
};

export const queryAPI = {
  execute: async (queryData) => {
    const response = await api.post('/queries/execute', queryData);
    return response.data;
  },

  validate: async (query) => {
    const response = await api.post('/queries/validate', { query });
    return response.data;
  },
};

export const hintAPI = {
  generate: async (hintData) => {
    const response = await api.post('/hints/generate', hintData);
    return response.data;
  },

  getPredefined: async (assignmentId) => {
    const response = await api.get(`/hints/predefined/${assignmentId}`);
    return response.data;
  },

  getFeedback: async (feedbackData) => {
    const response = await api.post('/hints/feedback', feedbackData);
    return response.data;
  },
};

export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;