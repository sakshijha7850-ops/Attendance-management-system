import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo?.token) {
          config.headers.Authorization = `Bearer ${parsedInfo.token}`;
        }
      } catch {
        // ignore invalid localStorage content
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
