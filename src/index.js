import { Client, Events, GatewayIntentBits } from 'discord.js';

import { config } from './config.js';
import { Publisher } from './publisher.js';
import { startPolling } from './updater.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const channel = await readyClient.channels.fetch(config.channelId);
    if (!channel?.isTextBased()) {
        throw new Error(`Channel ${config.channelId} not found or not text-based`);
    }
    startPolling(await Publisher.create(channel));
});

client.on(Events.ShardError, (error) => {
    console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

client.login(config.discordToken);
