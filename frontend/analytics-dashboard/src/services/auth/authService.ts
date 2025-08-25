import { apiClient } from '../api/client';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface SignInRequest {
  username: string;
  password: string;
}

interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Mock authentication service for demonstration
const DEMO_MODE = true; // Set to false when backend is available

const mockUsers = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@farmiq.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
  },
];

const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

export const authService = {
  async signIn(username: string, password: string): Promise<AuthResponse> {
    await simulateNetworkDelay();
    
    if (DEMO_MODE) {
      // Demo mode - accept demo/demo credentials
      if (username === 'demo' && password === 'demo') {
        const user = mockUsers[0];
        return {
          user,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
      } else {
        throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ใช้ demo/demo)');
      }
    }
    
    try {
      const response = await apiClient.post('/auth/signin', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
      throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  },

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    await simulateNetworkDelay();
    
    if (DEMO_MODE) {
      // Demo mode - simulate successful signup
      const newUser = {
        id: String(mockUsers.length + 1),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: 'user',
      };
      
      mockUsers.push(newUser);
      
      return {
        user: newUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
    }
    
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('ชื่อผู้ใช้หรืออีเมลนี้มีการใช้งานแล้ว');
      }
      throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  },

  async getCurrentUser(): Promise<User> {
    await simulateNetworkDelay();
    
    if (DEMO_MODE) {
      return mockUsers[0]; // Return demo user
    }
    
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    await simulateNetworkDelay();
    
    if (DEMO_MODE) {
      return {
        accessToken: 'mock-access-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
      };
    }
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('ไม่พบ refresh token');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'ไม่สามารถต่ออายุโทเค็นได้');
    }
  },

  async signOut(): Promise<void> {
    if (DEMO_MODE) {
      // In demo mode, just clear local storage
      return;
    }
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/signout', { refreshToken });
      }
    } catch (error) {
      // Ignore errors during signout
      console.warn('Error during signout:', error);
    }
  },
};