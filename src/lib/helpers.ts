import { formatEther, isAddress } from 'viem';

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

/**
 * Format numbers with K, M, B suffixes for better readability
 * @param value - Number or string to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted string (e.g., "1K", "1.5M", "2.3B")
 */
export function formatNumber(value: number | string, decimals: number = 1): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(decimals)}T`;
  }

  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(decimals)}B`;
  }

  if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(decimals)}M`;
  }

  if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(decimals)}K`;
  }

  return `${sign}${absNum.toFixed(decimals)}`;
}

/**
 * Format market cap
 * @param marketCap - Market cap in wei (string)
 * @returns Formatted market cap string (e.g., "1.5", "2.3")
 */
export function formatMarketCap(marketCap: string): number | string {
  if (!marketCap) {
    return '0';
  }
  const val = marketCap.split('.')[0];
  return Number(val) / 10 ** 18;
}

/**
 * Format token balance, supports suffix display with K, M, B suffixes
 * @param balance - Token balance in wei (string)
 * @param suffix - Whether to display suffix (default: false)
 * @returns Formatted balance string (e.g., "1.5K", "2.3M")
 */
export function formatTokenBalance(balance: string, suffix: boolean = false): string {
  if (balance.includes('e') || balance.includes('E')) {
    // Handle scientific notation
    const num = Number(balance);
    if (isNaN(num)) return '0';

    // Convert from wei to ether
    const etherValue = num / 10 ** 18;
    const fromDecimals = etherValue.toString().split('.')[0];

    if (suffix) {
      return formatNumber(fromDecimals);
    }
    return fromDecimals;
  }

  // Handle regular string numbers
  const fromWei = formatEther(BigInt(balance));
  const fromDecimals = fromWei.split('.')[0];

  if (suffix) {
    return formatNumber(fromDecimals);
  }
  return fromDecimals;
}

/**
 * Format MON balance
 * @param value - MON balance in wei (string)
 * @returns Formatted balance string (e.g., "1.5", "2.3")
 */
export function formatMON(value: string): string {
  if (value.includes('e')) {
    const num = Number(value);
    return (num / 10 ** 18).toFixed(3).toString();
  }
  return (Number(value) / 10 ** 18).toFixed(3).toString();
}

/**
 * Format nickname display
 * @param nickname - Nickname or address (string)
 * @returns Formatted nickname string (e.g., "0x123...")
 */
export function formatNickname(nickname: string): string {
  if (isAddress(nickname)) {
    return '@' + nickname.slice(0, 3) + nickname.slice(-3);
  }
  return nickname;
}
