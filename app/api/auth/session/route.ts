import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// Force dynamic rendering to prevent build-time session access
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ isLoggedIn: false });
    }

    return NextResponse.json({
      isLoggedIn: true,
      username: session.username,
      userId: session.userId,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ isLoggedIn: false });
  }
}
