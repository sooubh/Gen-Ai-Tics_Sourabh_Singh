import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const caseData = store.getCaseById(id);

    if (!caseData) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
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
    const body = await request.json();

    const updated = store.updateCase(id, body);
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
