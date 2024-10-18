// app/api/protected/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ message: 'Vous avez accédé à une route protégée!' }, { status: 200 });
}
