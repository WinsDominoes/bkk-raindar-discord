import {
    Client,
    Events,
    GatewayIntentBits
} from 'discord.js';
import fs from 'fs';

import {
    createWriteStream,
    existsSync
} from 'fs';

import {
    parse
} from 'node-html-parser';

import { 
	pipeline 
} from 'node:stream/promises';

import path from 'node:path';
import axios from 'axios';
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const config = JSON.parse(fs.readFileSync(path.resolve("config", "config.json")));

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

async function get_rain_image() {
	try {
		const radar_image = await axios.get('https://weather.bangkok.go.th/Images/Radar/radarh.jpg', {
			responseType: "stream"
		});
			
		const radar_image_size = radar_image.headers['content-length'];
		console.log("Got Radar Data");
		return [radar_image, radar_image_size];
	} catch (error) {
		console.error(error);
		return [error];
	}
}

async function get_radar_caption() {
	const response = await axios.get('https://weather.bangkok.go.th/Radar/RadarHighResolution.aspx');

	let root = parse(response.data);
	console.log("Got Radar Caption")
	return root.querySelector('#repeaDaily_lblDESCRIPTION_0').childNodes[0]._rawText;
}

const curr_image_path = path.resolve("data", "current_radar.jpg");

client.on('ready', () => {
	(async () => {
		const channel = client.channels.cache.get(config.room);
		
		let radar_image = await get_rain_image();
		let radar_caption = await get_radar_caption();

		await pipeline(
			radar_image[0].data,
			fs.createWriteStream(curr_image_path)
		);
		console.log("File Saved");
			
		console.log("Updating on boot");
		let message = await channel.send({
			content: radar_caption,
	        files: [curr_image_path]
	    });
	    console.log(`Sent: ${message.content}`);
		
		setInterval(async () => {
		 	let curr_image_size = fs.statSync(curr_image_path).size;

		 	let radar_image = await get_rain_image();
		 	let radar_caption = await get_radar_caption();

            await pipeline(
            	radar_image[0].data,
            	fs.createWriteStream(curr_image_path)
            );
            console.log("File Saved");

            let radar_image_size = radar_image[1];
            console.log("Current: " + curr_image_size);
            console.log("New: " + radar_image_size);
            
            if(radar_image_size != curr_image_size) {
            	console.log("File change detected!");
                let message = await channel.send({
                	content: radar_caption,
                	files: [curr_image_path]
                });
                console.log(`Sent: ${message.content}`);
            } else {
                console.log("No change in data, go on.");
            }
		}, 60000); 
	})();
});

client.on(Events.ShardError, error => {
   console.log('A websocket connection encountered an error: ', error); 
});

process.on('unhandledRejection', error => {
    console.error(error); 
});

client.login(config.token);
