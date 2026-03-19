import axios from 'axios';
import { API_BASE_URL, PYTHON_API_URL } from '../config/api';

export const nodeApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

export const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Node API Error:', error.message);
    return Promise.reject(error);
  }
);

pythonApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Python API Error:', error.message);
    return Promise.reject(error);
  }
);
