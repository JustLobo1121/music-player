import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export interface Song {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}
let cachedVisitorData = '';

async function getAuthHeaders(origin = 'https://music.youtube.com'): Promise<Record<string, string>> {
  const cookie = await SecureStore.getItemAsync('yt_cookie');
  if (!cookie) return {};

  const match = cookie.match(/(?:^|;\s*)(?:__Secure-3PAPISID|SAPISID)=([^;]+)/);
  if (!match) return {};

  const sapisid = match[1];
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    `${timestamp} ${sapisid} ${origin}`
  );

  return {
    Cookie: cookie,
    Authorization: `SAPISIDHASH ${timestamp}_${hash}`,
    Origin: origin,
    'X-Origin': origin,
  };
}

export async function searchSongs(query: string): Promise<Song[]> {
    const authHeaders = await getAuthHeaders('https://www.youtube.com');
    if (!query.trim()) return [];

    const response = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
            'X-YouTube-Client-Name': '28',
            'X-YouTube-Client-Version': '1.60.19',
            ...authHeaders
        },
        body: JSON.stringify({
            context: {
                client: {
                    clientName: 'WEB_REMIX',
                    clientVersion: '1.20240101.01.00',
                    hl: 'es',
                    gl: 'CL',
                },
            },
            query,
            params: 'EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D',
        }),
    });

    const data = await response.json();

    if (data?.responseContext?.visitorData) {
        cachedVisitorData = data.responseContext.visitorData;
    }

    return parseSearchResults(data);
}

function parseSearchResults(data: any): Song[] {
    try {
        const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs;
        const sections = tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
        const shelf = sections.find((s: any) => s.musicShelfRenderer)?.musicShelfRenderer;
        if (!shelf?.contents) return [];

        return shelf.contents
            .map((item: any) => {
                const renderer = item.musicResponsiveListItemRenderer;
                if (!renderer) return null;

                const videoId = renderer.playlistItemData?.videoId;
                if (!videoId) return null;

                const title =
                    renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
                        ?.text || 'Sin título';
                const artist =
                    renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
                        ?.text || 'Artista desconocido';
                const thumbnails = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                const thumbnail = thumbnails[thumbnails.length - 1]?.url || '';

                return { id: videoId, title, artist, thumbnail };
            })
            .filter(Boolean) as Song[];
    } catch (error) {
        console.error('Error parseando resultados:', error);
        return [];
    }
}

export async function getAudioStreamUrl(videoId: string): Promise<string | null> {
    const authHeaders = await getAuthHeaders('https://www.youtube.com');
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
            'X-YouTube-Client-Name': '28',
            'X-YouTube-Client-Version': '1.60.19',
            ...authHeaders
        };

        if (cachedVisitorData) {
            headers['X-Goog-Visitor-Id'] = cachedVisitorData;
        }

        const response = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: 'ANDROID_VR',
                        clientVersion: '1.60.19',
                        deviceMake: 'Oculus',
                        deviceModel: 'Quest 3',
                        androidSdkVersion: 32,
                        osName: 'Android',
                        osVersion: '12L',
                        hl: 'es',
                        gl: 'CL',
                        visitorData: cachedVisitorData || undefined,
                    },
                },
                videoId,
                contentCheckOk: true,
                racyCheckOk: true,
            }),
        });

        const data = await response.json();

        if (!response.ok || data?.playabilityStatus?.status !== 'OK') {
            console.warn('YouTube Error / Status:', JSON.stringify(data?.playabilityStatus, null, 2));
            return null;
        }

        const formats = data?.streamingData?.adaptiveFormats || [];
        const audioFormat =
            formats.find((f: any) => f.mimeType?.startsWith('audio/mp4') && f.url) ||
            formats.find((f: any) => f.mimeType?.startsWith('audio/') && f.url);

        return audioFormat?.url || null;
    } catch (error) {
        console.error('Error obteniendo stream:', error);
        return null;
    }
}
