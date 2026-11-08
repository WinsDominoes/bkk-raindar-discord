# bkk-raindar-discord

Discord bot that polls the TMD Suvarnabhumi and Nongchok radar images and posts
them to a channel whenever they change (detected by file size).

- Only the latest update stays in the channel; the previous message is deleted.
- If `DISCORD_HISTORY_THREAD_ID` is set, every update is also archived in that
  thread through a channel webhook (created automatically if missing).

## Setup

```sh
cp .env.example .env   # then fill in DISCORD_TOKEN and DISCORD_CHANNEL_ID
```

## Run

Docker:

```sh
docker compose up -d --build
```

Locally (Node 22+):

```sh
npm install
npm start
```

## Layout

| File | Purpose |
| --- | --- |
| `src/index.js` | Discord client bootstrap |
| `src/config.js` | Reads and validates environment variables |
| `src/radar.js` | Downloads radar images |
| `src/caption.js` | Builds the message text |
| `src/publisher.js` | Posts to the channel, deletes the old message, archives to the history thread |
| `src/storage.js` | Saves/inspects the last-posted image on disk |
| `src/updater.js` | Change detection and polling loop |
