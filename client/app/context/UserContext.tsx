'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserType } from '../common/UserType';

interface UserContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUserFromCookie = () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(cookie => cookie.startsWith('user_info='));
          
        if (userCookie) {
          const cookieValue = userCookie.split('=')[1];
          const userData = JSON.parse(decodeURIComponent(cookieValue)) as UserType;
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to parse user cookie on client:', error);
      }
    };

    loadUserFromCookie();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function useLogout() {
  const { setUser } = useUser();
  
  const logout = () => {
    setUser(null);
    document.cookie = 'user_info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.href = '/auth/login'
  };
  
  return { logout };
}