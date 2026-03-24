import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin?: boolean;
  is_pro?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  profileImage: string;

  login: (user: User, token: string) => void;
  logout: () => void;
  
  setInitialLoading: (loading: boolean) => void;
  setProfileImage: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialLoading: true,
      profileImage: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&bold=true',

      login: (user, token) => set({ 
        user, 
        token,
        isAuthenticated: true,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&bold=true`
      }),

      logout: () => {
        // Clear user-specific data from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('market-map-watchlist-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false,
          profileImage: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&bold=true'
        });
      },

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