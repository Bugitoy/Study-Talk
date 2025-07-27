import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return empty response for CSS source map requests
  return new NextResponse('', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function HEAD(request: NextRequest) {
  // Return empty response for HEAD requests to CSS source maps
  return new NextResponse('', {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
} 