import { NextResponse } from 'next/server';
import { readData } from '@/lib/utils/fs';

export async function GET() {
  try {
    const data = await readData();

    if (!data) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
