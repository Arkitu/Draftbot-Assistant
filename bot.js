import { Client, Intents, Collection, MessageActionRow, MessageButton } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { Reminder } from './libs/Reminder.js';
import { createHash } from "crypto";

// Import config
const config = new JsonDB(new Config("config", true, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));

// For log with the current date
async function log(msg) {
	var datetime = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
};

async function log_error(msg) {
	log(`ERROR: ${msg}`);
	await (await client.users.fetch(config.getData("/creator_id"))).send(`:warning: ERROR: ${msg}`);
}

// Create a new client instance
const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	await log('Bot logged !');
	client.user.setPresence({
		status: 'online',
		activity: {
			name: "/help pour plus d'infos",
			type: 'PLAYING'
		}
	});
	// Relauch the stoped reminders
	for (let reminder of db.getData("/reminders")) {
		let channel;
		if (reminder.channel.channel_type) {
			channel = { 
				channel: await client.channels.fetch(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			};
		} else {
			channel = {
				channel: await client.users.fetch(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			}
		}
		new Reminder(client, channel, reminder.dead_line_timestamp, reminder.message, await client.users.fetch(reminder.author_id)).start();
	}
});

let cmd_listener = async interaction => {
	if (interaction.isCommand()) {
		db.reload();
		const { commandName } = interaction;
		const command = client.commands.get(commandName);

		if (!command) return;

		log(`${interaction.user.username} execute ${commandName}`);

		try {
			await command.execute(interaction);
		} catch (error) {
			log_error(error);
		}
	}
}

let msg_listener = async msg => {
	if (msg.content) {
		db.reload();
		// Check if there is a help message to send
		switch (msg.content.toLowerCase()) {
			case "help":
			case "$help":
			case "!help":
			case "?help":
			case `<@${client.user.id}>`:
			case `<@${client.user.id}> help`:
				await msg.channel.send("Si vous voulez la liste des commandes, utilisez la commande `/help`");
				break;
		}
		// Check if there is a proposition to send
		let user_hash = createHash('md5').update(msg.author.id).digest('hex');
		if (!(user_hash in db.getData("/users"))) return;
		let reminder_on = db.getData(`/users/${user_hash}/config/reminders/on`);
		let reminder = reminder_on[msg.content];
		if (reminder) {
			let components = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId("add")
						.setLabel("Ajouter")
						.setStyle("PRIMARY")
				);
			let propo_msg = await msg.channel.send({ content: `Voulez vous ajouter un rappel dans ${reminder.duration} ${reminder.unit} ?`, components: [components] });
			let listener = async button_interaction => {
				if (!button_interaction.isButton()) return;
				if (button_interaction.message.id != propo_msg.id) return;

				let dead_line = msg.createdAt;
				switch (reminder.unit) {
					case "secondes":
						dead_line.setSeconds(dead_line.getSeconds() + reminder.duration);
						break;
					case "minutes":
						dead_line.setMinutes(dead_line.getMinutes() + reminder.duration);
						break;
					case "heures":
						dead_line.setHours(dead_line.getHours() + reminder.duration);
						break;
					case "jours":
						dead_line.setDate(dead_line.getDate() + reminder.duration);
						break;
				}
				let new_reminder = new Reminder(client, { channel: msg.channel, channel_type: "text" }, dead_line.getTime(), `Vous avez ajouté un rappel il y a ${reminder.duration} ${reminder.unit} après le message \`${msg.content}\``, msg.author);
				await new_reminder.save();
				await new_reminder.start();
				await button_interaction.update({ content: "Rappel ajouté !", components: [] });
				await log(`${msg.author.username} ajoute un rappel pour dans ${reminder.duration} ${reminder.unit} suite à une proposition de rappel`);
			}
			client.on('interactionCreate', listener);
			setTimeout(() => {
				client.removeListener('interactionCreate', listener);
			}, 60000);
		}
	}
	// Fetch the guilds messages
    if (msg.author.id != "448110812801007618") return;
    if (await msg.embeds.lenght == 0) return;
	if (!await msg.embeds.length) return;
	if (!msg.embeds[0].title) return;
    if (msg.embeds[0].title.startsWith("Guilde ")) {
        let guild = {
            name: msg.embeds[0].title.substr(7),
            level: parseInt((await msg.embeds[0].fields[1].name.split(" "))[6]),
			description: "",
			last_update: Date.now(),
        }
		if (!guild.level) {
			guild.level = 100;
		}
		if (msg.embeds[0].description) {
			guild.description = msg.embeds[0].description.split("`")[1];
		}
        db.push(`/guilds/${guild.name}`, guild);
		log(`Guild ${guild.name} fetched`);
    }
}

client.on('interactionCreate', cmd_listener);
client.on('messageCreate', msg_listener);

// Commands
client.commands = new Collection();
const admin_path = "./commands/admin";
const everyone_path = "./commands/everyone";
const commandFiles = {
	admin: readdirSync(admin_path).filter(file => file.endsWith(".js")),
	everyone: readdirSync(everyone_path).filter(file => file.endsWith(".js"))
}

for (const file of commandFiles.admin) {
	import(`./commands/admin/${file}`)
  		.then((command) => {
    		client.commands.set(command.data.name, command);
  		});
}
for (const file of commandFiles.everyone) {
	import(`./commands/everyone/${file}`)
  		.then((command) => {
    		client.commands.set(command.data.name, command);
  		});
}

// Login to Discord with your client's token
client.login(config.getData("/token"));