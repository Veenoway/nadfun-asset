import { ConnectWallet } from '@/components/layout';
import Image from 'next/image';

const Navbar = () => {
  return (
    <div className="bg-secondary border-b border-borderColor">
      <div className="container mx-auto flex justify-center py-4 w-[95%]">
        <div className="w-full flex items-center justify-between relative mx-auto max-w-screen-2xl">
          <div className="flex items-center gap-2">
            <Image src="/devnad.png" alt="Devnad.fun" width={32} height={32} />
            <h1 className="text-2xl font-bold text-white/80">Devnad.fun</h1>
          </div>
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
