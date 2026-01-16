import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  computeUsageSnapshot,
  getSubscription,
  mapRowToReading,
} from '../shared';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest, context: unknown) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { params } = (context || {}) as { params: { id: string } };

    const result = await sql`
      SELECT id,
             spread_slug,
             spread_name,
             plan_snapshot,
             cards,
             summary,
             highlights,
             journaling_prompts,
             notes,
             tags,
             metadata,
             created_at,
             updated_at
      FROM tarot_readings
      WHERE id = ${params.id}
        AND user_id = ${userId}
        AND archived_at IS NULL
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const reading = mapRowToReading(result.rows[0]);

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('[tarot/readings/:id] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load reading' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: unknown) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { params } = (context || {}) as { params: { id: string } };

    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 },
      );
    }

    const body = JSON.parse(bodyText);
    let notesValue: string | null | undefined = undefined;
    let tagsValue: string[] | null | undefined = undefined;

    if (Object.prototype.hasOwnProperty.call(body, 'notes')) {
      if (body.notes === null || body.notes === '') {
        notesValue = null;
      } else if (typeof body.notes === 'string') {
        notesValue = body.notes.slice(0, 5000);
      } else {
        return NextResponse.json(
          { error: 'notes must be a string or null' },
          { status: 400 },
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'tags')) {
      if (body.tags === null) {
        tagsValue = null;
      } else if (Array.isArray(body.tags)) {
        tagsValue = body.tags.filter((tag: unknown) => typeof tag === 'string');
      } else {
        return NextResponse.json(
          { error: 'tags must be an array of strings or null' },
          { status: 400 },
        );
      }
    }

    if (notesValue === undefined && tagsValue === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const tagsSqlValue =
      tagsValue === undefined
        ? undefined
        : tagsValue === null
          ? null
          : (tagsValue as string[]);

    let updateResult;
    if (notesValue !== undefined && tagsValue !== undefined) {
      updateResult = await sql`
          UPDATE tarot_readings
          SET notes = ${notesValue},
                tags = ${tagsSqlValue}::text[],
              updated_at = NOW()
            WHERE id = ${params.id}
            AND user_id = ${userId}
            AND archived_at IS NULL
        RETURNING id,
                  spread_slug,
                  spread_name,
                  plan_snapshot,
                  cards,
                  summary,
                  highlights,
                  journaling_prompts,
                  notes,
                  tags,
                  metadata,
                  created_at,
                  updated_at
      `;
    } else if (notesValue !== undefined) {
      updateResult = await sql`
          UPDATE tarot_readings
          SET notes = ${notesValue},
              updated_at = NOW()
            WHERE id = ${params.id}
            AND user_id = ${userId}
            AND archived_at IS NULL
        RETURNING id,
                  spread_slug,
                  spread_name,
                  plan_snapshot,
                  cards,
                  summary,
                  highlights,
                  journaling_prompts,
                  notes,
                  tags,
                  metadata,
                  created_at,
                  updated_at
      `;
    } else {
      updateResult = await sql`
          UPDATE tarot_readings
            SET tags = ${tagsSqlValue}::text[],
              updated_at = NOW()
            WHERE id = ${params.id}
            AND user_id = ${userId}
            AND archived_at IS NULL
        RETURNING id,
                  spread_slug,
                  spread_name,
                  plan_snapshot,
                  cards,
                  summary,
                  highlights,
                  journaling_prompts,
                  notes,
                  tags,
                  metadata,
                  created_at,
                  updated_at
      `;
    }

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const subscription = await getSubscription(userId);
    const usage = await computeUsageSnapshot(userId, subscription);

    return NextResponse.json({
      reading: mapRowToReading(updateResult.rows[0]),
      usage,
    });
  } catch (error) {
    console.error('[tarot/readings/:id] PATCH failed', error);
    return NextResponse.json(
      { error: 'Failed to update reading' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: unknown) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { params } = (context || {}) as { params: { id: string } };

    const result = await sql`
      UPDATE tarot_readings
      SET archived_at = NOW(),
          updated_at = NOW()
      WHERE id = ${params.id}
        AND user_id = ${userId}
        AND archived_at IS NULL
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const subscription = await getSubscription(userId);
    const usage = await computeUsageSnapshot(userId, subscription);

    return NextResponse.json({ success: true, usage });
  } catch (error) {
    console.error('[tarot/readings/:id] DELETE failed', error);
    return NextResponse.json(
      { error: 'Failed to archive reading' },
      { status: 500 },
    );
  }
}
