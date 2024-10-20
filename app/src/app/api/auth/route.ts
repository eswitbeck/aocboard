import {
  refreshAccessToken
} from '@/server/Main';

export async function GET(req: Request): Promise<Response> {
  const response = await refreshAccessToken();

  if (response.status !== 200) {
    return new Response(undefined, {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(undefined, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
