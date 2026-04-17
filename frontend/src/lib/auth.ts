// football_tournament_system/frontend/src/lib/auth.ts
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'REFEREE' | 'COACH' | 'PLAYER' | 'VIEWER';
}

export const auth = {
  // ...
  getUser: (): User | null => {
    // Проверка: если код выполняется на сервере, возвращаем null
    if (typeof window === 'undefined') return null; 
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  login: (token: string, user: User) => {
    if (typeof window === 'undefined') return; // Защита от выполнения на сервере
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },


  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  login: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  isAuthenticated: () => !!auth.getToken(),
  
  hasRole: (...roles: string[]) => {
    const user = auth.getUser();
    return user ? roles.includes(user.role) : false;
  },
};