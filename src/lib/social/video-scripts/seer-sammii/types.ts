/**
 * Types for Seer Sammii first-person video scripts
 */

export interface SeerSammiiScript {
  id?: number;
  talkingPoints: string[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  topic: string;
  caption: string;
  hashtags: string[];
  cta: string;
  transitContext: string;
  scheduledDate: Date;
  status: 'draft' | 'approved' | 'used';
  createdAt?: Date;
}

export interface SeerSammiiTalkingPoints {
  topic: string;
  points: string[];
  transitContext: string;
}
