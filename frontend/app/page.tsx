import { fetchPortfolio } from '@/lib/api';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const data = await fetchPortfolio();
  return <HomeClient data={data} />;
}
