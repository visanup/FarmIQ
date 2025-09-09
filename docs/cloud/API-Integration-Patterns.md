 ข้อมูล# API Integration Patterns

## Frontend-Backend Communication

### 1. REST API Patterns

#### API Client Setup
```typescript
// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private handleUnauthorized() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient(process.env.REACT_APP_API_BASE_URL || 'http://localhost:7300');
```

#### Service Layer Pattern
```typescript
// services/userService.ts
import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'user' | 'viewer';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export class UserService {
  async getUsers(page = 1, limit = 10, search?: string): Promise<UserListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    return apiClient.get<UserListResponse>(`/users?${params}`);
  }

  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', userData);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }
}

export const userService = new UserService();
```

### 2. Real-time Communication

#### WebSocket Integration
```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url: string;
  events: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventHandlers = useRef<Map<string, Function[]>>(new Map());

  useEffect(() => {
    const newSocket = io(options.url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      options.onConnect?.();
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      options.onDisconnect?.();
    });

    newSocket.on('connect_error', (err) => {
      setError(err);
      options.onError?.(err);
    });

    // Register event listeners
    options.events.forEach((event) => {
      newSocket.on(event, (data) => {
        const handlers = eventHandlers.current.get(event) || [];
        handlers.forEach((handler) => handler(data));
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [options.url]);

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, handler: Function) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, []);
    }
    eventHandlers.current.get(event)!.push(handler);

    return () => {
      const handlers = eventHandlers.current.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  };

  return {
    socket,
    isConnected,
    error,
    emit,
    on,
  };
}
```

#### Real-time Data Hook
```typescript
// hooks/useRealtimeData.ts
import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

interface SensorData {
  id: string;
  deviceId: string;
  value: number;
  unit: string;
  timestamp: string;
  type: 'temperature' | 'humidity' | 'weight' | 'pressure';
}

export function useRealtimeSensorData(deviceId?: string) {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { on, isConnected } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:7303',
    events: ['sensor_data', 'device_status'],
  });

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on('sensor_data', (newData: SensorData) => {
      if (!deviceId || newData.deviceId === deviceId) {
        setData((prev) => {
          const filtered = prev.filter((item) => item.id !== newData.id);
          return [...filtered, newData].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [isConnected, deviceId, on]);

  return { data, isLoading, isConnected };
}
```

### 3. State Management Patterns

#### Context API Pattern
```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userService, User } from '../services/userService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      userService.getCurrentUser()
        .then((user) => {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          dispatch({ type: 'AUTH_LOGOUT' });
        });
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await userService.login(email, password);
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Custom Hooks for Data Fetching
```typescript
// hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    initialData = null,
    immediate = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: execute,
    mutate,
  };
}

// Usage example
export function useUsers(page = 1, limit = 10) {
  return useApi(
    () => userService.getUsers(page, limit),
    {
      immediate: true,
      onError: (error) => console.error('Failed to fetch users:', error),
    }
  );
}
```

### 4. Error Handling Patterns

#### Global Error Handler
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send error to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new ApiError(
      data.message || 'An error occurred',
      status,
      data.code
    );
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiError(
      'Network error - please check your connection',
      0,
      'NETWORK_ERROR'
    );
  } else {
    // Something else happened
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
}
```

### 5. Form Handling Patterns

#### Form Hook with Validation
```typescript
// hooks/useForm.ts
import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    isValid: false,
  });

  const validate = useCallback((values: T) => {
    try {
      validationSchema.parse(values);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof T] = err.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: {} };
    }
  }, [validationSchema]);

  const setValue = useCallback((field: keyof T, value: any) => {
    const newValues = { ...state.values, [field]: value };
    const { isValid, errors } = validate(newValues);
    
    setState(prev => ({
      ...prev,
      values: newValues,
      errors,
      isValid,
    }));
  }, [state.values, validate]);

  const setError = useCallback((field: keyof T, message: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { isValid, errors } = validate(state.values);
    if (!isValid) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    
    try {
      await onSubmit(state.values);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        errors: { general: error.message },
      }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate, onSubmit]);

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
  };
}
```

### 6. Caching Patterns

#### React Query Integration
```typescript
// hooks/useQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User } from '../services/userService';

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userList: (page: number, limit: number, search?: string) => 
    ['users', 'list', page, limit, search] as const,
};

// Users list query
export function useUsers(page = 1, limit = 10, search?: string) {
  return useQuery({
    queryKey: queryKeys.userList(page, limit, search),
    queryFn: () => userService.getUsers(page, limit, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Single user query
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      // Add new user to cache
      queryClient.setQueryData(queryKeys.user(newUser.id), newUser);
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(updatedUser.id), updatedUser);
      
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.user(deletedId) });
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
```

These patterns provide a comprehensive foundation for building robust frontend-backend integrations in the FarmIQ Cloud-Layer architecture.
