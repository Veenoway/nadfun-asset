import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useTokenRefetch = () => {
  const queryClient = useQueryClient();

  const refetchUserTokens = useCallback(
    (address?: string) => {
      if (address) {
        queryClient.invalidateQueries({
          queryKey: ['user', 'token-balances', address],
        });
      }
    },
    [queryClient],
  );

  const refetchRecentTokens = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['tokens', 'creation_time'],
    });
  }, [queryClient]);

  const refetchAllTokenData = useCallback(
    (address?: string) => {
      refetchUserTokens(address);
      refetchRecentTokens();
    },
    [refetchUserTokens, refetchRecentTokens],
  );

  return {
    refetchUserTokens,
    refetchRecentTokens,
    refetchAllTokenData,
  };
};
