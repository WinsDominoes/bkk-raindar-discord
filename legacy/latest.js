import { Client, Events, GatewayIntentBits } from "discord.js";
import fs from "fs";

import { createWriteStream, existsSync } from "fs";

import { parse } from "node-html-parser";

import { pipeline } from "node:stream/promises";

import path from "node:path";
import axios from "axios";
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const config = JSON.parse(
    fs.readFileSync(path.resolve("config", "config.json")),
);

process.env.TZ = config.timezone;

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

async function get_rain_image() {
    try {
        // let radar_src = "https://weather.bangkok.go.th/Images/Radar/radarh.jpg"
        // let radar_src = "https://weather.tmd.go.th/ryg/ryg240_latest.gif"; // replacement for BMA
		let radar_src = "https://weather.tmd.go.th/svp/svp240_latest.jpg"; // another replacement - w/ Suvarnabhumi radar
        const radar_image = await axios.get(radar_src, {
            responseType: "stream",
        });

        const radar_image_size = radar_image.headers["content-length"];
        console.log("Got Radar Data");
        return [radar_image, radar_image_size];
    } catch (error) {
        console.error(error);
        return [error];
    }
}

async function get_radar_caption() {
    const response = await axios.get(
        "https://weather.bangkok.go.th/Radar/RadarHighResolution.aspx",
    );

    let root = parse(response.data);
    console.log("Got Radar Caption");
    return root.querySelector("#repeaDaily_lblDESCRIPTION_0").childNodes[0]
        ._rawText;
}

function randomizator(a, b) {
    return Math.floor(Math.random() * b) + a;
}

const curr_image_path = path.resolve("data", "current_radar.jpg");

client.on("ready", () => {
    (async () => {
        console.log("Starting up the bot...");
        const channel = client.channels.cache.get(config.room);
        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.first();

        //await channel.send({
        //    content: "test",
        //    // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"]
        //});

        let radar_image = await get_rain_image();
        // await channel.send({content: "bruh #1"});
        // let radar_caption = await get_radar_caption();

        await pipeline(
            radar_image[0].data,
            fs.createWriteStream(curr_image_path),
        );
        console.log("File Saved");

        console.log("Updating on boot");

        let date = new Date().toLocaleString("th-TH");

        // let caption = `# Raindar Update\n## ${date}\n${radar_caption}\n\nLeft: Current Observation\nRight: 3 hour forecast`
        // temp caption
        let caption = `# Raindar Update\n## ${date}\n
\n- Left: Suvarnabhumi Radar
- Right: Nongchok Radar
-# Note: Time in the radar is displayed in UTC.`;

        let message = await channel.send({
            content: caption,
            // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"]
            files: [
                curr_image_path,
                // "https://weather.tmd.go.th/svp/svp120Loop.gif", // suvarnabhumi loop
                "https://weather.tmd.go.th/pic_bmanck.jpg", // Nongchok latest
                // "https://weather.tmd.go.th/pic_bmancLoop.gif", // nongchock loop
            ], // samut songkran HQ loop
        });

        // let message = await channel.send({
        //     content: caption,
        //     files: [curr_image_path]
        // });

        let message_id = message.id;
        console.log(`Sent ${message.id}: ${message.content}`);

        await webhook.send({
            content: caption,
            // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"],
            files: [curr_image_path],
            threadId: config.history,
        });

        // await webhook.send({
        //     content: caption,
        //     files: [curr_image_path],
        //     threadId: config.history,
        // });

        console.log(`Sent message to history`);

        setInterval(async () => {
            let curr_image_size = fs.statSync(curr_image_path).size;

            let radar_image = await get_rain_image();
            // let radar_caption = await get_radar_caption();

            await pipeline(
                radar_image[0].data,
                fs.createWriteStream(curr_image_path),
            );
            console.log("File Saved");

            let radar_image_size = radar_image[1];

            console.log("Current: " + curr_image_size);
            console.log("New: " + radar_image_size);

            if (radar_image_size != curr_image_size) {
                console.log("File change detected!");

                channel.messages
                    .fetch(message_id)
                    .then((fetchedMessage) => {
                        console.log("Message exists");

                        fetchedMessage
                            .delete()
                            .then(() =>
                                console.log("Message deleted successfully"),
                            )
                            .catch((err) =>
                                console.log(
                                    "Could not delete the message",
                                    err,
                                ),
                            );
                    })
                    .catch((err) => {
                        if (err.httpStatus === 404) {
                            console.log("Message already deleted");
                        } else {
                            console.log(err);
                        }
                    });

                let date = new Date().toLocaleString("th-TH");

                // let caption = `# Raindar Update\n## ${date}\n${radar_caption}\n\nLeft: Current Observation\nRight: 3 hour forecast **[CURRENTLY UNAVAILABLE]**`
                let caption = `# Raindar Update\n## ${date}\n
\n- Left: Suvarnabhumi Radar
- Right: Nongchok Radar
-# Note: Time in the radar is displayed in UTC.`;

				/*
                let message = await channel.send({
                    content: caption,
                    // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"]
                    files: [
                        curr_image_path,
                        "https://weather.tmd.go.th/ryg/ryg240Loop.gif", // rayong loop
                        "https://weather.tmd.go.th/skm/skm120_HQ_latest.gif", // samut songkram HQ
                        "https://weather.tmd.go.th/skm/skm120_HQ_Loop.gif",
                    ], // samut songkram HQ loop
                });
				*/

                let message = await channel.send({
                    content: caption,
                    // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"]
                    files: [
                        curr_image_path,
                        // "https://weather.tmd.go.th/svp/svp120Loop.gif", // suvarnabhumi loop
                        "https://weather.tmd.go.th/pic_bmanck.jpg", // Nongchok latest
                        // "https://weather.tmd.go.th/pic_bmancLoop.gif", // nongchock loop
                    ], // samut songkran HQ loop
                });

                // let message = await channel.send({
                //     content: caption,
                //     files: [curr_image_path]
                // });

                console.log(`Sent ${message.id}: ${message.content}`);
                message_id = message.id;

                await webhook.send({
                    content: caption,
                    // files: [curr_image_path, "https://dds.bangkok.go.th/Radar/radar_rain.gif"],
                    files: [
                        curr_image_path,
                        "https://weather.tmd.go.th/svp/svp240_latest.jpg"
                    ], // samut songkran HQ loop,
					/*
                    files: [
                        curr_image_path,
                        "https://weather.tmd.go.th/ryg/ryg240Loop.gif", // rayong loop
                        "https://weather.tmd.go.th/skm/skm120_HQ_latest.gif", // samut songkram HQ
                        "https://weather.tmd.go.th/skm/skm120_HQ_Loop.gif",
                    ], // samut songkran HQ loop,
					*/
                    threadId: config.history,
                });

                // await webhook.send({
                //     content: caption,
                //     files: [curr_image_path],
                //     threadId: config.history,
                // });
                console.log(`Sent message to history`);
            } else {
                console.log("No change in data, go on.");
            }
            // }, randomizator(600000, 1800000)); // fetch at random times between 10 mins asnd 30 mins
        }, 1200000); // 20 minutes
    })();
});

client.on(Events.ShardError, (error) => {
    console.log("A websocket connection encountered an error: ", error);
});

process.on("unhandledRejection", (error) => {
    console.error(error);
});

client.login(config.token);
