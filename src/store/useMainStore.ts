import { Asset } from '@/modules/home/types';
import { create } from 'zustand';

type CounterState = {
  tokens: Asset[];
  setTokens: (assets: Asset[]) => void;
  selectedTokens: Asset[];
  setSelectedTokens: (selectedTokens: Asset[]) => void;
};

export const useMainStore = create<CounterState>()((set) => ({
  tokens: [],
  setTokens: (tokens: Asset[]) => set({ tokens }),
  selectedTokens: [],
  setSelectedTokens: (selectedTokens: Asset[]) => set({ selectedTokens }),
}));
