import 'dotenv/config';

function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/** Comma-separated list -> trimmed, non-empty array. */
function list(value) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
}

// Order matters: it is the left-to-right order of the images in the message.
const DEFAULT_IMAGE_URLS = [
    'https://weather.tmd.go.th/svp/svp240_latest.jpg', // Suvarnabhumi radar
    'https://weather.tmd.go.th/pic_bmanck.jpg', // Nongchok radar
].join(',');

export const config = {
    discordToken: required('DISCORD_TOKEN'),
    channelId: required('DISCORD_CHANNEL_ID'),
    // Optional: thread that keeps every update (posted via a channel webhook).
    historyThreadId: process.env.DISCORD_HISTORY_THREAD_ID || null,
    timezone: process.env.TIMEZONE ?? 'Asia/Bangkok',
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 20 * 60_000),
    imageDir: process.env.IMAGE_DIR ?? 'data',
    radarImageUrls: list(process.env.RADAR_IMAGE_URLS ?? DEFAULT_IMAGE_URLS),
};
