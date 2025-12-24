import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';

// Helper to convert stream to iterator for NextResponse
function streamToIterator(stream: PassThrough) {
  const iterator = async function* () {
    for await (const chunk of stream) {
      yield chunk;
    }
  };
  return iterator();
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
    for (const file of files) {
      try {
        const response = await fetch(file.url);
        if (!response.ok) continue; // Skip failed files

        // We need to convert the web stream to a node stream or buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        archive.append(buffer, { name: file.name });
      } catch (e) {
        console.error(`Failed to fetch ${file.url}`, e);
      }
    }

    // Finalize the archive (this indicates we are done appending files)
    archive.finalize();

    return new NextResponse(streamToIterator(stream), {
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
