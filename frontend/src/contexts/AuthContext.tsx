import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  | 'system_administrator'
  | 'shipper' 
  | 'carrier'
  | 'driver'
  | 'dispatcher'
  | 'customer_service'
  | 'finance';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  permissions: string[];
  sessionToken?: string;
  tokenExpiry?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
  rememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  isShipper: boolean;
  isCarrier: boolean;
  isDriver: boolean;
  isDispatcher: boolean;
  isCustomerService: boolean;
  isFinance: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isSessionValid: () => boolean;
  refreshToken: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  role?: UserRole; // Optional role during registration, defaults to shipper
}

// Security utilities
const generateSessionToken = (): string => {
  return btoa(Math.random().toString(36).substr(2) + Date.now().toString(36));
};

const hashPassword = async (password: string): Promise<string> => {
  // In a real app, use bcrypt or similar on the backend
  // This is just for demo purposes
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_shipsmart');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return { isValid: errors.length === 0, errors };
};

const getRolePermissions = (role: UserRole): string[] => {
  const permissions: { [key in UserRole]: string[] } = {
    system_administrator: [
      'admin:full_access', 'user:manage', 'system:configure', 'reports:all',
      'shipments:manage', 'billing:manage', 'analytics:view', 'support:manage'
    ],
    shipper: [
      'shipments:create', 'shipments:view_own', 'tracking:view_own', 
      'quotes:request', 'documents:upload', 'billing:view_own'
    ],
    carrier: [
      'shipments:view_assigned', 'routes:manage', 'vehicles:manage',
      'drivers:manage', 'tracking:update', 'billing:create'
    ],
    driver: [
      'shipments:view_assigned', 'tracking:update_own', 'routes:view_assigned',
      'deliveries:confirm', 'documents:view_assigned'
    ],
    dispatcher: [
      'shipments:assign', 'routes:optimize', 'drivers:assign', 'tracking:monitor',
      'fleet:manage', 'schedules:manage'
    ],
    customer_service: [
      'tickets:manage', 'customers:assist', 'shipments:view_all',
      'tracking:view_all', 'support:provide', 'communications:manage'
    ],
    finance: [
      'billing:manage', 'invoices:create', 'payments:process', 'reports:financial',
      'accounts:manage', 'pricing:manage'
    ]
  };
  
  return permissions[role] || [];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for existing user session and validate token
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if session is still valid
        if (parsedUser.tokenExpiry && new Date(parsedUser.tokenExpiry) > new Date()) {
          return parsedUser;
        } else {
          // Session expired, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('sessionToken');
        }
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
      }
    }
    return null;
  });

  const isAuthenticated = !!user && (user.isActive && user.isEmailVerified);
  const isSystemAdmin = user?.role === 'system_administrator';
  const isShipper = user?.role === 'shipper';
  const isCarrier = user?.role === 'carrier';
  const isDriver = user?.role === 'driver';
  const isDispatcher = user?.role === 'dispatcher';
  const isCustomerService = user?.role === 'customer_service';
  const isFinance = user?.role === 'finance';

  useEffect(() => {
    // Save user to localStorage when user state changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPermission = (permission: string): boolean => {
    return user ? user.permissions.includes(permission) : false;
  };

  const isSessionValid = (): boolean => {
    if (!user || !user.tokenExpiry) return false;
    return new Date(user.tokenExpiry) > new Date();
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Simulate token refresh API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newToken = generateSessionToken();
      const newExpiry = new Date();
      newExpiry.setHours(newExpiry.getHours() + (user.sessionToken ? 24 : 1)); // 24h if remembered, 1h if not
      
      const updatedUser = {
        ...user,
        sessionToken: newToken,
        tokenExpiry: newExpiry.toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('sessionToken', newToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Validate new password
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, verify current password on backend
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update stored user data
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = existingUsers.map((u: User) => 
        u.id === user.id ? { ...u, passwordHash: hashedNewPassword } : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      return { success: false, error: 'Failed to change password. Please try again.' };
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    try {
      const { email, password, role, rememberMe = false } = credentials;
      
      console.log('🔐 AuthContext login called with:', { email, role, rememberMe });
      
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage from previous registration
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = existingUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        console.log('🔍 Found existing user:', { 
          email: existingUser.email, 
          isActive: existingUser.isActive, 
          isEmailVerified: existingUser.isEmailVerified,
          role: existingUser.role 
        });
        
        // Fix any legacy accounts that might not have these properties
        if (existingUser.isActive === undefined) {
          existingUser.isActive = true;
        }
        if (existingUser.isEmailVerified === undefined) {
          existingUser.isEmailVerified = true;
        }
        if (!existingUser.permissions) {
          existingUser.permissions = getRolePermissions(existingUser.role);
        }
        
        // Update the user in storage with fixed properties
        const updatedUsers = existingUsers.map((u: any) => 
          u.email === email ? existingUser : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // Verify password (in real app, this would be done on backend)
        const hashedInputPassword = await hashPassword(password);
        
        if (existingUser.passwordHash && existingUser.passwordHash !== hashedInputPassword) {
          return { success: false, error: 'Invalid email or password' };
        }
        
        // Check if user account is active (should now be true)
        if (existingUser.isActive === false) {
          return { success: false, error: 'Account has been deactivated. Please contact support.' };
        }
        
        // Check if email is verified (should now be true)
        if (!existingUser.isEmailVerified) {
          return { success: false, error: 'Please verify your email address before logging in.', requiresVerification: true };
        }
        
        // Validate role if provided
        if (role && existingUser.role !== role) {
          return { success: false, error: `Invalid role selected. Your account is registered as ${existingUser.role.replace('_', ' ')}. Please select the correct role.` };
        }
        
        // Generate session token
        const sessionToken = generateSessionToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + (rememberMe ? 24 * 7 : 24)); // 7 days if remembered, 24 hours if not
        
        const authenticatedUser: User = {
          ...existingUser,
          lastLogin: new Date().toISOString(),
          sessionToken,
          tokenExpiry: tokenExpiry.toISOString(),
          permissions: getRolePermissions(existingUser.role)
        };
        
        setUser(authenticatedUser);
        localStorage.setItem('sessionToken', sessionToken);
        
        return { success: true };
      } else {
        // User not found in registered users
        return { success: false, error: 'Invalid email or password. Please register a new account to get started.' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    try {
      const { firstName, lastName, email, phone, company, password, role = 'shipper' } = userData;
      
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = existingUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists. Please use a different email or try logging in.' };
      }
      
      // Simulate API call - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate session token
      const sessionToken = generateSessionToken();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours
      
      // Create new user with security features
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        company: company.trim(),
        phone: phone.trim(),
        role: role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isEmailVerified: true, // Auto-verify for demo purposes
        isActive: true,
        permissions: getRolePermissions(role),
        sessionToken,
        tokenExpiry: tokenExpiry.toISOString()
      };
      
      // Store user with hashed password
      const userWithPassword = {
        ...newUser,
        passwordHash: hashedPassword
      };
      
      existingUsers.push(userWithPassword);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      localStorage.setItem('sessionToken', sessionToken);
      
      // Set user in context (without password hash) - auto-login after registration
      setUser(newUser);
      
      console.log(`✅ User registered and logged in: ${email}`);
      
      return { 
        success: true, 
        requiresVerification: false // Auto-login, no verification needed
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      // Simulate API call - replace with actual profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isSystemAdmin,
      isShipper,
      isCarrier,
      isDriver,
      isDispatcher,
      isCustomerService,
      isFinance,
      login,
      logout,
      register,
      updateProfile,
      hasRole,
      hasAnyRole,
      hasPermission,
      isSessionValid,
      refreshToken,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
