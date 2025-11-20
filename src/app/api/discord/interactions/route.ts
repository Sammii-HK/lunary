import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import {
  DiscordInteraction,
  InteractionType,
  InteractionResponseType,
  ApplicationCommandData,
} from '@/lib/discord-bot/types';
import { handleCommand } from '@/lib/discord-bot/commands';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';

function verifySignature(
  body: string,
  signature: string,
  timestamp: string,
): boolean {
  if (!DISCORD_PUBLIC_KEY) {
    console.error('DISCORD_PUBLIC_KEY not configured');
    return false;
  }

  try {
    const message = new TextEncoder().encode(timestamp + body);
    const publicKeyBytes = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');
    const signatureBytes = Buffer.from(signature, 'hex');

    return nacl.sign.detached.verify(message, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    // Parse interaction first to check type
    let interaction: DiscordInteraction;
    try {
      interaction = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse interaction body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Handle PING immediately (Discord's verification)
    if (interaction.type === InteractionType.PING) {
      // For PING, verify signature if present, but respond with PONG regardless
      // This handles both verification (with signature) and regular PINGs
      if (signature && timestamp) {
        if (!verifySignature(body, signature, timestamp)) {
          console.error('Invalid signature for PING');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 },
          );
        }
      }

      return NextResponse.json({
        type: InteractionResponseType.PONG,
      });
    }

    // For all other interaction types, signature is required
    if (!signature || !timestamp) {
      console.error('Missing signature headers for non-PING interaction');
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 401 },
      );
    }

    if (!verifySignature(body, signature, timestamp)) {
      console.error('Invalid signature for interaction');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const commandData = interaction.data as ApplicationCommandData;
      const commandName = commandData.name;
      const options = commandData.options || [];

      const responseData = await handleCommand(commandName, options);

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: responseData,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported interaction type' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Discord interaction error:', error);
    return NextResponse.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'An error occurred processing your command.',
        },
      },
      { status: 200 },
    );
  }
}
