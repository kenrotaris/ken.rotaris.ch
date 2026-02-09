import { fetchPortfolio } from '@/lib/data';
import HomeClient from '@/components/HomeClient';
import StructuredData from '@/components/StructuredData';

export default async function Home() {
  const data = await fetchPortfolio();
  return (
    <>
      <StructuredData portfolio={data} />
      <HomeClient data={data} />
    </>
  );
}
