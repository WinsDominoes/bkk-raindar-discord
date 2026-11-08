import { config } from './config.js';

/** Builds the message text posted alongside the radar images. */
export function buildCaption(now = new Date()) {
    const date = now.toLocaleString('th-TH', { timeZone: config.timezone });

    return [
        '# Raindar Update',
        `## ${date}`,
        '',
        '- Left: Suvarnabhumi Radar',
        '- Right: Nongchok Radar',
        '-# Note: Time in the radar is displayed in UTC.',
    ].join('\n');
}
