import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + "/admin";

export const registerAdmin = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/register`, data);
  return response.data;
};

export const loginAdmin = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/login`, data);
  return response.data;
};

export const getAdminProfile = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAdminProfile = async (token, data) => {
  const response = await axios.put(`${API_BASE_URL}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};