import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const caseData = store.getCaseById(id);

    if (!caseData) {
      return NextResponse.json(
        { error: `Case ${id} not found` },
        { status: 404 }
      );
    }

    const success = store.purgeAudio(id);

    return NextResponse.json({
      success,
      message: `Audio evidence recording permanently purged for case ${id}`,
      case: store.getCaseById(id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to purge audio recording', details: error.message },
      { status: 500 }
    );
  }
}
