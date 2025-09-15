import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignTypedData,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  NADFUN_CONTRACTS,
  BONDING_CURVE_ABI,
  BONDING_CURVE_ROUTER_ABI,
  ERC20_PERMIT_ABI,
} from '@/lib/contracts';
import { useState, useCallback } from 'react';

export interface TradingParams {
  tokenAddress: string;
  amountIn: string;
  amountOutMin?: string;
}

export interface TradingState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isListed: boolean;
  isLocked: boolean;
  amountOut: string | null;
  amountIn: string | null;
}

interface PermitSignature {
  tokenAddress: string;
  owner: string;
  spender: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
  timestamp: number;
  nonce: string;
}

const useNadFunTrading = (tokenAddress?: string, amountIn?: string, isSellMode?: boolean) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign typed data for permit
  const { signTypedDataAsync } = useSignTypedData();

  // Check if token is listed on bonding curve
  const { data: isListed } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE,
    abi: BONDING_CURVE_ABI,
    functionName: 'isListed',
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
  });

  // Check if token is locked
  const { data: isLocked } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE,
    abi: BONDING_CURVE_ABI,
    functionName: 'isLocked',
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
  });

  // Get token permit data for selling
  const { data: tokenNonce } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_PERMIT_ABI,
    functionName: 'nonces',
    args: address ? [address] : undefined,
  });

  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_PERMIT_ABI,
    functionName: 'name',
  });

  // Write contract for trading
  const {
    data: tradeHash,
    writeContract: executeTrade,
    isPending: isTradePending,
  } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isTradeSuccess } = useWaitForTransactionReceipt({
    hash: tradeHash,
  });

  // Get amount out for buying
  const { data: amountOutBuy } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
    abi: BONDING_CURVE_ROUTER_ABI,
    functionName: 'getAmountOut',
    args:
      tokenAddress && amountIn && !isSellMode
        ? [tokenAddress as `0x${string}`, parseEther(amountIn), true]
        : undefined,
  });

  // Get amount out for selling
  const { data: amountOutSell } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
    abi: BONDING_CURVE_ROUTER_ABI,
    functionName: 'getAmountOut',
    args:
      tokenAddress && amountIn && isSellMode
        ? [tokenAddress as `0x${string}`, parseEther(amountIn), false]
        : undefined,
  });

  const amountOut = isSellMode ? amountOutSell : amountOutBuy;

  // Buy tokens using bonding curve
  const buyToken = useCallback(
    async ({ tokenAddress, amountIn, amountOutMin }: TradingParams) => {
      if (!address || !tokenAddress) {
        setError('Wallet not connected or no token selected');
        return;
      }

      if (!amountIn || Number(amountIn) <= 0) {
        setError('Invalid amount');
        return;
      }

      // Check if token is available for bonding curve
      if (isListed || isLocked) {
        setError('Token is listed or locked, cannot use bonding curve');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountInWei = parseEther(amountIn);
        const amountOutMinWei = amountOutMin ? parseEther(amountOutMin) : BigInt(0);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

        executeTrade({
          address: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
          abi: BONDING_CURVE_ROUTER_ABI,
          functionName: 'buy',
          args: [
            {
              amountOutMin: amountOutMinWei,
              token: tokenAddress as `0x${string}`,
              to: address,
              deadline,
            },
          ],
          value: amountInWei,
        });
      } catch (err) {
        console.error('Error buying token:', err);
        setError(err instanceof Error ? err.message : 'Failed to buy token');
      } finally {
        setIsLoading(false);
      }
    },
    [address, isListed, isLocked, executeTrade],
  );

  // Sell tokens using bonding curve with permit
  const sellToken = useCallback(
    async ({ tokenAddress, amountIn, amountOutMin }: TradingParams) => {
      if (!address || !tokenAddress) {
        setError('Wallet not connected or no token selected');
        return;
      }

      if (!amountIn || Number(amountIn) <= 0) {
        setError('Invalid amount');
        return;
      }

      // Check if token is available for bonding curve
      if (isListed || isLocked) {
        setError('Token is listed or locked, cannot use bonding curve');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountInWei = parseEther(amountIn);
        const amountOutMinWei = amountOutMin ? parseEther(amountOutMin) : BigInt(0);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

        // Create permit signature
        const permitDeadline = BigInt(Math.floor(Date.now() / 1000) + 300);
        const maxAllowance = BigInt(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );

        const permitData = {
          domain: {
            name: tokenName || 'Token',
            version: '1',
            chainId: 10143,
            verifyingContract: tokenAddress as `0x${string}`,
          },
          message: {
            owner: address,
            spender: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
            value: maxAllowance,
            nonce: tokenNonce || BigInt(0),
            deadline: permitDeadline,
          },
          primaryType: 'Permit',
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            Permit: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
            ],
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signature = await signTypedDataAsync(permitData as any);

        // Split signature into v, r, s
        const sig = signature.slice(2);
        const r = `0x${sig.slice(0, 64)}`;
        const s = `0x${sig.slice(64, 128)}`;
        const v = parseInt(sig.slice(128, 130), 16);

        let permitSignature: PermitSignature | null = null;

        permitSignature = {
          tokenAddress,
          owner: address,
          spender: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
          value: maxAllowance.toString(),
          deadline: Number(permitDeadline),
          nonce: (tokenNonce || BigInt(0)).toString(),
          v,
          r,
          s,
          timestamp: Math.floor(Date.now() / 1000),
        };

        // Execute sell with permit
        if (permitSignature) {
          executeTrade({
            address: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
            abi: BONDING_CURVE_ROUTER_ABI,
            functionName: 'sellPermit',
            args: [
              {
                amountIn: amountInWei,
                amountOutMin: amountOutMinWei,
                amountAllowance: BigInt(permitSignature.value),
                token: tokenAddress as `0x${string}`,
                to: address,
                deadline,
                v: permitSignature.v,
                r: permitSignature.r as `0x${string}`,
                s: permitSignature.s as `0x${string}`,
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error selling token:', err);
        setError(err instanceof Error ? err.message : 'Failed to sell token');
      } finally {
        setIsLoading(false);
      }
    },
    [address, isListed, isLocked, executeTrade, signTypedDataAsync, tokenName, tokenNonce],
  );

  // Get current trading state
  const getTradingState = useCallback((): TradingState => {
    return {
      isLoading: isLoading || isTradePending || isConfirming,
      error,
      isSuccess: isTradeSuccess,
      isListed: isListed || false,
      isLocked: isLocked || false,
      amountOut: null,
      amountIn: null,
    };
  }, [isLoading, isTradePending, isConfirming, error, isTradeSuccess, isListed, isLocked]);

  return {
    isLoading: isLoading || isTradePending || isConfirming,
    error,
    isSuccess: isTradeSuccess,
    isListed,
    isLocked,
    amountOut: amountOut ? formatEther(amountOut) : null,

    buyToken,
    sellToken,
    getTradingState,

    balance: balance ? Number(formatEther(balance.value)) : 0,
  };
};

export { useNadFunTrading };
