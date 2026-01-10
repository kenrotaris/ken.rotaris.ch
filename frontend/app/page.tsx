import { fetchPortfolio } from '@/lib/api';
import About from './components/About';
import Tabs from './components/Tabs';
import Footer from './components/Footer';

export default async function Home() {
  const data = await fetchPortfolio();

  return (
    <main>
      <About data={data.about} />
      <Tabs
        projects={data.projects}
        experience={data.experience}
        education={data.education}
      />
      <Footer social={data.social} />
    </main>
  );
}
