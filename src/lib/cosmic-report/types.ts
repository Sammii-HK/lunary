export type CosmicReportType = 'weekly' | 'monthly' | 'custom';

export interface CosmicReportSection {
  key: string;
  title: string;
  summary: string;
  highlights: string[];
  actionSteps?: string[];
  energyLevel?: 'low' | 'medium' | 'high';
}

export interface CosmicReportData {
  title: string;
  subtitle: string;
  reportType: CosmicReportType;
  generatedFor?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  sections: CosmicReportSection[];
  metadata?: Record<string, unknown>;
}

export interface CosmicReportRecord extends CosmicReportData {
  id: number;
  shareToken?: string | null;
  shareUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  expiresAt?: string | null;
  isPublic?: boolean;
  userId?: string | null;
}

export const COSMIC_SECTIONS: Record<CosmicReportType, string[]> = {
  weekly: ['transits', 'moon', 'tarot', 'mood'],
  monthly: ['transits', 'moon', 'major themes', 'career', 'love'],
  custom: ['spotlight', 'energy', 'rituals', 'reflections'],
};
