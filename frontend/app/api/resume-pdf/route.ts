import { NextRequest, NextResponse } from 'next/server';
import { createElement, ReactElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import { fetchPortfolio } from '@/lib/data';
import ResumePDF, { generateResumeFilename } from '@/components/resume/ResumePDF';

export async function GET(request: NextRequest) {
    try {
        const portfolio = await fetchPortfolio();
        const filename = generateResumeFilename(portfolio.hero?.name || 'Resume');

        // Render PDF to blob
        // Note: TypeScript type inference doesn't recognize that ResumePDF returns a Document
        // The actual runtime behavior is correct - ResumePDF returns <Document> which pdf() accepts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfElement = createElement(ResumePDF, { portfolio }) as any;
        const pdfInstance = pdf(pdfElement);
        const pdfBlob = await pdfInstance.toBlob();

        // Convert Blob to ArrayBuffer for NextResponse
        const pdfBuffer = await pdfBlob.arrayBuffer();

        // Return PDF with proper headers
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    }
}
