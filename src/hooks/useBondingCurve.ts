import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { NADFUN_CONTRACTS, BONDING_CURVE_ABI, BONDING_CURVE_ROUTER_ABI } from '@/config/contracts';
import { useState, useCallback } from 'react';

export const useBondingCurve = (tokenAddress?: string, amountIn?: string) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: isListed } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE,
    abi: BONDING_CURVE_ABI,
    functionName: 'isListed',
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
  });

  const { data: isLocked } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE,
    abi: BONDING_CURVE_ABI,
    functionName: 'isLocked',
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
  });

  const { data: amountOut } = useReadContract({
    address: NADFUN_CONTRACTS.BONDING_CURVE_ROUTER,
    abi: BONDING_CURVE_ROUTER_ABI,
    functionName: 'getAmountOut',
    args:
      tokenAddress && amountIn
        ? [tokenAddress as `0x${string}`, parseEther(amountIn), true]
        : undefined,
  });

  const { data: buyHash, writeContract: buyTokens, isPending: isBuyPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Buy tokens using bonding curve
  const buyToken = useCallback(
    async (amountIn: string, amountOutMin: bigint) => {
      if (!address || !tokenAddress) {
        setError('Wallet not connected or no token selected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountInWei = parseEther(amountIn);
        const amountOutMinWei = amountOutMin;
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

        buyTokens({
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
    [address, tokenAddress, buyTokens]
  );

  return {
    isLoading: isLoading || isBuyPending || isConfirming,
    error,
    isBuySuccess,
    isListed,
    isLocked,
    amountOut: amountOut ? formatEther(amountOut) : null,
    buyToken,
    balance: balance ? Number(formatEther(balance.value)) : 0,
  };
};
