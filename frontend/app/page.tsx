import { fetchPortfolio } from '@/lib/data';
import HomeClient from '@/components/HomeClient';
import StructuredData from '@/components/StructuredData';

// Re-render on a timer so Directus edits appear without a deploy; the
// /api/revalidate webhook makes them appear immediately. Next requires a
// literal here, so this mirrors DIRECTUS_REVALIDATE in lib/directus.ts.
export const revalidate = 300;

export default async function Home() {
  const data = await fetchPortfolio();
  return (
    <>
      <StructuredData portfolio={data} />
      <HomeClient
        data={data}
        // The visual editor validates that messages come from this exact
        // origin, so it must be the Studio that frames us — normally the same
        // host as the content API, but not necessarily.
        directusUrl={process.env.VISUAL_EDITOR_ORIGIN ?? process.env.DIRECTUS_URL}
      />
    </>
  );
}
