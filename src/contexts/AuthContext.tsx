'use client';

import type { User } from '@/lib/types';
import { users } from '@/lib/data';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (userData: Omit<User, 'id' | 'role'> & { role: 'user' | 'landlord' }) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('apartment-spot-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('apartment-spot-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
          const userToStore = { ...foundUser };
          delete userToStore.password;
          setUser(userToStore);
          localStorage.setItem('apartment-spot-user', JSON.stringify(userToStore));
          setLoading(false);
          resolve(userToStore);
        } else {
          setLoading(false);
          resolve(null);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apartment-spot-user');
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    setLoading(true);
     // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `user${users.length + 1}`,
          ...userData,
        };
        // In a real app, you would save this to the database
        users.push(newUser);
        
        const userToStore = { ...newUser };
        delete userToStore.password;
        
        setUser(userToStore);
        localStorage.setItem('apartment-spot-user', JSON.stringify(userToStore));
        setLoading(false);
        resolve(userToStore);
      }, 500);
    });
  };

  const value = { user, loading, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
