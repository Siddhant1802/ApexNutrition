import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For web testing: use localhost
// For mobile testing: use your computer's IP (find with: ipconfig getifaddr en0)
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password, fullName) =>
    api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    }),
  
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  getCurrentUser: () => api.get('/users/me'),
};

export const athleteAPI = {
  createOrUpdateProfile: (profileData) =>
    api.post('/athlete-profile', profileData),
  
  getProfile: () =>
    api.get('/athlete-profile'),
  updateProfile: (profileData) => api.post('/athlete-profile', profileData),
};


// Meals API
export const mealsAPI = {
  // Save a meal
  create: (mealData) => api.post('/meals', mealData),
  
  // Get today's meals
  getToday: () => api.get('/meals/today'),
  
  // Delete a meal
  delete: (mealId) => api.delete(`/meals/${mealId}`),
  
  // Get meals by date
  getByDate: (date) => api.get(`/meals/date/${date}`),

  getWeeklyProgress: () => api.get('/meals/progress/weekly'), 
  getLoggedDates: () => api.get('/meals/logged-dates'), 
};

// Water Tracking API
export const waterAPI = {
  log: (amount_ml) => api.post('/water', { amount_ml }),
  getToday: () => api.get('/water/today'),
  delete: (logId) => api.delete(`/water/${logId}`),
};

export default api;