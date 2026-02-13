import { NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import { fetchPortfolio } from '@/lib/data';
import { createResumeDocument, generateResumeFilename } from '@/components/resume/ResumePDF';

const PDF_HEADERS = {
    'Content-Type': 'application/pdf',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
};

export async function GET() {
    try {
        const portfolio = await fetchPortfolio();
        const filename = generateResumeFilename(portfolio.hero?.name || 'Resume');
        const blob = await pdf(createResumeDocument(portfolio)).toBlob();
        const buffer = await blob.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                ...PDF_HEADERS,
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    }
}
