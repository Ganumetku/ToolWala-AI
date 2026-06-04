import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === expectedUsername && password === expectedPassword) {
      // Return a mock JWT admin session token
      return NextResponse.json({
        success: true,
        token: 'auth-session-' + Buffer.from(username).toString('base64') + '-' + Date.now(),
        message: 'Authenticated'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid username or password credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server validation error' },
      { status: 500 }
    );
  }
}
