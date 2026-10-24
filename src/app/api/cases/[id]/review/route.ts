import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { OfficerReviewAction } from '@/types';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.targetType || !body.targetId || !body.action) {
      return NextResponse.json(
        { error: 'Missing review attributes: targetType, targetId, action required.' },
        { status: 400 }
      );
    }

    const reviewAction: Omit<OfficerReviewAction, 'id' | 'timestamp'> = {
      caseId: id,
      targetType: body.targetType,
      targetId: body.targetId,
      action: body.action,
      newValue: body.newValue,
      reason: body.reason,
      officerId: body.officerId || 'JENKINS-4829',
      officerName: body.officerName || 'Det. S. Jenkins #4829',
    };

    const updated = store.recordReview(id, reviewAction);
    if (!updated) {
      return NextResponse.json(
        { error: `Case ${id} could not be updated with review.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process officer review', details: error.message },
      { status: 500 }
    );
  }
}
