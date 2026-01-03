import type { Metadata } from 'next';
import { GeneratorClient } from './GeneratorClient';

export const metadata: Metadata = {
  title: 'Cosmic Report Generator · Lunary',
  description:
    'Generate personalized cosmic reports with Lunary. Choose report type, sections, share options, and export as PDF.',
};

export default function CosmicReportGeneratorPage() {
  return <GeneratorClient />;
}
