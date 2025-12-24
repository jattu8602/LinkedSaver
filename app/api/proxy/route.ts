import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  let filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch media');

    const contentType = response.headers.get('content-type');
    let extension = '';
    if (contentType?.includes('image/jpeg')) extension = '.jpg';
    else if (contentType?.includes('image/png')) extension = '.png';
    else if (contentType?.includes('video/mp4')) extension = '.mp4';

    if (extension && !filename.endsWith(extension)) {
        filename += extension;
    }

    const download = searchParams.get('download') === 'true';

    const headers = new Headers();
    if (download) {
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
        headers.set('Content-Disposition', `inline; filename="${filename}"`);
    }
    headers.set('Content-Type', contentType || 'application/octet-stream');

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy media' }, { status: 500 });
  }
}
