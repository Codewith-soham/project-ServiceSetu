import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../services/apiClient.js';

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
  isAuthenticating: boolean;
  login: (
    email: string,
    password: string,
    onSuccess?: (role: UserRole) => void
  ) => Promise<void>;
  signup: (userData: any, options?: { traceId?: string }) => Promise<any>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ApiProfileUser = {
  _id?: string;
  id?: string;
  fullname?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
};

function toAuthUserFromProfile(doc: ApiProfileUser | null | undefined): AuthUser | null {
  if (!doc) return null;
  const id = String(doc._id ?? doc.id ?? '');
  if (!id) return null;
  const roleRaw = doc.role;
  const role: UserRole =
    roleRaw === 'provider' ? 'provider' : roleRaw === 'user' ? 'user' : null;
  return {
    id,
    name: doc.fullname ?? '',
    email: doc.email ?? '',
    role,
    phone: doc.phone,
    location: doc.address,
  };
}

function toAuthUserFromLoginPayload(user: {
  id: string;
  email: string;
  fullname: string;
  role: string;
}): AuthUser {
  const role: UserRole =
    user.role === 'provider' ? 'provider' : user.role === 'user' ? 'user' : null;
  return {
    id: String(user.id),
    name: user.fullname,
    email: user.email,
    role,
  };
}

function deriveUsernameFromSignupForm(userData: {
  email?: string;
  name?: string;
}): string {
  const fromEmail = userData.email?.split('@')[0]?.trim();
  if (fromEmail && fromEmail.length > 0) {
    return fromEmail.toLowerCase();
  }
  const fromName = userData.name
    ?.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '');
  if (fromName && fromName.length > 0) return fromName;
  return `user_${Date.now()}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('serviceSetu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const didFetchProfileRef = useRef(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticating(false);
    };

    window.addEventListener('servicesetu:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('servicesetu:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (didFetchProfileRef.current) return;
    didFetchProfileRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.getMe();
        if (cancelled) return;
        const next = toAuthUserFromProfile(res.data);
        setUser(next);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsAuthenticating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('serviceSetu_user', JSON.stringify(user));
      console.debug('[auth] localStorage sync', { id: user.id, role: user.role });
    } else {
      localStorage.removeItem('serviceSetu_user');
      console.debug('[auth] localStorage cleared');
    }
  }, [user]);

  useEffect(() => {
    console.debug('[auth] user state changed', {
      id: user?.id ?? null,
      role: user?.role ?? null,
      isAuthenticated: !!user,
    });
  }, [user]);

  const login = async (
    email: string,
    password: string,
    onSuccess?: (role: UserRole) => void
  ) => {
    console.info('[auth:login] start', { email });
    const res = await authApi.login(email, password);
    const payload = res.data?.user;
    if (!payload) {
      throw new Error(res.message || 'Login failed');
    }
    const nextUser = toAuthUserFromLoginPayload(payload);
    console.info('[auth:login] setUser', { id: nextUser.id, role: nextUser.role });
    setUser(nextUser);
    if (onSuccess) onSuccess(nextUser.role);
  };

  const signup = async (userData: any, options?: { traceId?: string }) => {
    const fullname = userData?.fullname ?? userData?.name ?? '';
    const username = userData?.username ?? deriveUsernameFromSignupForm(userData);
    const email = userData?.email ?? '';
    const password = userData?.password ?? '';
    const phone = userData?.phone ?? '';
    const address = userData?.address ?? userData?.location ?? '';

    console.info('[auth:signup] start', {
      fullname,
      username,
      email,
      phone,
      address,
    });

    const res = await authApi.register(fullname, username, email, password, phone, address, options);
    
    // Extract user payload from register response (same shape as login response)
    const payload = res.data?.user;
    if (!payload) {
      throw new Error(res.message || 'Registration failed');
    }
    const nextUser = toAuthUserFromLoginPayload(payload);
    console.info('[auth:signup] setUser', { id: nextUser.id, role: nextUser.role });
    setUser(nextUser);
    
    return res;
  };

  const logout = () => {
    authApi.logout().finally(() => {
      setUser(null);
    });
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      console.debug('[auth:updateProfile] before', {
        id: current.id,
        currentRole: current.role,
        nextRole: data.role ?? current.role,
      });
      return { ...current, ...data };
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticating,
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
