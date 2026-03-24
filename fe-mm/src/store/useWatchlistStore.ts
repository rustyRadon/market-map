import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

interface WatchlistItem {
  id: string;
  name: string;
  price: number;
  delta: number;
  img: string;
}

interface WatchlistData {
  [userId: string]: WatchlistItem[];
}

interface WatchlistState {
  data: WatchlistData;
  toggleWatchlist: (item: WatchlistItem) => void;
  isInWatchlist: (id: string) => boolean;
  clearWatchlist: () => void;
  getUserItems: () => WatchlistItem[];
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      data: {},
      
      getUserItems: () => {
        const user = useAuthStore.getState().user;
        if (!user) return [];
        return get().data[user.id] || [];
      },

      toggleWatchlist: (item) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const userItems = get().data[user.id] || [];
        const isExist = userItems.find((i) => i.id === item.id);
        
        const newUserItems = isExist 
          ? userItems.filter((i) => i.id !== item.id)
          : [item, ...userItems];
        
        set({ 
          data: { 
            ...get().data, 
            [user.id]: newUserItems 
          } 
        });
      },

      isInWatchlist: (id) => {
        const userItems = get().getUserItems();
        return userItems.some((item) => item.id === id);
      },

      clearWatchlist: () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const newData = { ...get().data };
        delete newData[user.id];
        set({ data: newData });
      },
    }),
    { name: 'market-map-watchlist' }
  )
);