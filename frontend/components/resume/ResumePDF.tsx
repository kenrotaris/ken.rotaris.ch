import React, { type ReactElement } from 'react';
import { Page, Text, View, Document, StyleSheet, Font, type DocumentProps } from '@react-pdf/renderer';
import { Portfolio } from '@/lib/types';
import { RESUME_CONFIG } from '@/lib/resume-config';
import { getWebsiteUrl } from '@/lib/utils';

// Register fonts for embedding (ensures ATS compatibility)
// Note: Helvetica is a standard font in PDF and doesn't need explicit registration
// unless using a custom version. @react-pdf/renderer handles it automatically.

// Create styles using configuration - ATS-friendly single column layout
const createStyles = (accentColor: string) => StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: RESUME_CONFIG.colors.white,
        fontFamily: 'Helvetica',
        padding: RESUME_CONFIG.typography.spacing.xxxl,
        paddingTop: RESUME_CONFIG.typography.spacing.xl,
    },
    // Header section - clean and simple, ATS-friendly (no backgrounds)
    header: {
        flexDirection: 'column',
        paddingBottom: RESUME_CONFIG.typography.spacing.lg,
        marginBottom: RESUME_CONFIG.typography.spacing.lg,
        borderBottom: 2,
        borderBottomColor: RESUME_CONFIG.colors.gray[900],
    },
    name: {
        fontSize: RESUME_CONFIG.typography.fontSizes.h1,
        fontWeight: 700,
        color: RESUME_CONFIG.colors.gray[900],
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0,
    },
    title: {
        fontSize: RESUME_CONFIG.typography.fontSizes.h2,
        fontWeight: 400,
        color: RESUME_CONFIG.colors.gray[700],
        marginBottom: RESUME_CONFIG.typography.spacing.sm,
    },
    bio: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[600],
        lineHeight: 1.3,
        marginBottom: RESUME_CONFIG.typography.spacing.sm,
    },
    contactInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: RESUME_CONFIG.typography.spacing.sm,
    },
    contactItem: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[600],
    },
    link: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[600],
        textDecoration: 'none',
    },
    // Section styles - simple and ATS-friendly
    section: {
        marginBottom: RESUME_CONFIG.typography.spacing.lg,
    },
    sectionTitle: {
        fontSize: RESUME_CONFIG.typography.fontSizes.h3,
        fontWeight: 700,
        color: RESUME_CONFIG.colors.gray[900],
        marginBottom: RESUME_CONFIG.typography.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionUnderline: {
        height: 1,
        backgroundColor: RESUME_CONFIG.colors.gray[900],
        marginBottom: RESUME_CONFIG.typography.spacing.md,
    },
    // Summary section
    summaryText: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[700],
        lineHeight: 1.5,
        marginBottom: RESUME_CONFIG.typography.spacing.sm,
    },
    // Experience/Projects items
    itemContainer: {
        marginBottom: RESUME_CONFIG.typography.spacing.md,
    },
    itemHeader: {
        paddingBottom: RESUME_CONFIG.typography.spacing.xs,
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
        borderBottom: 1,
        borderBottomColor: RESUME_CONFIG.colors.gray[300],
    },
    itemHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    // Takes the width left over by location/dates, so long company
    // descriptions wrap instead of running underneath them.
    itemHeaderMain: {
        // An explicit cap, because react-pdf does not shrink this flex item:
        // it keeps its content width and runs under the location instead.
        maxWidth: '76%',
    },
    itemContent: {
        paddingLeft: 6, // Half of lg (12pt) for reduced indent
    },
    companyName: {
        fontSize: RESUME_CONFIG.typography.fontSizes.h3,
        fontWeight: 700,
        color: RESUME_CONFIG.colors.gray[900],
    },
    location: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[500],
        // Never shrink or wrap the location; the company line yields instead.
        flexShrink: 0,
        paddingLeft: 6,
    },
    role: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[700],
        fontWeight: 500,
        fontStyle: 'italic',
    },
    dates: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[500],
    },
    description: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[500],
        fontStyle: 'italic',
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
    },
    summary: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[700],
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
        lineHeight: 1.4,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
        paddingLeft: RESUME_CONFIG.typography.spacing.sm,
    },
    bulletText: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        marginRight: RESUME_CONFIG.typography.spacing.sm,
    },
    techStack: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[500],
        marginTop: RESUME_CONFIG.typography.spacing.xs,
    },
    // Skills section
    skillRow: {
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
    },
    skillText: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[700],
        lineHeight: 1.4,
    },
    skillCategory: {
        fontWeight: 700,
        color: RESUME_CONFIG.colors.gray[900],
    },
    // Languages
    languageItem: {
        fontSize: RESUME_CONFIG.typography.fontSizes.body,
        color: RESUME_CONFIG.colors.gray[700],
        marginBottom: RESUME_CONFIG.typography.spacing.xs,
    },
    // Footer note
    footerNote: {
        fontSize: RESUME_CONFIG.typography.fontSizes.small,
        color: RESUME_CONFIG.colors.gray[500],
        fontStyle: 'italic',
        marginTop: RESUME_CONFIG.typography.spacing.xs,
    },
});

interface ResumePDFProps {
    portfolio: Portfolio;
}

// Extract type from createStyles for type-safe component props
type ResumeStyles = ReturnType<typeof createStyles>;

// Generate filename: ken_rotaris__resume__9.2.2026.pdf
export function generateResumeFilename(heroName: string): string {
    const now = new Date();
    const sanitizedName = heroName.toLowerCase().replace(/\s+/g, '_');
    return `${sanitizedName}__resume__${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}.pdf`;
}

// Render bullet list
const BulletList: React.FC<{ items: string[]; styles: ResumeStyles }> = ({ items, styles }) => (
    <>
        {items.map((item, i) => (
            <View key={i} style={styles.bulletPoint}>
                <Text style={styles.bulletText}>•</Text>
                <Text style={[styles.bulletText, { flex: 1, lineHeight: 1.4 }]}>{item}</Text>
            </View>
        ))}
    </>
);

// Factory function that returns a Document element directly (for pdf() compatibility)
export function createResumeDocument(portfolio: Portfolio): ReactElement<DocumentProps> {
    const { hero, tabs, resume, footer, theme } = portfolio;
    if (!hero || !tabs) {
        throw new Error('Missing required hero or tabs data for resume PDF generation');
    }

    // Use theme accent color or fallback
    const accentColor = theme?.colors?.accent || RESUME_CONFIG.colors.gray[900];
    const styles = createStyles(accentColor);

    // Extract data
    const { summary = [], technicalSkills = [], softSkills = [], languages = [] } = resume?.['left-section'] || {};
    const websiteUrl = getWebsiteUrl(hero.website, hero.email);
    const websiteDisplay = websiteUrl.replace('https://', '').replace('www.', '');

    // Get tabs
    const experienceTab = tabs.find(tab => tab.id === 'experience');
    const projectsTab = tabs.find(tab => tab.id === 'projects');
    const educationTab = tabs.find(tab => tab.id === 'education');
    const coursesTab = tabs.find(tab => tab.id === 'courses');

    return (
        <Document
            title={`Resume - ${hero.name}`}
            author={hero.name}
            pdfVersion="1.7"
        >
            <Page size="A4" style={styles.page}>
                {/* HEADER - ATS-friendly with plain text contact info */}
                <View style={styles.header} wrap={false}>
                    <Text style={styles.name}>{hero.name}</Text>
                    <Text style={styles.title}>{hero.title}</Text>
                    {resume?.subtitle && <Text style={styles.bio}>{resume.subtitle}</Text>}

                    {/* Contact info as plain text with dot separators */}
                    <View style={styles.contactInfo}>
                        {hero.email && (
                            <>
                                <Text style={styles.contactItem}>{hero.email}</Text>
                                <Text style={styles.contactItem}>•</Text>
                            </>
                        )}
                        <Text style={styles.contactItem}>{websiteDisplay}</Text>
                        {footer?.social?.linkedin && (
                            <>
                                <Text style={styles.contactItem}>•</Text>
                                <Text style={styles.contactItem}>
                                    {footer.social.linkedin.replace('https://', '').replace('www.', '')}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* SUMMARY - First content section for ATS */}
                {summary.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <View style={styles.sectionUnderline} />
                        {summary.map((line, i) => (
                            <Text key={i} style={styles.summaryText}>{line}</Text>
                        ))}
                    </View>
                )}

                {/* EXPERIENCE - Primary section for ATS */}
                {experienceTab && experienceTab.items.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        <View style={styles.sectionUnderline} />
                        {experienceTab.items.map((item, i) => (
                            <View key={i} style={styles.itemContainer} wrap={(item.accomplishments?.length || 0) <= 3}>
                                <View style={styles.itemHeader} wrap={false}>
                                    {/* Row 1: Company Name - Description + Location */}
                                    <View style={styles.itemHeaderRow}>
                                        <View style={styles.itemHeaderMain}>
                                            <Text>
                                                <Text style={styles.companyName}>{item.company}</Text>
                                                {item.companyDescription && item.role && (
                                                    <Text style={styles.description}> - {item.companyDescription}</Text>
                                                )}
                                            </Text>
                                        </View>
                                        {item.location && (
                                            <Text style={styles.location}>{item.location}</Text>
                                        )}
                                    </View>
                                    {/* Row 2: Role + Date */}
                                    <View style={styles.itemHeaderRow}>
                                        <Text style={styles.role}>{item.role || item.companyDescription}</Text>
                                        {item.dates?.from && (
                                            <Text style={styles.dates}>
                                                {item.dates.from}{item.dates.to ? ` – ${item.dates.to}` : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {/* Indented content */}
                                <View style={styles.itemContent}>
                                    <Text style={styles.summary}>{item.summary}</Text>
                                    {item.accomplishments && item.accomplishments.length > 0 && (
                                        <BulletList items={item.accomplishments} styles={styles} />
                                    )}
                                    {item.categories && (
                                        <Text style={styles.techStack}>
                                            Technologies: {[...new Set(Object.entries(item.categories)
                                                .filter(([key]) => key !== 'label')
                                                .flatMap(([, value]) => value)
                                                .filter(Boolean))].join(', ')}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* EDUCATION - If exists, goes here in ATS-friendly order */}
                {educationTab && educationTab.items.length > 0 && (
                    <View style={styles.section} break>
                        <Text style={styles.sectionTitle} break={false}>Education</Text>
                        <View style={styles.sectionUnderline} />
                        {educationTab.items.map((item, i) => (
                            <View key={i} style={styles.itemContainer} wrap={i === 0 ? false : true}>
                                <View style={styles.itemHeader} wrap={false}>
                                    {/* Row 1: School/Institution Name + Location */}
                                    <View style={styles.itemHeaderRow}>
                                        <Text style={styles.companyName}>{item.company}</Text>
                                        {item.location && (
                                            <Text style={styles.location}>{item.location}</Text>
                                        )}
                                    </View>
                                    {/* Row 2: Degree/Program + Date */}
                                    <View style={styles.itemHeaderRow}>
                                        <Text style={styles.role}>{item.role}</Text>
                                        {item.dates?.from && (
                                            <Text style={styles.dates}>
                                                {item.dates.from}{item.dates.to ? ` – ${item.dates.to}` : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {/* Indented content */}
                                {item.summary && (
                                    <View style={styles.itemContent}>
                                        <Text style={styles.summary}>{item.summary}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* COURSES & CERTIFICATIONS - Compressed format */}
                {coursesTab && coursesTab.items.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Courses & Certifications</Text>
                        <View style={styles.sectionUnderline} />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            {coursesTab.items.map((item, i) => (
                                <Text key={i} style={styles.languageItem}>
                                    • {item.company} ({item.role})
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* TECHNICAL SKILLS - Plain text, comma-separated for ATS */}
                {technicalSkills.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.sectionUnderline} />
                        {technicalSkills.map((skill, i) => {
                            const [category, ...rest] = skill.split(':');
                            const hasCategory = rest.length > 0;
                            return (
                                <View key={i} style={styles.skillRow}>
                                    <Text style={styles.skillText}>
                                        {hasCategory && <Text style={styles.skillCategory}>{category}: </Text>}
                                        {hasCategory ? rest.join(':').trim() : skill}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* PROJECTS - After skills to prioritize experience and education */}
                {projectsTab && projectsTab.items.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        <View style={styles.sectionUnderline} />
                        {projectsTab.items.slice(0, projectsTab.resumeMaxItems || projectsTab.items.length).map((item, i) => (
                            <View key={i} style={styles.itemContainer} wrap={(item.accomplishments?.length || 0) <= 2}>
                                <View style={styles.itemHeader} wrap={false}>
                                    {/* Row 1: Project Name + Location (if any) */}
                                    <View style={styles.itemHeaderRow}>
                                        <Text style={styles.companyName}>{item.company}</Text>
                                        {item.location && (
                                            <Text style={styles.location}>{item.location}</Text>
                                        )}
                                    </View>
                                    {/* Row 2: Role/Description + Date */}
                                    <View style={styles.itemHeaderRow}>
                                        <Text style={styles.role}>{item.role || item.companyDescription}</Text>
                                        {item.dates?.from && (
                                            <Text style={styles.dates}>{item.dates.from}</Text>
                                        )}
                                    </View>
                                </View>
                                {/* Indented content */}
                                <View style={styles.itemContent}>
                                    <Text style={styles.summary}>{item.summary}</Text>
                                    {item.accomplishments && item.accomplishments.length > 0 && (
                                        <BulletList items={item.accomplishments} styles={styles} />
                                    )}
                                    {item.categories && (
                                        <Text style={styles.techStack}>
                                            Technologies: {[...new Set(Object.entries(item.categories)
                                                .filter(([key]) => key !== 'label')
                                                .flatMap(([, value]) => value)
                                                .filter(Boolean))].join(', ')}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                        <Text style={styles.footerNote}>
                            See more projects at {websiteDisplay}/#projects
                        </Text>
                    </View>
                )}

                {/* LANGUAGES - Compressed format */}
                {languages.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <View style={styles.sectionUnderline} />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            {languages.map((lang, i) => (
                                <Text key={i} style={styles.languageItem}>
                                    • {lang.name} ({lang.level})
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
}

// Optional: Component wrapper for other usage contexts
export default function ResumePDF({ portfolio }: ResumePDFProps) {
    return createResumeDocument(portfolio);
}
