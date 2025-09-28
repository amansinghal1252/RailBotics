import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  // NEW: Add the function signature for password reset
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo credentials
const DEMO_CREDENTIALS = {
  // NEW: Changed demo email to match the placeholder in the login form
  email: 'railbotics06@gmail.com',
  password: 'AAAA@1234'
};

const DEMO_USER: User = {
  id: 'CTRL001',
  name: 'Rajesh Kumar',
  role: 'Section Controller',
  section: 'Northern Railway - Delhi Division'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('railway-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_USER);
      localStorage.setItem('railway-user', JSON.stringify(DEMO_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('railway-user');
  };

  // NEW: Function to simulate sending a password reset email
  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    console.log(`Password reset requested for: ${email}`);
    // Simulate an API call to the backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, your backend would handle sending the email.
    // The frontend doesn't need to know if the email exists for security reasons.
    // It just needs to know the request was sent.
    console.log('Simulated password reset email sent successfully.');
  };


  const isAuthenticated = user !== null;

  return (
    // NEW: Add the new function to the provider's value
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, sendPasswordResetEmail }}>
      {children}
    </AuthContext.Provider>
  );
};