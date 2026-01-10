import { NextRequest, NextResponse } from 'next/server';
import { getBirthChartShare } from '@/lib/share/birth-chart';

type ShareBirthChartParams = {
  shareId: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<ShareBirthChartParams> },
) {
  const { shareId } = await params;
  const record = await getBirthChartShare(shareId);
  if (!record) {
    return NextResponse.json(
      { success: false, error: 'Share not found' },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, share: record });
}
