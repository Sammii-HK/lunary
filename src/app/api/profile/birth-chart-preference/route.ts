import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { houseSystem } = await request.json();

    // Validate house system
    const validSystems = [
      'placidus',
      'whole-sign',
      'koch',
      'porphyry',
      'alcabitius',
    ];
    if (!validSystems.includes(houseSystem)) {
      return NextResponse.json(
        { error: 'Invalid house system' },
        { status: 400 },
      );
    }

    // Update user's house system preference
    await prisma.user.update({
      where: { id: session.user.id },
      data: { birthChartHouseSystem: houseSystem },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving house system:', error);
    return NextResponse.json(
      { error: 'Failed to save preference' },
      { status: 500 },
    );
  }
}
