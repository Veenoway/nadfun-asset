import { TokenInfo } from '@/lib/types';
import { create } from 'zustand';

type CounterState = {
  tokens: TokenInfo[];
  setTokens: (assets: TokenInfo[]) => void;
  selectedTokens: TokenInfo[];
  setSelectedTokens: (selectedTokens: TokenInfo[]) => void;
};

export const useMainStore = create<CounterState>()((set) => ({
  tokens: [],
  setTokens: (tokens: TokenInfo[]) => set({ tokens }),
  selectedTokens: [],
  setSelectedTokens: (selectedTokens: TokenInfo[]) => set({ selectedTokens }),
}));
