import axios from 'axios';

/** Downloads an image from `url` and returns it as a Buffer. */
export async function fetchRadarImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}
