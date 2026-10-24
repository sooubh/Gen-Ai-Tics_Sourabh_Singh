import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { OfficerReviewAction } from '@/types';
import { getServerSession, authorizeCaseAccess } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Verify authenticated officer session
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required: A verified officer session or Bearer token is required.' },
        { status: 401 }
      );
    }

    // 2. Fetch target case
    const caseData = store.getCaseById(id);
    if (!caseData) {
      return NextResponse.json(
        { success: false, error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    // 3. Enforce per-case authorization
    const authResult = authorizeCaseAccess(session, caseData);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Forbidden: Insufficient privileges.' },
        { status: authResult.statusCode || 403 }
      );
    }

    const body = await request.json();

    if (!body.targetType || !body.targetId || !body.action) {
      return NextResponse.json(
        { success: false, error: 'Missing review attributes: targetType, targetId, action required.' },
        { status: 400 }
      );
    }

    // Server-derived officer attribution: NEVER trust raw unverified client body parameters
    const reviewAction: Omit<OfficerReviewAction, 'id' | 'timestamp'> = {
      caseId: id,
      targetType: body.targetType,
      targetId: body.targetId,
      action: body.action,
      newValue: body.newValue,
      reason: body.reason,
      officerId: session.user.id,
      officerName: session.user.name,
    };

    const updated = store.recordReview(id, reviewAction, session);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Case ${id} could not be updated with review.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: updated,
      reviewedBy: {
        officerId: session.user.id,
        officerName: session.user.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process officer review', details: error.message },
      { status: 500 }
    );
  }
}
