import path from 'node:path';

import { config } from './config.js';
import { buildCaption } from './caption.js';
import { fetchRadarImage } from './radar.js';
import { getFileSize, saveFile } from './storage.js';

/** Local file each radar image is saved to, e.g. data/radarh.jpg. */
function localPathFor(url) {
    return path.join(config.imageDir, path.basename(new URL(url).pathname));
}

/** Downloads one image and reports whether it differs in size from the saved copy. */
async function fetchImage(url) {
    const filePath = localPathFor(url);
    const previousSize = await getFileSize(filePath);
    const data = await fetchRadarImage(url);

    console.log(`${path.basename(filePath)}: previous=${previousSize ?? 'none'} new=${data.length}`);
    return { filePath, data, changed: data.length !== previousSize };
}

/**
 * Fetches all radar images and posts them in a single message when any of
 * them differs in size from its previously saved copy (or when `force` is set).
 */
export async function checkForUpdate(publisher, { force = false } = {}) {
    const images = await Promise.all(config.radarImageUrls.map(fetchImage));

    if (!force && !images.some((image) => image.changed)) {
        console.log('No change in radar images.');
        return;
    }

    await Promise.all(images.map((image) => saveFile(image.filePath, image.data)));
    await publisher.publish({
        content: buildCaption(),
        files: images.map((image) => image.filePath),
    });
}

/** Posts immediately, then polls on an interval. Errors never stop the loop. */
export function startPolling(publisher) {
    const run = (options) =>
        checkForUpdate(publisher, options).catch((error) =>
            console.error('Radar update failed:', error.message),
        );

    run({ force: true });
    return setInterval(run, config.pollIntervalMs);
}
