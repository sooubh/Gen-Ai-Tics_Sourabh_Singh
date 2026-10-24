import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { getServerSession, authorizeCaseAccess } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(request);

    const caseData = store.getCaseById(id);
    if (!caseData) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    if (session) {
      const authResult = authorizeCaseAccess(session, caseData);
      if (!authResult.authorized) {
        return NextResponse.json(
          { error: authResult.reason || 'Forbidden: Insufficient privileges to view case.' },
          { status: authResult.statusCode || 403 }
        );
      }
    }

    return NextResponse.json(caseData);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve case', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required: A verified officer session is required to update cases.' },
        { status: 401 }
      );
    }

    const caseData = store.getCaseById(id);
    if (!caseData) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    const authResult = authorizeCaseAccess(session, caseData);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || 'Forbidden: Insufficient privileges to modify case.' },
        { status: authResult.statusCode || 403 }
      );
    }

    const body = await request.json();
    const updated = store.updateCase(id, body, session);
    if (!updated) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update case', details: error.message },
      { status: 500 }
    );
  }
}
