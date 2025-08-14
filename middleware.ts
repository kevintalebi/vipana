import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware running for:', req.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('User authenticated:', !!user);
  console.log('User email:', user?.email);

  // If accessing seller routes and not authenticated, redirect to home
  if (req.nextUrl.pathname.startsWith('/seller') && !user) {
    console.log('Redirecting unauthenticated user from seller route');
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If accessing seller routes and authenticated, check user role
  if (req.nextUrl.pathname.startsWith('/seller') && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    console.log('User role:', userData?.role);

    // If user is not a seller, redirect to home
    if (!userData || userData.role !== 'seller') {
      console.log('Redirecting non-seller user from seller route');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  console.log('Middleware allowing access');
  return response;
}

export const config = {
  matcher: ['/seller/:path*'],
}; 