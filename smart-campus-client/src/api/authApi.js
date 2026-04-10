import api from './axiosInstance';

export const forgotPassword  = (email)          =>
  api.post('/auth/password/forgot',       { email });

export const verifyResetCode = (email, code)     =>
  api.post('/auth/password/verify-code',  { email, code });

export const resetPassword   = (email, code, newPassword) =>
  api.post('/auth/password/reset',        { email, code, newPassword });