import { OrderTokenResponse } from './types';

// Server-side function to fetch tokens by creation time
export async function fetchTokensByCreationTime(
  page: number = 1,
  limit: number = 20,
): Promise<OrderTokenResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/tokens/creation-time?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch tokens by creation time:', error);
    return {
      king_of_the_hill: {
        token_info: {
          token_address: '',
          name: '',
          symbol: '',
          image_uri: '',
          creator: '',
          total_supply: '0',
          created_at: 0,
        },
        account_info: {
          account_id: '',
          nickname: '',
          image_uri: '',
          follower_count: 0,
          following_count: 0,
        },
      },
      order_type: '',
      order_token: [],
      total_count: 0,
    };
  }
}
