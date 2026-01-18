import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  profileImage: string;

  login: (user: User) => void;
  logout: () => void;
  
  setInitialLoading: (loading: boolean) => void;
  setProfileImage: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialLoading: true,
      profileImage: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&bold=true',

      login: (user) => set({ 
        user, 
        isAuthenticated: true,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&bold=true`
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        profileImage: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&bold=true'
      }),

      setInitialLoading: (loading) => set({ isInitialLoading: loading }),

      setProfileImage: (url) => set({ profileImage: url }),
    }),
    {
      name: 'market-map-auth', 
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        profileImage: state.profileImage 
      }),
    }
  )
);