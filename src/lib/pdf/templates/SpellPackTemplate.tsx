/**
 * Spell Pack PDF Template
 *
 * Generates a beautiful branded PDF for spell packs
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand colors
const COLORS = {
  background: '#0A0A0A',
  primary: '#8458D8',
  text: '#FFFFFF',
  textMuted: '#CCCCCC',
  textSoft: '#999999',
  border: '#2A2A2A',
};

// Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    padding: 50,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },
  coverPage: {
    backgroundColor: COLORS.background,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  coverCategory: {
    fontSize: 10,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 32,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
  coverTagline: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 32,
    textAlign: 'center',
  },
  coverDivider: {
    width: 100,
    height: 1,
    backgroundColor: COLORS.primary,
    marginBottom: 24,
  },
  coverDescription: {
    fontSize: 11,
    color: COLORS.textSoft,
    lineHeight: 1.6,
    textAlign: 'center',
    maxWidth: 400,
  },
  coverLogo: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 48,
  },
  sectionHeader: {
    marginBottom: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  paragraph: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  callout: {
    backgroundColor: '#1A1A2E',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 16,
    marginVertical: 16,
  },
  calloutText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 11,
    color: COLORS.primary,
    width: 20,
  },
  listText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 1.6,
  },
  spellTitle: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  spellMeta: {
    fontSize: 9,
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spellDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  materialsBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  materialsTitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  stepsTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'Helvetica-Bold',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    color: COLORS.primary,
    width: 24,
    fontFamily: 'Helvetica-Bold',
  },
  stepText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 1.6,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textSoft,
  },
  starDivider: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 14,
    marginVertical: 24,
    letterSpacing: 8,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 24,
    fontFamily: 'Helvetica-Bold',
  },
});

// Types
interface Spell {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  moonPhase: string;
  materials: string[];
  steps: string[];
  incantation: string;
}

interface SpellPackData {
  title: string;
  tagline: string;
  description: string;
  category: string;
  spells: Spell[];
  perfectFor: string[];
  introduction: string;
}

export function SpellPackTemplate({ data }: { data: SpellPackData }) {
  const spellCount = data.spells ? data.spells.length : 0;

  return (
    <Document>
      {/* Cover Page */}
      <Page size='A4' style={styles.coverPage}>
        <Text style={styles.coverCategory}>Spell Pack</Text>
        <Text style={styles.coverTitle}>{String(data.title)}</Text>
        <Text style={styles.coverTagline}>{String(data.tagline)}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverDescription}>{String(data.description)}</Text>
        <Text style={styles.coverLogo}>LUNARY</Text>
      </Page>

      {/* Introduction Page */}
      <Page size='A4' style={styles.page}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Welcome to Your Pack</Text>
          <Text style={styles.sectionSubtitle}>
            {String(spellCount)} spells curated for you
          </Text>
        </View>

        <Text style={styles.paragraph}>{String(data.introduction)}</Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Before beginning any spell, take a moment to centre yourself. Ground
            your energy, set your intention, and create sacred space.
          </Text>
        </View>

        {data.perfectFor && data.perfectFor.length > 0 && (
          <View>
            <Text style={styles.subheading}>Perfect For</Text>
            {data.perfectFor.map((item: string, index: number) => (
              <View key={String(index)} style={styles.listItem}>
                <Text style={styles.listBullet}>*</Text>
                <Text style={styles.listText}>{String(item)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{String(data.title)}</Text>
          <Text style={styles.footerText}>2</Text>
        </View>
      </Page>

      {/* Spell Pages */}
      {data.spells &&
        data.spells.map((spell: Spell, index: number) => (
          <Page key={String(spell.id)} size='A4' style={styles.page}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{String(spell.title)}</Text>
              <Text style={styles.sectionSubtitle}>
                {[spell.difficulty, spell.duration, spell.moonPhase]
                  .filter(Boolean)
                  .map(String)
                  .join(' | ')}
              </Text>
            </View>

            <Text style={styles.spellDescription}>
              {String(spell.description)}
            </Text>

            {spell.materials && spell.materials.length > 0 && (
              <View style={styles.materialsBox}>
                <Text style={styles.materialsTitle}>Materials Needed</Text>
                {spell.materials.map((material: string, i: number) => (
                  <View key={String(i)} style={styles.listItem}>
                    <Text style={styles.listBullet}>-</Text>
                    <Text style={styles.listText}>{String(material)}</Text>
                  </View>
                ))}
              </View>
            )}

            {spell.steps && spell.steps.length > 0 && (
              <View>
                <Text style={styles.stepsTitle}>Instructions</Text>
                {spell.steps.map((step: string, i: number) => (
                  <View key={String(i)} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{String(i + 1)}.</Text>
                    <Text style={styles.stepText}>{String(step)}</Text>
                  </View>
                ))}
              </View>
            )}

            {spell.incantation && (
              <View style={styles.callout}>
                <Text style={styles.calloutText}>
                  "{String(spell.incantation)}"
                </Text>
              </View>
            )}

            <Text style={styles.starDivider}>* * *</Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{String(data.title)}</Text>
              <Text style={styles.footerText}>{String(index + 3)}</Text>
            </View>
          </Page>
        ))}

      {/* Closing Page */}
      <Page size='A4' style={styles.page}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Blessed Be</Text>
          <Text style={styles.sectionSubtitle}>May your magic flow freely</Text>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Remember: the most powerful ingredient in any spell is your
            intention. Trust yourself, trust the process, and trust the magic
            that flows through you.
          </Text>
        </View>

        <Text
          style={[styles.paragraph, { marginTop: 32, textAlign: 'center' }]}
        >
          Thank you for choosing Lunary. May the stars guide your path.
        </Text>

        <Text
          style={[
            styles.paragraph,
            { textAlign: 'center', color: COLORS.primary },
          ]}
        >
          lunary.app
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{String(data.title)}</Text>
          <Text style={styles.footerText}>{String(spellCount + 3)}</Text>
        </View>
      </Page>
    </Document>
  );
}
