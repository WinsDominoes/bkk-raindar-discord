import fs from 'node:fs/promises';
import path from 'node:path';

/** Returns the size in bytes of the file, or null if it doesn't exist yet. */
export async function getFileSize(filePath) {
    try {
        return (await fs.stat(filePath)).size;
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}

/** Writes data to filePath, creating parent directories as needed. */
export async function saveFile(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
}
