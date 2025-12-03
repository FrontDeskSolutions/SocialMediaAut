
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const getGenerations = async () => {
  const res = await api.get('/generations/');
  return res.data;
};

export const getGeneration = async (id) => {
  const res = await api.get(`/generations/${id}`);
  return res.data;
};

export const updateGeneration = async (id, data) => {
  const res = await api.put(`/generations/${id}`, data);
  return res.data;
};

export const generateImage = async (genId, slideId) => {
  const res = await api.post(`/generations/${genId}/generate-image/${slideId}`);
  return res.data;
};

export const triggerGeneration = async (topic, slideCount = 5, context = "") => {
  const res = await api.post('/webhooks/trigger', { 
    topic, 
    slide_count: slideCount,
    extra_context: context 
  });
  return res.data;
};
