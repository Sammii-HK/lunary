import { SUBSTACK_CONFIG } from '../../src/config/substack';
import { SubstackPost } from './contentFormatter';
import { SubstackClient, createSubstackClient, PublishResult } from './client';

export type { PublishResult };

export async function publishToSubstack(
  post: SubstackPost,
  tier: 'free' | 'paid',
): Promise<PublishResult> {
  if (!SUBSTACK_CONFIG.publicationUrl) {
    return {
      success: false,
      error: 'Substack publication URL not configured',
      tier,
    };
  }

  try {
    const client = await createSubstackClient();

    if (!client) {
      return {
        success: false,
        error:
          'Failed to create Substack client. Please ensure cookies are configured.',
        tier,
      };
    }

    const audience = tier === 'paid' ? 'only_paid' : 'everyone';

    console.log(`📝 Publishing ${tier} post: "${post.title}"`);

    const result = await client.createAndPublish(post.title, post.content, {
      subtitle: post.subtitle,
      audience,
      sendEmail: true,
    });

    if (result.success) {
      console.log(`✅ ${tier} post published: ${result.postUrl}`);
      return {
        success: true,
        postUrl: result.postUrl,
        tier,
      };
    } else {
      return {
        success: false,
        error: result.error,
        tier,
      };
    }
  } catch (error) {
    console.error('Error publishing to Substack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tier,
    };
  }
}

export async function publishBothTiers(
  freePost: SubstackPost,
  paidPost: SubstackPost,
): Promise<{ free: PublishResult; paid: PublishResult }> {
  console.log('📬 Publishing both free and paid posts to Substack...');

  const freeResult = await publishToSubstack(freePost, 'free');
  const paidResult = await publishToSubstack(paidPost, 'paid');

  return {
    free: freeResult,
    paid: paidResult,
  };
}

export async function verifySubstackConnection(): Promise<{
  authenticated: boolean;
  publication?: { name: string; subdomain: string };
  error?: string;
}> {
  try {
    const client = await createSubstackClient();

    if (!client) {
      return {
        authenticated: false,
        error: 'No Substack cookies configured',
      };
    }

    const result = await client.verifyAuthentication();

    if (result.authenticated && result.publication) {
      return {
        authenticated: true,
        publication: {
          name: result.publication.name,
          subdomain: result.publication.subdomain,
        },
      };
    }

    return {
      authenticated: false,
      error: result.error || 'Authentication failed',
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
