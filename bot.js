import { Client, Intents, Collection, MessageActionRow, MessageButton } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { Reminder } from './libs/Reminder.js';
import { createHash } from "crypto";
import { debug } from 'console';

// Import config and db
const config = new JsonDB(new Config("config", true, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));

// Log with the current date
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

// Set listeners
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

let help_msg_listener = async msg => {
	if (["help", "$help", "!help", "?help", `<@${client.user.id}>`, `<@${client.user.id}> help`].includes(msg.content.toLowerCase())) {
		await msg.channel.send("Si vous voulez la liste des commandes, utilisez la commande `/help`");
	}
}

let fetch_guild_listener = async msg => {
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

let propo_msg_listener = async msg => {
	if (!msg.content) return;
	db.reload();
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

let long_report_listener = async msg => {
	if (msg.author.id != "448110812801007618") return;
	if (!msg.content) return;
	if (!(msg.content.startsWith("📰 ** Journal de ") || msg.content.startsWith(":newspaper: ** Journal de "))) return;
	console.debug(msg.content.split(":").slice(1).join(":").slice(3));
	if (!msg.content.split(":").slice(1).join(":").slice(3).startsWith("🏅 Points gagnés :")) return;
	console.debug("premiers tests passés");

	db.reload();
	let user_hash = createHash('md5').update(msg.content.split("<@")[1].split(">")[0]).digest('hex');
	console.debug(user_hash);
	console.debug(db.getData("/users"));
	console.debug(user_hash in db.getData("/users"));
	if (!(user_hash in db.getData("/users"))) return;
	console.debug("utilisateur trouvé");
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.reports) return;
	console.debug("tracking activé");

	// Training message : 📰 ** Journal de <@694235386658160760>  :** 🏅 Points gagnés : ** 328** | 💰 Argent gagné : ** 49** | ⭐ XP gagné : ** 325** | 🕙 Temps perdu : ** 15 Min ** | 🚪 Vous entrez dans la maison et fouillez autour de vous pendant une quinzaine de minutes. En sortant vous trouvez un objet qui pourra peut être vous être utile !
	let data = {
		points: 0,
		gold: 0,
		xp: 0,
		time: 0,
		pv: 0,
		id: `long_report${msg.createdTimestamp}`
	};
	for (let e of msg.content.split(":") // str -> array
		.slice(1) // array
		.join(":") // array -> str
		.slice(3) // str
		.split(" | ") // str -> array
		.slice(0, -1) // array
	) {
		let modif = {
			"name": e.split("**").slice(0, 2)[0].slice(0, -3),
			"value": e.split("**").slice(0, 2)[1].slice(1)
		}
		switch (modif.name) {
			case "🏅 Points gagnés" :
				data.points += parseInt(modif.value);
				break;
			case "💰 Argent gagné" :
				data.gold += parseInt(modif.value);
				break;
			case "💸 Argent perdu" :
				data.gold -= parseInt(modif.value);
				break;
			case "⭐ XP gagné" :
				data.xp += parseInt(modif.value);
				break;
			case "❤️ Vie gagnée" :
				data.pv += parseInt(modif.value);
				break;
			case "💔 Vie perdue" :
				data.pv -= parseInt(modif.value);
				break;
			case "🕙 Temps perdu" :
				data.time = 0;
				let time_array = modif.value.split(" ");
				while (time_array.length > 1) {
					switch (time_array[1]) {
						case "H" :
							data.time += parseInt(time_array[0]) * 3600000;
							break;
						case "Min" :
							data.time += parseInt(time_array[0]) * 60000;
							break;
					}
					time_array.splice(0, 2);
				}
				break;
		}
	}

	db.push(`/users/${user_hash}/tracking[]`, {
		type: "long_report",
		timestamp: msg.createdTimestamp,
		data: data
	})

}

client.on('interactionCreate', cmd_listener);
client.on('messageCreate', help_msg_listener);
client.on('messageCreate', fetch_guild_listener);
client.on('messageCreate', propo_msg_listener);
client.on('messageCreate', long_report_listener);

// Import all the commands from the commands files
client.commands = new Collection();
const admin_path = "./commands/admin";
const everyone_path = "./commands/everyone";
const commandFiles = {
	admin: readdirSync(admin_path).filter(file => file.endsWith(".js")),
	everyone: readdirSync(everyone_path).filter(file => file.endsWith(".js"))
};
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

// Login to Discord
client.login(config.getData("/token"));