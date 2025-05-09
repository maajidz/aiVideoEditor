import { NextRequest, NextResponse } from 'next/server';

// Helper to extract YouTube Video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    } 
    // Add more checks for other formats if needed (e.g., /embed/)
    
    // Basic validation: YouTube IDs are typically 11 characters
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
    } 
    return null; // Return null if not a valid-looking ID

  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

// Helper to parse ISO 8601 Duration (e.g., PT2M34S) into seconds
function parseYouTubeDuration(duration: string): number | null {
  if (!duration) return null;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
  }

  const videoId = extractYouTubeVideoId(videoUrl);

  if (!videoId) {
    return NextResponse.json({ error: 'Invalid or unsupported YouTube URL' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YOUTUBE_API_KEY environment variable not set.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API Error:', errorData);
        throw new Error(`YouTube API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found or unavailable' }, { status: 404 });
    }

    const videoItem = data.items[0];
    const snippet = videoItem.snippet;
    const contentDetails = videoItem.contentDetails;

    const title = snippet?.title;
    const thumbnailUrl = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;
    const durationInSeconds = parseYouTubeDuration(contentDetails?.duration);

    return NextResponse.json({
      success: true,
      title,
      thumbnailUrl,
      duration: durationInSeconds,
    });

  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return NextResponse.json({ error: 'Failed to fetch video data' }, { status: 500 });
  }
} 