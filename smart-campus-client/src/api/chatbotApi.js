import api from './axiosInstance';

export const sendMessage = (message, history) =>
  api.post('/chatbot/message', { message, history });