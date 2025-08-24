import { create } from "zustand";

type CounterState = {
  test: string;
  setTest: (test: string) => void;
};

export const useMainStore = create<CounterState>()((set) => ({
  test: "",
  setTest: (test: string) => set({ test }),
}));
