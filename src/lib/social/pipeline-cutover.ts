export type SocialPipelineOwner = 'lunary' | 'content-creator';

export function getSocialPipelineOwner(): SocialPipelineOwner {
  return 'content-creator';
}

export function shouldLunaryRunSocialPipeline(): boolean {
  return false;
}

export function buildLegacySocialSkipResponse(scope: string) {
  const owner = getSocialPipelineOwner();
  return {
    success: true,
    skipped: true,
    owner,
    scope,
    reason:
      owner === 'content-creator'
        ? 'Legacy Lunary social pipeline disabled; content-creator is the active owner'
        : 'Legacy Lunary social pipeline enabled',
  };
}
