import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would validate the session cookie/JWT
    // For now, we'll check for a simple auth cookie set by login
    const authCookie = request.cookies.get('auth-token');
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No valid session found' },
        { status: 401 }
      );
    }

    // Mock user data - in production, this would come from database lookup
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: '2024-01-01T00:00:00Z',
    };

    return NextResponse.json(mockUser, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to check session' },
      { status: 500 }
    );
  }
}
