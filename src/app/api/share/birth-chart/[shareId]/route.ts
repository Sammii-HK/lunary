import { NextRequest, NextResponse } from 'next/server';
import { getBirthChartShare } from '@/lib/share/birth-chart';

export const dynamic = 'force-dynamic';

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
  // Don't expose the sharer's referral code via the public read endpoint; it's
  // only consumed server-side when rendering the share page CTA.
  const { referralCode: _referralCode, ...publicRecord } = record;
  return NextResponse.json({ success: true, share: publicRecord });
}
