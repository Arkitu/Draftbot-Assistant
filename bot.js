import { Client, Intents, Collection, MessageActionRow, MessageButton, MessageManager } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { Reminder } from './libs/Reminder.js';
import { createHash } from "crypto";

// Import config and db
const config = new JsonDB(new Config("config", true, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));

// Log with the current date
export async function log(msg) {
	var datetime = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
};

export async function log_error(msg) {
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
		new Reminder(client, channel, reminder.dead_line_timestamp, reminder.message, await client.users.fetch(reminder.author_id), db, config).start();
	}
});

// Set listeners
let cmd_listener = async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;
		const command = client.commands.get(commandName);

		if (!command) return;

		log(`${interaction.user.username} execute ${commandName}`);

		await command.execute(interaction, config, db);
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
		if ((!guild.level) && (guild.level != 0)) {
			guild.level = 100;
		}
		if (msg.embeds[0].description) {
			guild.description = msg.embeds[0].description.split("`")[1];
		}
        db.push(`/guilds/${guild.name}`, guild);
		log(`Guild ${guild.name} fetched. Level: ${guild.level}`);
    }
}

let propo_msg_listener = async msg => {
	if (!msg.content) return;
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
			)
			.addComponents(
				new MessageButton()
					.setCustomId("remove")
					.setLabel("Non")
					.setStyle("DANGER")
			);
		let propo_msg = await msg.channel.send({ content: `Voulez vous ajouter un rappel dans ${reminder.duration} ${reminder.unit} ?`, components: [components] });
		let listener = async button_interaction => {
			if (!button_interaction.isButton()) return;
			if (button_interaction.message.id != propo_msg.id) return;

			switch (button_interaction.customId) {
				case "add":
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
					let new_reminder = new Reminder(client, { channel: msg.channel, channel_type: "text" }, dead_line.getTime(), `Vous avez ajouté un rappel il y a ${reminder.duration} ${reminder.unit} après le message \`${msg.content}\``, msg.author, db, config);
					await new_reminder.save();
					await new_reminder.start();
					await button_interaction.update({ content: "Rappel ajouté !", components: [] });
					await log(`${msg.author.username} ajoute un rappel pour dans ${reminder.duration} ${reminder.unit} suite à une proposition de rappel`);
					break;
				case "remove":
					if (button_interaction.message.deletable) {
						button_interaction.message.delete();
					}
					break;
			}
		}
		client.on('interactionCreate', listener);
		setTimeout(() => {
			client.removeListener('interactionCreate', listener);
			if (propo_msg.deletable) {
				propo_msg.delete();
			}
		}, 60000);
	}
}

let long_report_listener = async msg => {
	if (msg.author.id != "448110812801007618") return;
	if (!msg.content) return;
	if (!msg.content.startsWith(":newspaper: ** Journal de ")) return;
	if (!msg.content.split(":").slice(3).join(":").slice(3).startsWith(":medal: Points gagnés :")) return;

	let user_hash = createHash('md5').update(msg.content.split("<@")[1].split(">")[0]).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.reports) return;

	// Training message : :newspaper: ** Journal de @Arkitu  :** :medal: Points gagnés : ** 358** | :moneybag: Argent gagné : ** 24** | :star: XP gagné : ** 25** | :clock10: Temps perdu : ** 45 Min ** | ⛓️ Vous grimpez jusqu'en haut des échafaudages, mais à l'exception d'un magnifique paysage, vous ne trouvez rien. Après avoir passé quelques minutes à l'admirer, vous repartez.
	let data = {
		points: 0,
		gold: 0,
		xp: 0,
		time: 0,
		pv: 0,
		id: `long_report${msg.createdTimestamp}`
	};
	for (let e of msg.content.split(":") // str -> array
		.slice(3) // array
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
	});

	log("Long repport tracked");
}

let short_report_listener = async msg => {
	if (!msg.content.toLowerCase().replace(" ", "").slice(1) in ["r", "report" ]) return;

	let user_hash = createHash('md5').update(msg.author.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.reports) return;

	let response_listener = async response => {
		if (response.author.id != "448110812801007618") return;

		if (response.channel.id != msg.channel.id) return;
		if (!response.embeds[0]) return;
		if (!response.embeds[0].author) return;
		if (response.embeds[0].author.name != `Journal de ${msg.author.username}`) return;
		db.push(`/users/${user_hash}/tracking[]`, {
			type: "short_report",
			timestamp: response.createdTimestamp
		});
		log("Short repport tracked");
	}
	client.on('messageCreate', response_listener);

	setTimeout(() => {
		client.removeListener('messageCreate', response_listener);
	}, 10000);
}

let profile_listener = async msg => {
	if (!msg.content.toLowerCase().replace(" ", "").slice(1) in ["p", "profile", "profil"]) return;

	let user_hash = createHash('md5').update(msg.author.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.profile) return;

	let response_listener = async response => {
		if (response.author.id != "448110812801007618") return;

		if (response.channel.id != msg.channel.id) return;
		if (!response.embeds[0]) return;
		if (!response.embeds[0].title) return;
		if (response.embeds[0].title.split(" | ")[1]!= msg.author.username) return;

		let embed = response.embeds[0];

		let splited_embed = {
			"title": embed.title.split(" | "),
			"fields": embed.fields.map(f => {
				return f.value.split(" | ").map(e => {
					return {
						"full": e,
						"emoji": e.split(":")[1],
						"value": (() => {
							if (!e.split(":")[2]) return undefined;
							let v = e.split(":")[2].slice(1)
							if (v.includes("/")) {
								v = v.split("/").map(int => parseInt(int));
							} else if (!isNaN(parseInt(v))) {
								v = parseInt(v);
							}
							return v;
						})()
					}
				})
			})
		}

		let data = {
			lvl: parseInt(splited_embed.title[2].split(" ")[1]),
			pv: splited_embed.fields[0][0].value[0],
			max_pv: splited_embed.fields[0][0].value[1],
			xp: splited_embed.fields[0][1].value[0],
			max_xp: splited_embed.fields[0][1].value[1],
			gold: splited_embed.fields[0][2].value,
			energy: splited_embed.fields[1][0].value[0],
			max_energy: splited_embed.fields[1][0].value[1],
			strenght: splited_embed.fields[1][1].value,
			defense: splited_embed.fields[1][2].value,
			speed: splited_embed.fields[1][3].value,
			gems: splited_embed.fields[2][0].value,
			quest_missions_percentage: splited_embed.fields[2][1].value,
			rank: splited_embed.fields[3][0].value[0],
			rank_points: splited_embed.fields[3][1].value,
			class: {
				name: splited_embed.fields[4][0].value,
				emoji: `:${splited_embed.fields[4][0].emoji}:`,
			},
			guild_name: (()=>{
				if (embed.fields[5].name != "Guilde :") return undefined;
				return splited_embed.fields[5][0].value;
			})(),
			destination: splited_embed.fields[6][0].full
		}

		db.push(`/users/${user_hash}/tracking[]`, {
			type: "profile",
			timestamp: response.createdTimestamp,
			data: data
		});
	}
	client.on('messageCreate', response_listener);

	setTimeout(() => {
		client.removeListener('messageCreate', response_listener);
	}, 10000);
}

client.setMaxListeners(0);
client.on('interactionCreate', cmd_listener);
client.on('messageCreate', help_msg_listener);
client.on('messageCreate', fetch_guild_listener);
client.on('messageCreate', propo_msg_listener);
client.on('messageCreate', long_report_listener);
client.on('messageCreate', short_report_listener);
client.on('messageCreate', profile_listener);

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