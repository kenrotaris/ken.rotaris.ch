import { fetchPortfolio } from '@/lib/api';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const data = await fetchPortfolio();
  return <HomeClient data={data} />;
}
