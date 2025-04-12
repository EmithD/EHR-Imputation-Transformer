import { cookies } from 'next/headers';
import { UserType } from '../UserType';

export async function getUserFromCookie(): Promise<UserType | null> {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user_info');
    
    if (!userCookie?.value) {
      return null;
    }
    
    try {
      return JSON.parse(decodeURIComponent(userCookie.value)) as UserType;
    } catch (error) {
      console.error('Failed to parse user cookie:', error);
      return null;
    }
}

export async function getServerUser(): Promise<UserType | null> {
  return getUserFromCookie();
}

export function getClientUser(): UserType | null {

  if (typeof window === 'undefined') return null;
  
  try {
    const userCookie = document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('user_info='));
      
    if (!userCookie) {
      return null;
    }
    
    const cookieValue = userCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(cookieValue)) as UserType;
  } catch (error) {
    console.error('Failed to parse user cookie on client:', error);
    return null;
  }
}
