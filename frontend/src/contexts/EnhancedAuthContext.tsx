import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 
  | 'system_administrator'
  | 'shipper' 
  | 'carrier'
  | 'driver'
  | 'dispatcher'
  | 'customer_service'
  | 'finance';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  company?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    features: string[];
    expiresAt?: Date;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  role: UserRole;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  requiresVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  refreshToken: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions configuration
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  system_administrator: [
    { resource: '*', actions: ['create', 'read', 'update', 'delete', 'manage'] }
  ],
  shipper: [
    { resource: 'shipments', actions: ['create', 'read', 'update'] },
    { resource: 'quotes', actions: ['create', 'read'] },
    { resource: 'tracking', actions: ['read'] },
    { resource: 'invoices', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  carrier: [
    { resource: 'shipments', actions: ['read', 'update'] },
    { resource: 'routes', actions: ['create', 'read', 'update'] },
    { resource: 'vehicles', actions: ['create', 'read', 'update'] },
    { resource: 'drivers', actions: ['create', 'read', 'update'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  driver: [
    { resource: 'shipments', actions: ['read', 'update'] },
    { resource: 'routes', actions: ['read'] },
    { resource: 'tracking', actions: ['update'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  dispatcher: [
    { resource: 'shipments', actions: ['create', 'read', 'update'] },
    { resource: 'routes', actions: ['create', 'read', 'update'] },
    { resource: 'drivers', actions: ['read', 'update'] },
    { resource: 'tracking', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  customer_service: [
    { resource: 'customers', actions: ['read', 'update'] },
    { resource: 'shipments', actions: ['read', 'update'] },
    { resource: 'support', actions: ['create', 'read', 'update'] },
    { resource: 'tracking', actions: ['read'] }
  ],
  finance: [
    { resource: 'invoices', actions: ['create', 'read', 'update'] },
    { resource: 'payments', actions: ['create', 'read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'reports', actions: ['create', 'read'] }
  ]
};

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@raphtrack.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'system_administrator',
    permissions: ROLE_PERMISSIONS.system_administrator,
    company: 'RaphTrack',
    phone: '+1-555-0001',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: { email: true, push: true, sms: false }
    },
    subscription: {
      plan: 'enterprise',
      features: ['unlimited_shipments', 'advanced_analytics', 'api_access', 'priority_support']
    }
  },
  {
    id: '2',
    email: 'shipper@raphtrack.com',
    firstName: 'John',
    lastName: 'Shipper',
    role: 'shipper',
    permissions: ROLE_PERMISSIONS.shipper,
    company: 'Global Imports Inc',
    phone: '+1-555-0002',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: { email: true, push: true, sms: true }
    },
    subscription: {
      plan: 'pro',
      features: ['advanced_tracking', 'bulk_shipments', 'analytics']
    }
  },
  {
    id: '3',
    email: 'carrier@raphtrack.com',
    firstName: 'Sarah',
    lastName: 'Carrier',
    role: 'carrier',
    permissions: ROLE_PERMISSIONS.carrier,
    company: 'Swift Logistics',
    phone: '+1-555-0003',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: { email: true, push: true, sms: false }
    },
    subscription: {
      plan: 'pro',
      features: ['fleet_management', 'route_optimization', 'driver_app']
    }
  },
  {
    id: '4',
    email: 'driver@raphtrack.com',
    firstName: 'Mike',
    lastName: 'Driver',
    role: 'driver',
    permissions: ROLE_PERMISSIONS.driver,
    company: 'Swift Logistics',
    phone: '+1-555-0004',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/Chicago',
      notifications: { email: false, push: true, sms: true }
    },
    subscription: {
      plan: 'free',
      features: ['basic_tracking', 'mobile_app']
    }
  }
];

export const EnhancedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          // Validate token and refresh if needed
          const isValid = await validateToken(token);
          if (isValid) {
            setUser(parsedUser);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // In a real app, validate with backend
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const generateToken = (user: User): string => {
    // In a real app, this would be done by the backend
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    return btoa(JSON.stringify(payload));
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find user by email and role
      const foundUser = MOCK_USERS.find(u => 
        u.email === credentials.email && 
        u.role === credentials.role &&
        u.isActive
      );
      
      if (!foundUser) {
        return {
          success: false,
          error: 'Invalid credentials or user not found'
        };
      }
      
      // In a real app, verify password hash
      if (credentials.password.length < 6) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }
      
      // Update last login
      foundUser.lastLogin = new Date();
      foundUser.updatedAt = new Date();
      
      const token = generateToken(foundUser);
      
      // Store authentication data
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(foundUser));
      } else {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_data', JSON.stringify(foundUser));
      }
      
      setUser(foundUser);
      
      return {
        success: true,
        user: foundUser,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }
      
      // Create new user
      const newUser: User = {
        id: (MOCK_USERS.length + 1).toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        permissions: ROLE_PERMISSIONS[data.role],
        company: data.company,
        phone: data.phone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: { email: true, push: true, sms: false }
        },
        subscription: {
          plan: 'free',
          features: ['basic_tracking']
        }
      };
      
      MOCK_USERS.push(newUser);
      
      const token = generateToken(newUser);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      
      setUser(newUser);
      
      return {
        success: true,
        user: newUser,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
  };

  const updateProfile = async (data: Partial<User>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<AuthResponse> => {
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }
    
    return { success: true };
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    return user.permissions.some(permission => {
      if (permission.resource === '*') return true;
      if (permission.resource === resource) {
        return permission.actions.includes(action as any);
      }
      return false;
    });
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const newToken = generateToken(user);
      localStorage.setItem('auth_token', newToken);
      return true;
    } catch {
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userExists = MOCK_USERS.some(u => u.email === email);
    if (!userExists) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    refreshToken,
    verifyEmail,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};
