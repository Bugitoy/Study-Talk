import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/account',
  '/pricing', 
  '/about',
  '/meetups',
  '/meetups/study-groups',
  '/meetups/study-groups/leaderboard',
  '/meetups/confessions',
  '/meetups/compete',
  '/login'
];

// Define routes that should be protected (require authentication)
const protectedRoutes = [
  '/admin',
  '/api/auth/logout'
];

// Define subroutes that should be protected even if parent is public
const protectedSubroutes = [
  '/admin/reports',
  '/admin/reputation',
  '/meetups/talk'
];

// Define routes that should always be accessible (including 404 pages)
const alwaysAccessibleRoutes = [
  '/',
  '/about',
  '/pricing',
  '/login',
  '/not-found',
  '/404'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle CSS source map requests gracefully
  if (pathname.endsWith('.css.map') || pathname.includes('.css.map')) {
    // Return a 200 response with empty content instead of 404
    return new NextResponse('', { status: 200 });
  }
  
  // Always allow access to homepage and essential pages
  if (alwaysAccessibleRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Allow access to static files and assets
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') || 
      pathname.startsWith('/Images/') ||
      pathname.startsWith('/public/') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')) {
    return NextResponse.next();
  }
  
  // Allow access to API routes (except logout)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/logout')) {
    return NextResponse.next();
  }
  
  // Check if the current path is a protected subroute
  const isProtectedSubroute = protectedSubroutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is a public route (exact matches only)
  const isPublicRoute = publicRoutes.some(route => {
    return pathname === route;
  });

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected subroute, require authentication
  if (isProtectedSubroute) {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      
      if (!user) {
        // Redirect to custom login page if not authenticated
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Redirect to custom login page on error
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      
      if (!user) {
        // Redirect to custom login page if not authenticated
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Redirect to custom login page on error
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For all other routes, require authentication
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      // Redirect to custom login page if not authenticated
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    // Redirect to custom login page on error
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 