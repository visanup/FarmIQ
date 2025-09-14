import { apiClient } from '../api/client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../types/api';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const payload: LoginRequest = { email, password };
    const res = await apiClient.login(payload);
    return res;
  },

  async signUp(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const payload: RegisterRequest = { email: data.email, password: data.password, name: data.name };
    const res = await apiClient.register(payload);
    return res;
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.getCurrentUser();
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const token = localStorage.getItem('refreshToken');
    if (!token) throw new Error('ไม่พบ refresh token');
    return apiClient.refreshToken(token);
  },

  async signOut(): Promise<void> {
    await apiClient.logout();
  },
};