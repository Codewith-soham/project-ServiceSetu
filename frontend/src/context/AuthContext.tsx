import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'user' | 'provider' | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  serviceType?: string;
  experience?: string;
  pricing?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (userData: any, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('serviceSetu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('serviceSetu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('serviceSetu_user');
    }
  }, [user]);

  const login = async (email: string, _password: string, role: UserRole) => {
    // Simulate API call
    const mockUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'user' ? 'John Doe' : 'Jane Smith',
      email,
      role
    };
    setUser(mockUser);
  };

  const signup = async (userData: any, role: UserRole) => {
    // Simulate API call
    const newUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      role
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
