import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is requesting a dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for the secure authentication cookie
    const token = request.cookies.get('waba_auth_token');

    // If there is no token, redirect to the login page (root)
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow the request to proceed if token exists or it's not a protected route
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/dashboard/:path*'],
};
