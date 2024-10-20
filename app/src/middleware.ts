import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('aocboardAccessToken');

  if (authToken) return NextResponse.next();

  const apiResponse = await fetch(`${process.env.API_URL}/api/auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
    },
  });

  if (apiResponse.status !== 200) return NextResponse.next();

  const setCookieHeader = apiResponse.headers.get('set-cookie');
  if (!setCookieHeader) return NextResponse.next();

  const { aocboardAccessToken } = parseCookies(setCookieHeader);
  if (!aocboardAccessToken) return NextResponse.next();

  let i = 0;
  let decodedToken = decodeURIComponent(aocboardAccessToken);
  while (decodedToken !== decodeURIComponent(aocboardAccessToken) && i < 10) {
    decodedToken = decodeURIComponent(aocboardAccessToken);
    i++;
  }

  const response = NextResponse.next();
  response.cookies.set(
    'aocboardAccessToken',
    decodedToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 15)
    });

  return response;
}

function parseCookies(cookieString: string): Record<string, string> {
  return cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);
}

