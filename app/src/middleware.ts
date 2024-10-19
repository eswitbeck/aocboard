import { NextRequest } from 'next/server'
import {
  getUserIdFromAccessToken,
  refreshAccessToken,
} from '@/server/Main';

export async function middleware(request: NextRequest) {

  await fetch('http://localhost:3000/api/auth', {
    headers: {
      'Content-Type': 'application/json',
    }
  });
//  const userId = getUserIdFromAccessToken();
//  if (!userId) {
//    refreshAccessToken();
//  }
}

export const config = {
};
