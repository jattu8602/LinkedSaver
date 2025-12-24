
import { NextResponse } from 'next/server';

// We use an external free counter API because Vercel/Serverless doesn't support persistent file writing
// https://counterapi.dev/
const NAMESPACE = 'linkedsaver-users-v1';
const KEY = 'views';

async function getViews() {
  try {
    // If we just want to read, we can use the 'info' endpoint or just infer from the 'up' endpoint if we want to increment
    // Let's assume we want to increment on POST and read on GET?
    // The previous implementation:
    // GET -> return count
    // POST -> increment and return count

    const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    return 0;
  }
}

async function incrementViews() {
  try {
    const res = await fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    return 0;
  }
}

export async function GET() {
  // Just get the current count without incrementing
  // The basic get endpoint for counterapi gives details
  // Note: counterapi.dev might return 404 if key doesn't loop exist yet.
  // The 'up' command creates it if missing.
  // So for GET, if it fails, we return 0.
  const count = await getViews();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await incrementViews();
  return NextResponse.json({ count });
}
