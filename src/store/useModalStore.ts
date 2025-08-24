"use client";
import type { ReactNode } from "react";
import { create } from "zustand";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

type TokenModalPayload = {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  lockClose?: boolean;
  content?: ReactNode;
};

type TokenModalStore = {
  isOpen: boolean;
  payload: TokenModalPayload;
  toggle: () => void;
  openWith: (payload: TokenModalPayload) => void;
  reset: () => void;
  close: () => void;
  open: () => void;
};

export const useModalStore = create<TokenModalStore>((set) => ({
  isOpen: false,
  payload: {},
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  openWith: (payload) => set({ isOpen: true, payload }),
  reset: () => set({ isOpen: false, payload: {} }),
}));
