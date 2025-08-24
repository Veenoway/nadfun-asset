import { create } from "zustand";

type CounterState = {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;
};

export const useMainStore = create<CounterState>()((set) => ({
  assets: [],
  setAssets: (assets: Asset[]) => set({ assets }),
  selectedAsset: null,
  setSelectedAsset: (asset: Asset | null) => set({ selectedAsset }),
}));
