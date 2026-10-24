import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { CaseStatus } from '@/types';
import { getServerSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as CaseStatus) || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const data = store.getAllCases({ status, search, page, limit });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve cases', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required: A verified officer session is required to create a case docket.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'Case title is mandatory' },
        { status: 400 }
      );
    }

    const created = store.createCase(
      {
        title: body.title,
        operationName: body.operationName || 'Operation CyberShield',
        officerName: session.user.name,
        description: body.description || '',
        priority: body.priority || 'medium',
        taskForce: body.taskForce || session.user.agency || 'Cyber Financial Crimes Task Force',
      },
      session
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create case', details: error.message },
      { status: 500 }
    );
  }
}
