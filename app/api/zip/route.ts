import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';

// Helper to convert Node stream to Web ReadableStream
function nodeStreamToReadable(stream: PassThrough) {
  return new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(chunk));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
  });
}

export async function POST(request: Request) {
  try {
    const { files } = await request.json(); // Expects { files: [{ url, name }] }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const stream = new PassThrough();

    // Pipe archive data to the stream
    archive.pipe(stream);

    // Process each file
    // We do this async but don't await the entire process before returning the stream
    // However, archiver needs data to be appended.
    // Since we are streaming the output, we can run the processing effectively "in background"
    // relative to the stream start, OR we can await it if we buffer.
    // Archive.append is synchronous for buffers usually, but fetching is async.
    // The current logic awaits all fetches BEFORE returning the response.
    // This is fine for small files but for large files it might timeout.
    // Ideally we should process and push to stream asynchronously.

    // For now, to keep logic simple and matching previous behavior:
    // We will await fetches and then finalize.
    // But to avoid blocking the return of the stream (TTFB), we should PROMISE the work.

    const processing = async () => {
        for (const file of files) {
          try {
            const response = await fetch(file.url);
            if (!response.ok) continue;

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            archive.append(buffer, { name: file.name });
          } catch (e) {
            console.error(`Failed to fetch ${file.url}`, e);
          }
        }
        archive.finalize();
    };

    // Start processing without awaiting it, so we can return the stream immediately?
    // standard `archiver` might need error handling if we don't await.
    // But the previous implementation awaited everything. Let's stick to awaiting to be safe against errors for now,
    // unless timeout is an issue. The user didn't complain about timeout, just build error.

    // Actually, let's keep the exact synchronous-like flow found in previous but fix the type error.
    await processing();

    const readable = nodeStreamToReadable(stream);

    return new NextResponse(readable as unknown as ReadableStream<Uint8Array>, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="download.zip"',
      },
    });

  } catch (error) {
    console.error('Zip generation failed:', error);
    return NextResponse.json({ error: 'Zip generation failed' }, { status: 500 });
  }
}
