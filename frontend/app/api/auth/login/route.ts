import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - in production, this would validate against database
    // For demo, accept any email with password "password"
    if (password !== 'password') {
      return NextResponse.json(
        { error: 'Authentication Failed', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Mock user data
    const user = {
      id: 'user-123',
      email: email,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      createdAt: '2024-01-01T00:00:00Z',
    };

    // Create response with user data
    const response = NextResponse.json(
      { user, message: 'Login successful' },
      { status: 200 }
    );

    // Set httpOnly cookie for session (in production, use secure JWT or session ID)
    response.cookies.set('auth-token', 'mock-jwt-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Login failed' },
      { status: 500 }
    );
  }
}
