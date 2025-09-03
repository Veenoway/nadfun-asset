import { WalletConnection } from '@/components/connect-wallet';

export const Header = () => {
  return (
    <header className="flex justify-center px-8 py-4 w-full">
      <div className="w-full flex items-center justify-between relative mx-auto max-w-screen-2xl">
        <h1 className="text-2xl font-bold text-white/80">Nad.fun</h1>
        <WalletConnection />
      </div>
    </header>
  );
};
