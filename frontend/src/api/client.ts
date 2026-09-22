import axios, { AxiosError } from 'axios';

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envUrl) {
    return 'http://localhost:8080/api/v1';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }
  if (cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/v1`;
  }
  return `${cleanUrl}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dlms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error messages uniformly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network Error: Cannot connect to server. If the backend is waking up from sleep, please wait 30 seconds and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Clear token on 401 and redirect to login if not already there
      localStorage.removeItem('dlms_token');
      localStorage.removeItem('dlms_user');
    }

    return Promise.reject(new Error(errorMessage));
  }
);

