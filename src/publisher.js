import { config } from './config.js';

const WEBHOOK_NAME = 'Raindar History';

/** Returns the channel's first webhook, creating one if there are none. */
async function getOrCreateWebhook(channel) {
    const webhooks = await channel.fetchWebhooks();
    return webhooks.first() ?? channel.createWebhook({ name: WEBHOOK_NAME });
}

/**
 * Posts radar updates to the main channel (keeping only the latest message
 * there) and archives every update in the history thread via a webhook.
 */
export class Publisher {
    #channel;
    #webhook;
    #lastMessage = null;

    constructor(channel, webhook) {
        this.#channel = channel;
        this.#webhook = webhook;
    }

    static async create(channel) {
        const webhook = config.historyThreadId ? await getOrCreateWebhook(channel) : null;
        return new Publisher(channel, webhook);
    }

    async publish({ content, files }) {
        const message = await this.#channel.send({ content, files });
        console.log(`Sent ${message.id}`);

        await this.#deleteLastMessage();
        this.#lastMessage = message;

        await this.#archive({ content, files });
    }

    async #deleteLastMessage() {
        if (!this.#lastMessage) return;

        try {
            await this.#lastMessage.delete();
            console.log('Previous message deleted');
        } catch (error) {
            // 404 means someone already removed it.
            if (error.status !== 404) console.error('Could not delete previous message:', error.message);
        }
    }

    async #archive({ content, files }) {
        if (!this.#webhook) return;

        try {
            await this.#webhook.send({ content, files, threadId: config.historyThreadId });
            console.log('Sent message to history');
        } catch (error) {
            console.error('Could not post to history thread:', error.message);
        }
    }
}
