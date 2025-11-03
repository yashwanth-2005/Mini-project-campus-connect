
import { NextResponse } from 'next/server';

// This is a simple health check endpoint. It's a standard practice to have a URL
// that monitoring services can check to make sure the application is running.
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Server is running healthy!' });
}

