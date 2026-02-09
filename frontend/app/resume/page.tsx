import { Metadata } from 'next';
import { fetchPortfolio } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
    const portfolio = await fetchPortfolio();
    const name = portfolio.hero?.name || 'Portfolio';
    const title = portfolio.hero?.title || '';
    const website = portfolio.hero?.website || 'ken.rotaris.ch';
    const siteUrl = `https://${website}`;

    return {
        title: `Resume - ${name}`,
        description: `Professional resume and CV for ${name}${title ? `, ${title}` : ''}. Download PDF or view online.`,
        alternates: {
            canonical: `${siteUrl}/resume`,
        },
        openGraph: {
            type: 'profile',
            url: `${siteUrl}/resume`,
            title: `${name} - Resume`,
            description: `Professional resume for ${name}`,
        },
    };
}

export default async function ResumePage() {
    const portfolio = await fetchPortfolio();

    return (
        <div className="flex flex-col h-screen">
            <Breadcrumbs
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Resume', url: '/resume' },
                ]}
                website={portfolio.hero?.website}
            />
            <div className="flex-1 bg-[#525659]">
                <iframe
                    src="/api/resume-pdf"
                    title="Resume PDF"
                    className="w-full h-full border-0"
                />
            </div>
        </div>
    );
}
