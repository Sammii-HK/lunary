import React from 'react';
import { Composition } from 'remotion';
import {
  ShortFormVideo,
  ShortFormVideoProps,
} from './compositions/ShortFormVideo';
import {
  MediumFormVideo,
  MediumFormVideoProps,
} from './compositions/MediumFormVideo';
import {
  LongFormVideo,
  LongFormVideoProps,
} from './compositions/LongFormVideo';
import { AppDemoVideo, AppDemoVideoProps } from './compositions/AppDemoVideo';
import {
  LandscapeShowcase,
  LandscapeShowcaseProps,
} from './compositions/LandscapeShowcase';
import {
  MultiPhoneShowcase,
  MultiPhoneShowcaseProps,
} from './compositions/MultiPhoneShowcase';
import {
  CinematicPhoneDemo,
  CinematicPhoneDemoProps,
} from './compositions/CinematicPhoneDemo';
import { DIMENSIONS } from './styles/theme';

/**
 * Remotion Video Registration
 *
 * Defines all available video compositions with their default props
 */

// Default props for preview/development
const defaultShortFormProps: ShortFormVideoProps = {
  hookText: "What's the universe saying this week?",
  hookSubtitle: 'Your weekly cosmic forecast',
  segments: [
    {
      text: 'The stars are aligning for new beginnings.',
      startTime: 3,
      endTime: 6,
    },
    {
      text: 'Mercury enters a new phase, bringing clarity.',
      startTime: 6,
      endTime: 10,
    },
    { text: 'Trust your intuition this week.', startTime: 10, endTime: 14 },
  ],
  highlightTerms: ['Mercury', 'intuition', 'stars'],
};

const defaultMediumFormProps: MediumFormVideoProps = {
  segments: [
    {
      text: 'This week begins with powerful lunar energy.',
      startTime: 3,
      endTime: 7,
      topic: 'Moon Phase',
    },
    {
      text: 'The Full Moon in Leo illuminates your creativity.',
      startTime: 7,
      endTime: 12,
      topic: 'Moon Phase',
    },
    {
      text: 'Venus aligns with Neptune, enhancing intuition.',
      startTime: 12,
      endTime: 17,
      topic: 'Planetary Transit',
    },
    {
      text: 'Set intentions for abundance and love.',
      startTime: 17,
      endTime: 22,
      topic: 'Guidance',
    },
  ],
  highlightTerms: ['Full Moon', 'Leo', 'Venus', 'Neptune'],
};

const defaultLongFormProps: LongFormVideoProps = {
  title: 'Weekly Cosmic Forecast',
  subtitle: 'Week of January 20-26, 2026',
  segments: [
    {
      text: 'Welcome to your weekly cosmic forecast.',
      startTime: 5,
      endTime: 10,
    },
    {
      text: 'This week brings transformative energy.',
      startTime: 10,
      endTime: 15,
      topic: 'Overview',
    },
    {
      text: 'The Sun moves into Aquarius, sparking innovation.',
      startTime: 15,
      endTime: 22,
      topic: 'Sun Transit',
    },
    {
      text: "Mercury's influence brings clarity to communication.",
      startTime: 22,
      endTime: 30,
      topic: 'Mercury',
    },
  ],
  highlightTerms: ['Aquarius', 'Mercury', 'Sun'],
  lowerThirdInfo: {
    title: 'Lunary',
    subtitle: 'Your Cosmic Guide',
  },
};

const defaultAppDemoProps: AppDemoVideoProps = {
  videoSrc: 'app-demos/dashboard-overview.webm',
  hookText: "Wait... your app doesn't show houses?",
  hookStartTime: 0,
  hookEndTime: 2,
  overlays: [
    {
      text: 'your chart. not your sign.',
      startTime: 2,
      endTime: 4,
      style: 'chapter',
    },
    {
      text: 'every planet + YOUR houses',
      startTime: 5,
      endTime: 7,
      style: 'chapter',
    },
  ],
  outroText: 'Every morning. Your chart.',
  outroStartTime: 16,
  outroEndTime: 18,
  highlightTerms: ['houses', 'chart'],
};

// Cast components to work around Remotion's strict typing
const ShortFormVideoComponent = ShortFormVideo as unknown as React.FC<
  Record<string, unknown>
>;
const MediumFormVideoComponent = MediumFormVideo as unknown as React.FC<
  Record<string, unknown>
>;
const LongFormVideoComponent = LongFormVideo as unknown as React.FC<
  Record<string, unknown>
>;
const AppDemoVideoComponent = AppDemoVideo as unknown as React.FC<
  Record<string, unknown>
>;
const LandscapeShowcaseComponent = LandscapeShowcase as unknown as React.FC<
  Record<string, unknown>
>;
const MultiPhoneShowcaseComponent = MultiPhoneShowcase as unknown as React.FC<
  Record<string, unknown>
>;
const CinematicPhoneDemoComponent = CinematicPhoneDemo as unknown as React.FC<
  Record<string, unknown>
>;

// Default props for new compositions
const defaultLandscapeShowcaseProps: LandscapeShowcaseProps = {
  scenes: [
    {
      headline: 'Good morning, [name].',
      subline: 'Personalised from the moment you open it.',
      callout: 'Your chart. Today.',
      videoSrc: 'app-demos/dashboard-overview.webm',
      seekToSeconds: 1,
      startTime: 0,
      endTime: 7,
      calloutSide: 'right',
    },
    {
      headline: 'Every planet. Your houses.',
      subline: 'Not generic sky positions — yours.',
      callout: 'Sky Now expanded',
      videoSrc: 'app-demos/dashboard-overview.webm',
      seekToSeconds: 6,
      startTime: 7,
      endTime: 14,
      calloutSide: 'right',
    },
  ],
  backgroundType: 'starfield',
};

const defaultMultiPhoneShowcaseProps: MultiPhoneShowcaseProps = {
  phones: [
    { videoSrc: 'app-demos/dashboard-overview.webm', seekToSeconds: 1 },
    { videoSrc: 'app-demos/birth-chart.webm', seekToSeconds: 1 },
    { videoSrc: 'app-demos/horoscope-deepdive.webm', seekToSeconds: 8 },
    { videoSrc: 'app-demos/tarot-patterns.webm', seekToSeconds: 5 },
    { videoSrc: 'app-demos/astral-guide.webm', seekToSeconds: 4 },
  ],
  layout: 'arc',
  backgroundType: 'starfield',
  animate: false,
};

const defaultCinematicPhoneDemoProps: CinematicPhoneDemoProps = {
  videoSrc: 'app-demos/dashboard-overview.webm',
  hookText: "Wait... your app doesn't show houses?",
  hookStartTime: 0,
  hookEndTime: 2,
  overlays: [
    {
      text: 'your chart. not your sign.',
      startTime: 2,
      endTime: 4,
      style: 'chapter',
    },
  ],
  outroText: 'Every morning. Your chart.',
  outroStartTime: 16,
  outroEndTime: 18,
  highlightTerms: ['houses', 'chart'],
  backgroundType: 'starfield',
};

export const RemotionVideo: React.FC = () => {
  return (
    <>
      {/* Short Form - TikTok/Stories (9:16) */}
      <Composition
        id='ShortFormVideo'
        component={ShortFormVideoComponent}
        durationInFrames={450} // 15 seconds
        fps={30}
        width={DIMENSIONS.story.width}
        height={DIMENSIONS.story.height}
        defaultProps={defaultShortFormProps}
      />

      {/* Medium Form - Reels/TikTok Extended (9:16) */}
      <Composition
        id='MediumFormVideo'
        component={MediumFormVideoComponent}
        durationInFrames={1800} // 60 seconds
        fps={30}
        width={DIMENSIONS.story.width}
        height={DIMENSIONS.story.height}
        defaultProps={defaultMediumFormProps}
      />

      {/* Long Form - YouTube (16:9) */}
      <Composition
        id='LongFormVideo'
        component={LongFormVideoComponent}
        durationInFrames={9000} // 5 minutes
        fps={30}
        width={DIMENSIONS.youtube.width}
        height={DIMENSIONS.youtube.height}
        defaultProps={defaultLongFormProps}
      />

      {/* App Demo - TikTok with screen recording background (9:16) */}
      <Composition
        id='AppDemoVideo'
        component={AppDemoVideoComponent}
        durationInFrames={540} // 18 seconds default
        fps={30}
        width={DIMENSIONS.story.width}
        height={DIMENSIONS.story.height}
        defaultProps={defaultAppDemoProps}
      />

      {/* App Demo - Instagram Feed (4:5) */}
      <Composition
        id='AppDemoVideoFeed'
        component={AppDemoVideoComponent}
        durationInFrames={540} // 18 seconds default
        fps={30}
        width={DIMENSIONS.feed.width}
        height={DIMENSIONS.feed.height}
        defaultProps={defaultAppDemoProps}
      />

      {/* App Demo - X / Twitter (16:9) */}
      <Composition
        id='AppDemoVideoX'
        component={AppDemoVideoComponent}
        durationInFrames={540} // 18 seconds default
        fps={30}
        width={DIMENSIONS.xVideo.width}
        height={DIMENSIONS.xVideo.height}
        defaultProps={defaultAppDemoProps}
      />

      {/* Landscape Showcase - YouTube / X marketing (16:9, 1920×1080) */}
      <Composition
        id='LandscapeShowcase'
        component={LandscapeShowcaseComponent}
        durationInFrames={1350} // 45 seconds default
        fps={30}
        width={DIMENSIONS.youtube.width}
        height={DIMENSIONS.youtube.height}
        defaultProps={defaultLandscapeShowcaseProps}
      />

      {/* Landscape Showcase - Square (1:1, 1080×1080) */}
      <Composition
        id='LandscapeShowcaseSquare'
        component={LandscapeShowcaseComponent}
        durationInFrames={1350}
        fps={30}
        width={DIMENSIONS.square.width}
        height={DIMENSIONS.square.height}
        defaultProps={defaultLandscapeShowcaseProps}
      />

      {/* Multi-Phone Showcase - YouTube / X static hero (16:9, 1920×1080) */}
      <Composition
        id='MultiPhoneShowcase'
        component={MultiPhoneShowcaseComponent}
        durationInFrames={300} // 10 seconds (or frame 0 for still)
        fps={30}
        width={DIMENSIONS.youtube.width}
        height={DIMENSIONS.youtube.height}
        defaultProps={defaultMultiPhoneShowcaseProps}
      />

      {/* Multi-Phone Showcase - Square (1:1, 1080×1080) */}
      <Composition
        id='MultiPhoneShowcaseSquare'
        component={MultiPhoneShowcaseComponent}
        durationInFrames={300}
        fps={30}
        width={DIMENSIONS.square.width}
        height={DIMENSIONS.square.height}
        defaultProps={defaultMultiPhoneShowcaseProps}
      />

      {/* Cinematic Phone Demo - TikTok with phone frame (9:16, 1080×1920) */}
      <Composition
        id='CinematicPhoneDemo'
        component={CinematicPhoneDemoComponent}
        durationInFrames={540} // 18 seconds default
        fps={30}
        width={DIMENSIONS.story.width}
        height={DIMENSIONS.story.height}
        defaultProps={defaultCinematicPhoneDemoProps}
      />
    </>
  );
};

export default RemotionVideo;
