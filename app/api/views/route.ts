
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'views.json');

function getViews() {
  try {
    if (!fs.existsSync(DB_PATH)) {
       // Start with 0
      fs.writeFileSync(DB_PATH, JSON.stringify({ count: 0 }));
      return 0;
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    return data.count || 0;
  } catch (error) {
    return 0;
  }
}

function incrementViews() {
  try {
    const current = getViews();
    const newCount = current + 1;
    fs.writeFileSync(DB_PATH, JSON.stringify({ count: newCount }));
    return newCount;
  } catch (error) {
    return 0;
  }
}

export async function GET() {
  return NextResponse.json({ count: getViews() });
}

export async function POST() {
  const count = incrementViews();
  return NextResponse.json({ count });
}
