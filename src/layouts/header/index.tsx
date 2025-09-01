import { WalletConnection } from '@/components/connect-wallet';

export const Header = () => {
  return (
    <header className="max-w-screen-2xl flex justify-center px-8 py-4 w-full bg-secondary  border-b border-borderColor mb-4">
      <div className="w-full flex items-center justify-between relative mx-auto">
        <h1 className="text-2xl font-bold">Nad.fun</h1>
        <WalletConnection />
      </div>
    </header>
  );
};
