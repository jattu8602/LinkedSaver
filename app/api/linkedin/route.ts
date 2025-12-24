import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
        console.error('LinkedIn fetch failed:', response.status, response.statusText);
        return NextResponse.json({ error: 'Failed to fetch LinkedIn page. Just ensure the link is correct and public.' }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Metadata extraction
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const description = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    let video = $('meta[property="og:video"]').attr('content');

    const mediaItems: { type: 'image' | 'video', url: string }[] = [];

    // 1. Try to find the JSON-LD Schema which contains high-res images for carousels
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const content = $(el).html();
            if(!content) return;
            const json = JSON.parse(content);
            if (json['@type'] === 'SocialMediaPosting') {
                if (json.image) {
                   const images = Array.isArray(json.image) ? json.image : [json.image];
                   images.forEach((img: { url: string }) => {
                       if (img.url && !mediaItems.find(m => m.url === img.url)) {
                           mediaItems.push({ type: 'image', url: img.url });
                       }
                   });
                }
            }
        } catch {
            // ignore parse errors
        }
    });

    // 2. Video Extraction Logic
    // If og:video is not present, check for video tags
    if (!video) {
        const videoSrc = $('video').attr('src');
        if (videoSrc) video = videoSrc;
    }

    // Fallback: Check for mp4 in the entire HTML (simple regex scan)
    if (!video) {
        const decodedHtml = html.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const mp4Match = decodedHtml.match(/https:\/\/[^"]+\.mp4/);
        if (mp4Match) {
            video = mp4Match[0];
            video = video.replace(/\\u002d/g, '-').replace(/\\u0026/g, '&');
        }
    }

    if (video) {
        // Add video to the FRONT of the list if found
        mediaItems.unshift({ type: 'video', url: video });
    } else if (mediaItems.length === 0 && ogImage) {
        // If no schema images found, fall back to og:image
        mediaItems.push({ type: 'image', url: ogImage });
    }

    return NextResponse.json({
      success: true,
      data: {
        title,
        description,
        media: mediaItems
      }
    });

  } catch (error) {
    console.error('Error processing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
