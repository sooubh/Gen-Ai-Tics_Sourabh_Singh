import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { getServerSession, authorizeCaseAccess } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Verify server-derived officer session
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required: A verified officer session or Bearer token is required to execute retention purge.',
        },
        { status: 401 }
      );
    }

    // 2. Fetch target case
    const caseData = store.getCaseById(id);
    if (!caseData) {
      return NextResponse.json(
        {
          success: false,
          error: `Case ${id} not found`,
        },
        { status: 404 }
      );
    }

    // 3. Enforce per-case authorization check
    const authResult = authorizeCaseAccess(session, caseData);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.reason || 'Forbidden: Insufficient privileges to purge audio for this case docket.',
        },
        { status: authResult.statusCode || 403 }
      );
    }

    // 4. Enforce verified storage deletion
    let purgeSuccess = false;
    try {
      purgeSuccess = store.purgeAudio(id, session);
    } catch (storageErr: any) {
      console.error(`[RetentionRoute] Storage file deletion unconfirmed for case ${id}:`, storageErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Retention purge failed: storage file deletion unconfirmed.',
          details: storageErr.message || 'Storage file could not be verified deleted.',
        },
        { status: 500 }
      );
    }

    if (!purgeSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: `Audio retention purge failed for case ${id}: storage file deletion could not be verified.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Audio evidence recording permanently purged for case ${id}`,
      case: store.getCaseById(id),
      purgedBy: {
        officerId: session.user.id,
        officerName: session.user.name,
      },
    });
  } catch (error: any) {
    console.error('[RetentionRoute] Unexpected error during retention purge:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to purge audio recording',
        details: error.message || 'Internal retention error',
      },
      { status: 500 }
    );
  }
}
