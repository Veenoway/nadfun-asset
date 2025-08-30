import { WalletConnection } from '@/components/connect-wallet';

export const Header = () => {
  return (
    <header className="absolute pt-[20px] lg:pt-[40px] flex justify-center max-w-[95%] top-0 left-1/2 -translate-x-1/2 w-full">
      <div className="w-full flex items-center justify-between relative mx-auto">
        <h1 className="text-2xl font-bold">Nad.fun</h1>
        <div className="lg:absolute top-0 right-0">
          <WalletConnection />
        </div>
      </div>
    </header>
  );
};
