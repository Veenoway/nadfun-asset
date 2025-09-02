import { isAddress } from 'viem';

/**
 * Convert Unix timestamp to relative time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string (e.g., "2s ago", "4m ago", "1h ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0) {
    return 'just now';
  }

  if (diff < 60) {
    return `${diff}s ago`;
  }

  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  }

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  }

  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }

  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months}mo ago`;
  }

  const years = Math.floor(diff / 31536000);
  return `${years}y ago`;
}

export function formatMarketCap(marketCap: string): number | string {
  if (!marketCap) {
    return '0';
  }
  const val = marketCap.split('.')[0];
  return Number(val) / 10 ** 18;
}

export function formatNickname(nickname: string): string {
  if (isAddress(nickname)) {
    return nickname.slice(0, 6);
  }
  return nickname;
}
