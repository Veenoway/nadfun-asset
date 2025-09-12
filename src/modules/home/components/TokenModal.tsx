'use client';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/shadcn/modal';
import { useMainStore } from '@/store/useMainStore';
import { useModalStore } from '@/store/useModalStore';
import { cn } from '@/utils/cn';
import * as React from 'react';
import { Asset } from '../types';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-[95vw] sm:h-[90vh] [&>div]:h-full',
};

export type TokenModalProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  showDefaultActions?: boolean;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  tokens: Asset[];
};

export function TokenModal({
  tokens,
  size = 'md',
  footer,
  showDefaultActions = true,
  className,
  contentClassName,
}: TokenModalProps) {
  const { isOpen, toggle, close } = useModalStore();
  const { selectedTokens, setSelectedTokens } = useMainStore();
  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogContent
        className={cn('p-5 overflow-hidden bg-primary', SIZE_CLASS[size], className)}
        onInteractOutside={toggle}
        onEscapeKeyDown={toggle}
        close={close}
      >
        <div className={cn('flex flex-col max-h-[500px]', contentClassName)}>
          <DialogHeader className="pb-6">
            <DialogTitle>Select Tokens</DialogTitle>
            <DialogDescription>Select the tokens you want to add</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto gap-3">
            {tokens?.map((asset) => (
              <div
                key={asset.symbol}
                className={`flex items-center gap-3 mb-2 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all duration-300 ${
                  selectedTokens.includes(asset) ? 'bg-white/10' : ''
                }`}
                onClick={() => {
                  if (selectedTokens.includes(asset)) {
                    setSelectedTokens(selectedTokens.filter((t) => t.symbol !== asset.symbol));
                  } else {
                    setSelectedTokens([...selectedTokens, asset]);
                  }
                }}
              >
                <img
                  src={asset.logo}
                  alt={asset.name}
                  className="rounded-full w-10 h-10 object-cover"
                />
                <div className="flex flex-col">
                  <p className="text-lg text-white">{asset.symbol}</p>
                  <h3 className="text-lg text-white/60">{asset.name}</h3>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4 gap-2 border-t border-white/10">
            {footer ?? (
              <>
                {showDefaultActions && (
                  <>
                    <DialogClose asChild>
                      <button className="bg-white/10 text-white px-4 py-2 rounded-md">Close</button>
                    </DialogClose>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
