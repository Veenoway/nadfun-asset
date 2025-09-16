import { Home } from '@/components/home';
import { fetchTokensByCreationTime } from '@/lib/server-data';

export default async function HomePage() {
  const initialTokensData = await fetchTokensByCreationTime(1, 20);

  return <Home initialTokensData={initialTokensData} />;
}
