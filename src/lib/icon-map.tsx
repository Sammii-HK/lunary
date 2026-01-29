import React from 'react';
import {
  Sparkles,
  Calendar,
  Telescope,
  MessageCircle,
  BookOpen,
  Shield,
  Laptop,
  HelpCircle,
  Zap,
  Target,
  Users,
  TrendingUp,
  Lock,
  Settings,
  CheckCircle,
  XCircle,
  Star,
  CreditCard,
  Database,
  Coffee,
  BarChart,
  Globe,
  Smartphone,
  Mail,
  ExternalLink,
  Search,
} from 'lucide-react';

// Icon lookup map
export const ICON_MAP = {
  Sparkles,
  Calendar,
  Telescope,
  MessageCircle,
  BookOpen,
  Shield,
  Laptop,
  HelpCircle,
  Zap,
  Target,
  Users,
  TrendingUp,
  Lock,
  Settings,
  CheckCircle,
  XCircle,
  Star,
  CreditCard,
  Database,
  Coffee,
  BarChart,
  Globe,
  Smartphone,
  Mail,
  ExternalLink,
  Search,
} as const;

export type IconName = keyof typeof ICON_MAP;

// Helper to get icon component by name
export function getIcon(
  name: IconName,
  className?: string,
): React.ReactElement {
  const IconComponent = ICON_MAP[name];
  return <IconComponent className={className} />;
}
