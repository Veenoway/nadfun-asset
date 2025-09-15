import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui';

const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} className="font-semibold" variant="filter">
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} className="font-semibold" variant="filter">
                    Wrong network
                  </Button>
                );
              }
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button onClick={openChainModal} className="font-semibold" variant="filter">
                    {account.displayBalance ? ` ${account.displayBalance}` : ''}
                  </Button>
                  <Button onClick={openAccountModal} className="font-semibold" variant="filter">
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export { ConnectWallet };
