/**
 * Reusable React-PDF Components for Lunary Packs
 *
 * These components create beautiful, branded PDFs with:
 * - Dark theme matching the app
 * - Brand colors and typography
 * - Consistent spacing and layout
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDF_COLORS, TYPOGRAPHY, SPACING, PAGE, DECORATIONS } from '../styles';
import { FONTS } from '../fonts';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: PDF_COLORS.background,
    paddingTop: PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    paddingLeft: PAGE.marginLeft,
    paddingRight: PAGE.marginRight,
    fontFamily: FONTS.body,
    color: PDF_COLORS.text,
  },

  // Cover page
  coverPage: {
    backgroundColor: PDF_COLORS.background,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },

  coverContent: {
    padding: SPACING.xxl,
    textAlign: 'center',
    width: '100%',
  },

  coverCategory: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.small,
    color: PDF_COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },

  coverTitle: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    color: PDF_COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeightTight,
  },

  coverTagline: {
    fontFamily: FONTS.accent,
    fontSize: TYPOGRAPHY.h3,
    color: PDF_COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.xl,
  },

  coverDivider: {
    width: 100,
    height: 1,
    backgroundColor: PDF_COLORS.accent,
    marginVertical: SPACING.lg,
    alignSelf: 'center',
  },

  coverDescription: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.textSoft,
    lineHeight: TYPOGRAPHY.lineHeightRelaxed,
    maxWidth: 400,
    textAlign: 'center',
  },

  coverFooter: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  coverLogo: {
    fontFamily: FONTS.heading,
    fontSize: TYPOGRAPHY.h4,
    color: PDF_COLORS.accent,
    letterSpacing: 2,
  },

  // Section header
  sectionHeader: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },

  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: TYPOGRAPHY.h2,
    color: PDF_COLORS.text,
    marginBottom: SPACING.xs,
  },

  sectionSubtitle: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.small,
    color: PDF_COLORS.textMuted,
  },

  // Content card
  card: {
    backgroundColor: PDF_COLORS.backgroundAlt,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  cardIcon: {
    fontSize: TYPOGRAPHY.h4,
    color: PDF_COLORS.accent,
    marginRight: SPACING.sm,
  },

  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: TYPOGRAPHY.h4,
    color: PDF_COLORS.text,
    flex: 1,
  },

  cardBody: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.textMuted,
    lineHeight: TYPOGRAPHY.lineHeightRelaxed,
  },

  // List items
  listItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },

  listBullet: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.accent,
    width: 20,
  },

  listText: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.textMuted,
    flex: 1,
    lineHeight: TYPOGRAPHY.lineHeightRelaxed,
  },

  // Spell/Crystal entry
  entry: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },

  entryTitle: {
    fontFamily: FONTS.heading,
    fontSize: TYPOGRAPHY.h3,
    color: PDF_COLORS.text,
    marginBottom: SPACING.xs,
  },

  entryMeta: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.small,
    color: PDF_COLORS.accent,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  entryBody: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.textMuted,
    lineHeight: TYPOGRAPHY.lineHeightRelaxed,
    marginBottom: SPACING.sm,
  },

  // Quote/Callout
  callout: {
    backgroundColor: '#1A1A2E',
    borderLeftWidth: 3,
    borderLeftColor: PDF_COLORS.accent,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },

  calloutText: {
    fontFamily: FONTS.accent,
    fontSize: TYPOGRAPHY.body,
    color: PDF_COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: TYPOGRAPHY.lineHeightRelaxed,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: PAGE.marginLeft,
    right: PAGE.marginRight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerText: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.tiny,
    color: PDF_COLORS.textSoft,
  },

  pageNumber: {
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.tiny,
    color: PDF_COLORS.textSoft,
  },

  // Decorative
  starDivider: {
    textAlign: 'center',
    color: PDF_COLORS.accent,
    fontSize: TYPOGRAPHY.h4,
    marginVertical: SPACING.lg,
    letterSpacing: 8,
  },
});

// ============================================
// COMPONENTS
// ============================================

interface PackDocumentProps {
  children: React.ReactNode;
}

export function PackDocument({ children }: PackDocumentProps) {
  return <Document>{children}</Document>;
}

interface CoverPageProps {
  category: string;
  title: string;
  tagline: string;
  description: string;
  accentColor?: string;
}

export function CoverPage({
  category,
  title,
  tagline,
  description,
  accentColor = PDF_COLORS.accent,
}: CoverPageProps) {
  return (
    <Page size='A4' style={styles.coverPage}>
      <View style={styles.coverContent}>
        <Text style={[styles.coverCategory, { color: accentColor }]}>
          {category}
        </Text>

        <Text style={styles.coverTitle}>{title}</Text>

        <Text style={styles.coverTagline}>{tagline}</Text>

        <View style={[styles.coverDivider, { backgroundColor: accentColor }]} />

        <Text style={styles.coverDescription}>{description}</Text>
      </View>

      <View style={styles.coverFooter}>
        <Text style={[styles.coverLogo, { color: accentColor }]}>☽ LUNARY</Text>
      </View>
    </Page>
  );
}

interface ContentPageProps {
  children: React.ReactNode;
  pageNumber?: number;
  totalPages?: number;
  packTitle?: string;
}

export function ContentPage({
  children,
  pageNumber,
  totalPages,
  packTitle,
}: ContentPageProps) {
  return (
    <Page size='A4' style={styles.page}>
      {children}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{packTitle || 'Lunary Pack'}</Text>
        {pageNumber && (
          <Text style={styles.pageNumber}>
            {pageNumber}
            {totalPages ? ` of ${totalPages}` : ''}
          </Text>
        )}
      </View>
    </Page>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function SectionHeader({
  title,
  subtitle,
  accentColor,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.sectionHeader,
        accentColor ? { borderBottomColor: accentColor } : {},
      ]}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface EntryProps {
  title: string;
  meta?: string;
  body: string;
  details?: string[];
}

export function Entry({ title, meta, body, details }: EntryProps) {
  return (
    <View style={styles.entry}>
      <Text style={styles.entryTitle}>{title}</Text>
      {meta && <Text style={styles.entryMeta}>{meta}</Text>}
      <Text style={styles.entryBody}>{body}</Text>

      {details && details.length > 0 && (
        <View>
          {details.map((detail, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>{DECORATIONS.starSymbol}</Text>
              <Text style={styles.listText}>{detail}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface CalloutProps {
  text: string;
  accentColor?: string;
}

export function Callout({ text, accentColor }: CalloutProps) {
  return (
    <View
      style={[
        styles.callout,
        accentColor ? { borderLeftColor: accentColor } : {},
      ]}
    >
      <Text style={styles.calloutText}>{text}</Text>
    </View>
  );
}

interface ListItemProps {
  text: string;
}

export function ListItem({ text }: ListItemProps) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listBullet}>{DECORATIONS.starSymbol}</Text>
      <Text style={styles.listText}>{text}</Text>
    </View>
  );
}

export function StarDivider() {
  return (
    <Text style={styles.starDivider}>
      {DECORATIONS.starSymbol} {DECORATIONS.starSymbol} {DECORATIONS.starSymbol}
    </Text>
  );
}

interface CardProps {
  title: string;
  icon?: string;
  body: string;
}

export function Card({ title, icon, body }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon && <Text style={styles.cardIcon}>{icon}</Text>}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

// Export styles for custom usage
export { styles as pdfStyles };
