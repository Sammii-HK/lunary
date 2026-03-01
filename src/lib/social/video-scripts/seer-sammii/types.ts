/**
 * Types for Seer Sammii first-person video scripts
 */

export type ScriptContentType =
  | 'transit_report'
  | 'teaching'
  | 'spell_suggestion'
  | 'crystal_recommendation'
  | 'myth_bust';

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
  contentType?: ScriptContentType;
  transitContext: string;
  scheduledDate: Date;
  status: 'draft' | 'approved' | 'used';
  createdAt?: Date;
}

export interface SeerSammiiTalkingPoints {
  topic: string;
  points: string[];
  transitContext: string;
  contentType?: ScriptContentType;
}
