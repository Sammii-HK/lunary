import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    // Here you would remove the subscription from your database
    console.log('Removing push subscription:', endpoint);

    // In a real implementation:
    // await db.subscriptions.deleteMany({
    //   where: { endpoint }
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 },
    );
  }
}
