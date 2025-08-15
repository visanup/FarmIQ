// src/utils/api/auth.ts

const AUTH_URL = process.env.REACT_APP_AUTH_URL || '';

type SignupPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = {
  username: string;
  password: string;
};

export type ProfileData = {
  userId: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

export const authApi = {
  signup: async (data: SignupPayload) => {
    const response = await fetch(`${AUTH_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Signup failed');
    }
    return response.json();
  },

  login: async (data: LoginPayload) => {
    const response = await fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }

    const result = await response.json();

    if (result.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    if (result.userId) {
      localStorage.setItem('userId', result.userId.toString());
    }

    return result;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  },
  me: async (): Promise<ProfileData> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    const response = await fetch(`${AUTH_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch profile');
    }
    return response.json();
  },
};

