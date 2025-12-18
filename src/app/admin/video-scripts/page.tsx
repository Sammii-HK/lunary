'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Copy,
  Check,
  Video,
  Youtube,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  CheckCircle,
  Circle,
  PlayCircle,
  Image as ImageIcon,
  Code,
  ExternalLink,
} from 'lucide-react';

interface ScriptSection {
  name: string;
  duration: string;
  content: string;
}

interface TikTokMetadata {
  theme: string;
  title: string;
  summary: string;
}

interface VideoScript {
  id: number;
  themeId: string;
  themeName: string;
  facetTitle: string;
  platform: 'tiktok' | 'youtube';
  sections: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  scheduledDate: string;
  status: 'draft' | 'approved' | 'used';
  createdAt: string;
  metadata?: TikTokMetadata;
  coverImageUrl?: string;
  partNumber?: number;
}

interface WeekGroup {
  weekStart: string;
  theme: string;
  tiktok: VideoScript[];
  youtube: VideoScript[];
}

export default function VideoScriptsPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [expandedScript, setExpandedScript] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [hideCompleted, setHideCompleted] = useState(true);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/video-scripts');
      const data = await response.json();
      if (data.success) {
        setWeekGroups(data.byWeek || []);
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateScripts = async (week: 'current' | 'next') => {
    try {
      setGenerating(true);
      const response = await fetch('/api/admin/video-scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week }),
      });
      const data = await response.json();
      if (data.success) {
        await loadScripts();
      } else {
        alert(`Failed to generate: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate scripts:', error);
      alert('Failed to generate scripts');
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: 'draft' | 'approved' | 'used',
  ) => {
    try {
      setStatusUpdating(id);
      const response = await fetch(`/api/admin/video-scripts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state directly instead of reloading
        setWeekGroups((prev) =>
          prev.map((group) => ({
            ...group,
            tiktok: group.tiktok.map((s) =>
              s.id === id ? { ...s, status } : s,
            ),
            youtube: group.youtube.map((s) =>
              s.id === id ? { ...s, status } : s,
            ),
          })),
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusUpdating(null);
    }
  };

  const copyToClipboard = async (script: VideoScript) => {
    try {
      await navigator.clipboard.writeText(script.fullScript);
      setCopiedId(script.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getStatusBadge = (
    status: string,
    scriptId?: number,
    onStatusChange?: (status: 'draft' | 'approved' | 'used') => void,
  ) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Approved
          </Badge>
        );
      case 'used':
        return (
          <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
            <PlayCircle className='w-3 h-3 mr-1' />
            Used
          </Badge>
        );
      default:
        return (
          <Badge
            className={`bg-slate-500/20 text-slate-400 border-slate-500/30 ${onStatusChange ? 'cursor-pointer hover:bg-slate-500/30 hover:text-slate-300' : ''}`}
            onClick={
              onStatusChange
                ? (e) => {
                    e.stopPropagation();
                    onStatusChange('approved');
                  }
                : undefined
            }
          >
            <Circle className='w-3 h-3 mr-1' />
            Draft
            {onStatusChange && (
              <span className='ml-1 text-xs opacity-60'>
                → click to approve
              </span>
            )}
          </Badge>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') {
      return <Youtube className='w-5 h-5 text-red-500' />;
    }
    return <Video className='w-5 h-5 text-pink-500' />;
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-white'>Video Scripts</h1>
            <p className='text-slate-400 mt-1'>
              Generated speaking scripts for TikTok and YouTube
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <label className='flex items-center gap-2 text-sm text-slate-400 cursor-pointer'>
              <input
                type='checkbox'
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className='w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900'
              />
              Hide completed
            </label>
            <div className='flex gap-3'>
              <Button
                onClick={() => generateScripts('current')}
                disabled={generating}
                variant='outline'
                className='border-slate-700 text-slate-300 hover:bg-slate-800'
              >
                {generating ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  <Sparkles className='w-4 h-4 mr-2' />
                )}
                This Week
              </Button>
              <Button
                onClick={() => generateScripts('next')}
                disabled={generating}
                className='bg-violet-600 hover:bg-violet-700'
              >
                {generating ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  <Calendar className='w-4 h-4 mr-2' />
                )}
                Next Week
              </Button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-violet-500' />
          </div>
        )}

        {/* Empty State */}
        {!loading && weekGroups.length === 0 && (
          <Card className='bg-slate-900/50 border-slate-800'>
            <CardContent className='py-12 text-center'>
              <Video className='w-12 h-12 mx-auto text-slate-600 mb-4' />
              <h3 className='text-lg font-medium text-white mb-2'>
                No scripts generated yet
              </h3>
              <p className='text-slate-400 mb-6'>
                Generate your first week of video scripts to get started.
              </p>
              <Button
                onClick={() => generateScripts('current')}
                disabled={generating}
                className='bg-violet-600 hover:bg-violet-700'
              >
                <Sparkles className='w-4 h-4 mr-2' />
                Generate This Week
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Week Groups */}
        {!loading &&
          weekGroups.map((group) => {
            // Filter scripts based on hideCompleted setting (hides both 'approved' and 'used')
            const filteredTiktok = hideCompleted
              ? group.tiktok.filter((s) => s.status === 'draft')
              : group.tiktok;
            const filteredYoutube = hideCompleted
              ? group.youtube.filter((s) => s.status === 'draft')
              : group.youtube;

            // Skip weeks with no visible scripts
            if (filteredTiktok.length === 0 && filteredYoutube.length === 0) {
              return null;
            }

            return (
              <Card
                key={group.weekStart}
                className='bg-slate-900/50 border-slate-800'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-white flex items-center gap-2'>
                        <Calendar className='w-5 h-5 text-violet-500' />
                        Week of {formatWeekRange(group.weekStart)}
                      </CardTitle>
                      <CardDescription className='mt-1'>
                        Theme: {group.theme}
                      </CardDescription>
                    </div>
                    <div className='flex gap-2 text-sm text-slate-400'>
                      <span className='flex items-center gap-1'>
                        <Video className='w-4 h-4 text-pink-500' />
                        {filteredTiktok.length} TikTok
                      </span>
                      <span className='flex items-center gap-1'>
                        <Youtube className='w-4 h-4 text-red-500' />
                        {filteredYoutube.length} YouTube
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* TikTok Scripts */}
                  {filteredTiktok.map((script) => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      expanded={expandedScript === script.id}
                      onToggle={() =>
                        setExpandedScript(
                          expandedScript === script.id ? null : script.id,
                        )
                      }
                      onCopy={() => copyToClipboard(script)}
                      onStatusChange={(status) =>
                        updateStatus(script.id, status)
                      }
                      copied={copiedId === script.id}
                      updating={statusUpdating === script.id}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                      getPlatformIcon={getPlatformIcon}
                    />
                  ))}

                  {/* YouTube Script */}
                  {filteredYoutube.map((script) => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      expanded={expandedScript === script.id}
                      onToggle={() =>
                        setExpandedScript(
                          expandedScript === script.id ? null : script.id,
                        )
                      }
                      onCopy={() => copyToClipboard(script)}
                      onStatusChange={(status) =>
                        updateStatus(script.id, status)
                      }
                      copied={copiedId === script.id}
                      updating={statusUpdating === script.id}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                      getPlatformIcon={getPlatformIcon}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

// Script Card Component
function ScriptCard({
  script,
  expanded,
  onToggle,
  onCopy,
  onStatusChange,
  copied,
  updating,
  formatDate,
  getStatusBadge,
  getPlatformIcon,
}: {
  script: VideoScript;
  expanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onStatusChange: (status: 'draft' | 'approved' | 'used') => void;
  copied: boolean;
  updating: boolean;
  formatDate: (date: string) => string;
  getStatusBadge: (
    status: string,
    scriptId?: number,
    onStatusChange?: (status: 'draft' | 'approved' | 'used') => void,
  ) => React.ReactNode;
  getPlatformIcon: (platform: string) => React.ReactNode;
}) {
  return (
    <div className='border border-slate-700/50 rounded-lg overflow-hidden'>
      {/* Header */}
      <div
        className='flex items-center justify-between p-4 bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors'
        onClick={onToggle}
      >
        <div className='flex items-center gap-4'>
          {getPlatformIcon(script.platform)}
          <div>
            <h4 className='font-medium text-white'>{script.facetTitle}</h4>
            <div className='flex items-center gap-3 text-sm text-slate-400 mt-1'>
              <span className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                {formatDate(script.scheduledDate)}
              </span>
              <span className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {script.estimatedDuration}
              </span>
              <span className='flex items-center gap-1'>
                <FileText className='w-3 h-3' />
                {script.wordCount} words
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {getStatusBadge(script.status, script.id, onStatusChange)}
          {expanded ? (
            <ChevronUp className='w-5 h-5 text-slate-400' />
          ) : (
            <ChevronDown className='w-5 h-5 text-slate-400' />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <TikTokExpandedContent
          script={script}
          onCopy={onCopy}
          onStatusChange={onStatusChange}
          copied={copied}
          updating={updating}
        />
      )}
    </div>
  );
}

// Expanded Content Component with TikTok metadata and cover image
function TikTokExpandedContent({
  script,
  onCopy,
  onStatusChange,
  copied,
  updating,
}: {
  script: VideoScript;
  onCopy: () => void;
  onStatusChange: (status: 'draft' | 'approved' | 'used') => void;
  copied: boolean;
  updating: boolean;
}) {
  const [metadataCopied, setMetadataCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Convert absolute URL to relative for local preview
  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    // If it's an absolute URL with lunary.app, extract the path for local preview
    if (url.includes('lunary.app')) {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
      } catch {
        return url;
      }
    }
    return url;
  };

  const previewUrl = getPreviewUrl(script.coverImageUrl);

  const copyMetadata = async () => {
    if (script.metadata) {
      await navigator.clipboard.writeText(
        JSON.stringify(script.metadata, null, 2),
      );
      setMetadataCopied(true);
      setTimeout(() => setMetadataCopied(false), 2000);
    }
  };

  const copyImageUrl = async () => {
    if (script.coverImageUrl) {
      await navigator.clipboard.writeText(script.coverImageUrl);
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2000);
    }
  };

  // Aspect ratio based on platform
  const isYouTube = script.platform === 'youtube';
  const aspectRatio = isYouTube ? 'aspect-video' : 'aspect-[9/16]';
  const imageWidth = isYouTube ? 'w-48' : 'w-32';

  return (
    <div className='p-4 border-t border-slate-700/50 space-y-4'>
      {/* Cover Image and Metadata */}
      {(script.metadata || script.coverImageUrl) && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-700/50'>
          {/* Cover Image Preview */}
          {script.coverImageUrl && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span
                  className={`text-sm font-medium flex items-center gap-2 ${isYouTube ? 'text-red-400' : 'text-pink-400'}`}
                >
                  <ImageIcon className='w-4 h-4' />
                  Cover Image
                </span>
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={copyImageUrl}
                    className='h-7 text-xs text-slate-400 hover:text-white'
                  >
                    {imageCopied ? (
                      <Check className='w-3 h-3 mr-1 text-green-500' />
                    ) : (
                      <Copy className='w-3 h-3 mr-1' />
                    )}
                    {imageCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <a
                    href={script.coverImageUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center h-7 px-2 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-700/50'
                  >
                    <ExternalLink className='w-3 h-3 mr-1' />
                    Open
                  </a>
                </div>
              </div>
              <a
                href={script.coverImageUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={`block relative ${aspectRatio} ${imageWidth} rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-pink-500/50 transition-colors`}
              >
                {imageLoading && !imageError && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Loader2 className='w-5 h-5 text-slate-500 animate-spin' />
                  </div>
                )}
                {imageError && (
                  <div className='absolute inset-0 flex items-center justify-center text-slate-500 text-xs p-2 text-center'>
                    <ExternalLink className='w-4 h-4 mr-1' />
                    View
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={script.facetTitle}
                  className={`w-full h-full object-cover ${imageLoading || imageError ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                  onLoad={() => {
                    setImageLoading(false);
                    setImageError(false);
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </a>
            </div>
          )}

          {/* Metadata JSON */}
          {script.metadata && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-pink-400 flex items-center gap-2'>
                  <Code className='w-4 h-4' />
                  Overlay Metadata
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={copyMetadata}
                  className='h-7 text-xs text-slate-400 hover:text-white'
                >
                  {metadataCopied ? (
                    <Check className='w-3 h-3 mr-1 text-green-500' />
                  ) : (
                    <Copy className='w-3 h-3 mr-1' />
                  )}
                  {metadataCopied ? 'Copied' : 'Copy JSON'}
                </Button>
              </div>
              <pre className='bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto font-mono'>
                {JSON.stringify(script.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Complete Script */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-violet-400'>
            Complete Script
          </span>
          <span className='text-xs text-slate-500'>
            {script.estimatedDuration} • {script.wordCount} words
          </span>
        </div>
        <p className='text-slate-300 text-sm leading-relaxed whitespace-pre-wrap'>
          {script.fullScript}
        </p>
      </div>

      {/* Section Breakdown (for reference) */}
      {script.sections.length > 1 && (
        <details className='mt-4'>
          <summary className='text-sm font-medium text-slate-400 cursor-pointer hover:text-slate-300'>
            Section Breakdown (for reference)
          </summary>
          <div className='mt-2 space-y-3'>
            {script.sections.map((section, idx) => (
              <div
                key={idx}
                className='space-y-1 pl-4 border-l-2 border-slate-700'
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-medium text-violet-400'>
                    {section.name}
                  </span>
                  <span className='text-xs text-slate-500'>
                    {section.duration}
                  </span>
                </div>
                <p className='text-slate-400 text-xs leading-relaxed whitespace-pre-wrap'>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between pt-4 border-t border-slate-700/50'>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={onCopy}
            className='border-slate-700 text-slate-300 hover:bg-slate-800'
          >
            {copied ? (
              <Check className='w-4 h-4 mr-1 text-green-500' />
            ) : (
              <Copy className='w-4 h-4 mr-1' />
            )}
            {copied ? 'Copied' : 'Copy Script'}
          </Button>
        </div>
        <div className='flex gap-2'>
          {script.status !== 'approved' && (
            <Button
              size='sm'
              onClick={() => onStatusChange('approved')}
              disabled={updating}
              className='bg-green-600 hover:bg-green-700'
            >
              {updating ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <CheckCircle className='w-4 h-4 mr-1' />
              )}
              Approve
            </Button>
          )}
          {script.status === 'approved' && (
            <Button
              size='sm'
              onClick={() => onStatusChange('used')}
              disabled={updating}
              className='bg-blue-600 hover:bg-blue-700'
            >
              {updating ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <PlayCircle className='w-4 h-4 mr-1' />
              )}
              Mark Used
            </Button>
          )}
          {script.status !== 'draft' && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => onStatusChange('draft')}
              disabled={updating}
              className='border-slate-700 text-slate-300 hover:bg-slate-800'
            >
              Reset to Draft
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
