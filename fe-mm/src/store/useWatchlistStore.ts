import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistItem {
  id: number;
  name: string;
  price: number;
  delta: number;
  img: string;
}

interface WatchlistState {
  items: WatchlistItem[];
  toggleWatchlist: (item: WatchlistItem) => void;
  isInWatchlist: (id: number) => boolean;
  clearWatchlist: () => void; 
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWatchlist: (item) => {
        const isExist = get().items.find((i) => i.id === item.id);
        if (isExist) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [item, ...get().items] });
        }
      },

      isInWatchlist: (id) => {
        return get().items.some((item) => item.id === id);
      },

      clearWatchlist: () => set({ items: [] }),
    }),
    { name: 'market-map-watchlist' }
  )
);