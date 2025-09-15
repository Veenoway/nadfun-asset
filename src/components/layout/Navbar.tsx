import { ConnectWallet } from '@/components/layout';

const Navbar = () => {
  return (
    <div className="bg-secondary border-b border-borderColor">
      <div className="container mx-auto flex justify-center py-4 w-full">
        <div className="w-full flex items-center justify-between relative mx-auto max-w-screen-2xl">
          <h1 className="text-2xl font-bold text-white/80">Nad.fun</h1>
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
