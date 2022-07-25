import { Client, Intents, Collection, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { Reminder } from './libs/Reminder.js';
import { createHash } from "crypto";

// Import config and db
const config = new JsonDB(new Config("config", false, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));
const constants = new JsonDB(new Config("constants", false, true, '/'));

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
	client.users.fetch(config.getData("/creator_id")).then(u => u.send("🔄 Le bot a redemarré !"));
	// Relauch the stoped reminders
	for (let reminder of db.getData("/reminders")) {
		let channel;
		if (!client.users.cache.get(reminder.author_id)) {
			db.delete(`/reminders[${db.getIndex("/reminders", reminder.id, "id")}]`)
			continue;
		}
		if (reminder.channel.channel_type) {
			if (!client.channels.cache.get(reminder.channel.channel_id)) {
				db.delete(`/reminders[${db.getIndex("/reminders", reminder.id, "id")}]`)
				continue;
			}
			channel = { 
				channel: client.channels.cache.get(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			};
		} else {
			if (!client.users.cache.get(reminder.channel.channel_id)) {
				db.delete(`/reminders[${db.getIndex("/reminders", reminder.id, "id")}]`)
				continue;
			}
			channel = {
				channel: client.users.cache.get(reminder.channel.channel_id),
				channel_type: reminder.channel.channel_type
			}
		}
		new Reminder(client, channel, reminder.dead_line_timestamp, reminder.message, client.users.cache.get(reminder.author_id), db, config).start();
	}
});

// Set listeners
let cmd_listener = async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;
		const command = client.commands.get(commandName);

		if (!command) return;

		log(`${interaction.user.username} execute ${commandName}`);

		command.execute(interaction, config, db, constants);
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
            level: parseInt((await msg.embeds[0].fields[1].name.split(" "))[6]) + (parseInt((await msg.embeds[0].fields[1].name.split(" "))[1]) / parseInt((await msg.embeds[0].fields[1].name.split(" "))[3])),
			description: "",
			last_update: Date.now(),
        }
		if (isNaN(guild.level)) guild.level = 100;
		if (msg.embeds[0].description) {
			guild.description = msg.embeds[0].description.split("`")[1];
		}
        db.push(`/guilds/${guild.name}`, guild);
		log(`Guild ${guild.name} fetched. Level: ${Math.round(guild.level*100)/100}`);
    }
}


function generateTimeDisplay(milliseconds) {
	let minutes = Math.ceil(milliseconds / 60000);
	const hours = Math.floor(minutes / 60);
	minutes %= 60;

	if (hours > 0) {
		return hours + " H " + minutes + " Min";
	}
	return minutes + " Min";
}

function getTimeLostByString(timeLost) {
		//Triggers only if there is no "hour"
		if (timeLost.length === 1) {
			return parseInt(timeLost[0]) * 60000;
		}
		return parseInt(timeLost[0]) * 3600000 + parseInt(timeLost[1]) * 60000;
}

const eventsMsgListener = async (message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.content) return;
	if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(message.content))) return;
	const userHash = createHash('md5').update(message.content.slice(message.content.indexOf("<@") + 2, message.content.indexOf(">"))).digest('hex');
	if (!(userHash in db.getData("/users"))) return;
	if (!db.getData(`/users/${userHash}/config/reminders/auto_proposition/events`)) return;

	const timeBetweenMinievents = constants.getData("/times/betweenMinievents");
	//A time for the possibility where 1) no alte/no time lost 2)  the player wants to skip alte / losetime with shop right after
	const reminders = [timeBetweenMinievents];

	if (message.content.includes(constants.getData("/regex/timeLostBigEvent"))) {
		const splicedMessage = message.content.split(" | ");

		reminders.push(timeBetweenMinievents
			+ getTimeLostByString(
			//The time lost is always just before the text
			splicedMessage[splicedMessage.length - 2]
					//:clock10: Temps perdu : hours H minutes Min -> hours H minutes
					.slice(26, -6)
					.split(" H ")
			)
		);
	}
	//If it ends by an emoji, there's an alteration
	if (message.content.endsWith(constants.getData("/regex/emojiEnd"))) {
		const splitedMessage = message.content.split(" ");
		reminders.push(timeBetweenMinievents
			+ constants.getData(`/effectDurations/${splitedMessage[splitedMessage.length - 1]}`)
		);
	}
		
	await proposeAutoReminder(message, reminders,
		//Get user from mention in the text
		await client.users.fetch(message.content.slice(message.content.indexOf("<@") + 2, message.content.indexOf(">")))
	);
};

const minieventMsgListener = async (message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
	const userID = message.interaction ? message.interaction.user.id
		: message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const userHash = createHash('md5').update(userID).digest('hex');
	if (!(userHash in db.getData("/users"))) return;
	if (!db.getData(`/users/${userHash}/config/reminders/auto_proposition/minievents`)) return;
	let text = message.embeds[0].description;
	if (constants.getData("/regex/twoMessagesMinieventsEmojis").some(emoji => text.startsWith(emoji))) return;
	for (const obj of constants.getData("/regex/possibleTwoMessagesMinievents")) {
		if (text.startsWith(obj.emoji) && text.endsWith(obj.endsWith)) return;
	}

	const timeBetweenMinievents = constants.getData("/times/betweenMinievents");
	const reminders = [timeBetweenMinievents];

	if (new RegExp(constants.getData("/regex/hasLoseTimeEmoji")).test(text)) {
		let loseTimeEmojiPosition = text.indexOf(constants.getData("/regex/hasLoseTimeEmoji").split("|")[0]);
		if (loseTimeEmojiPosition === -1) {
			loseTimeEmojiPosition = text.indexOf(constants.getData("/regex/hasLoseTimeEmoji").split("|")[1])
		}
		reminders.push(timeBetweenMinievents
			+ getTimeLostByString(text
				//Between the end of the '**' and the start of the emoji
				.slice(text.indexOf("**") + 2, loseTimeEmojiPosition)
				.replace("**", "")
				.split(" H ")
			)
		);
	}

	//Remove 2nd text.endsWith for the next draftbot update, for now there's a typo on bigBadEvent's head bandage sentence
	if (text.endsWith(constants.getData("/regex/emojiEnd") || text.endsWith(":head_bandage:."))) {
		const splitedMessage = text.split(" ");
		reminders.push(timeBetweenMinievents
			+ constants.getData(`/effectDurations/${splitedMessage[splitedMessage.length - 1]}`));
	}

	await proposeAutoReminder(message, reminders, await client.users.fetch(userID));
};

const guildDailyMessageListener = async message => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "guilddaily") return;

	let user_hash = createHash('md5').update(message.interaction.user.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.reminders.auto_proposition.guilddaily) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenGuildDailies")], message.interaction.user);
}

const dailyMessageListener = async message => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "daily") return;

	let user_hash = createHash('md5').update(message.interaction.user.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.reminders.auto_proposition.daily) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenDailies")], message.interaction.user);
}

const petFeedMessageListener = async message => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFeedAuthorEnd"))) return;

	const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const user_hash = createHash('md5').update(userID).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	const db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.reminders.auto_proposition.petfeed) return;

	const reminders = [];
	constants.getData("/pets/" + message.embeds[0].description.replace("**", "").split(" ")[0])
		.forEach(rarity => {
			reminders.push(rarity * constants.getData("/times/betweenBasicPetFeeds"))
		});

	await proposeAutoReminder(message, reminders, await client.users.fetch(userID));
}

const petFreeMessageListener = async message => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFreeAuthorEnd"))) return;
	// Get rid of first part of /petfree
	if (message.interaction) return;

	const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const user_hash = createHash('md5').update(userID).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	const db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.reminders.auto_proposition.petfree) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenPetFrees")], await client.users.fetch(userID));
}

const voteMessageListener = async message => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "vote") return;

	let user_hash = createHash('md5').update(message.interaction.user.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.reminders.auto_proposition.vote) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenVotes"), constants.getData("/times/betweenUsefulVotes")], message.interaction.user);
}

async function proposeAutoReminder(message, reminders, author) {
	const components = new MessageActionRow();
	reminders.forEach((time) => {
		components.addComponents(
			new MessageButton()
				.setCustomId(time.toString())
				.setLabel(generateTimeDisplay(time))
				.setStyle("PRIMARY")
		);
	});
	components.addComponents(
		new MessageButton()
			.setCustomId("remove")
			.setLabel("Non")
			.setStyle("DANGER")
	);

	await addReminder(await message.reply({content: `Voulez-vous ajouter un rappel ?`, components: [components]}), author);
}

async function addReminder(propositionMessage, author) {
	const listener = async (interaction) => {
		if (!interaction.isButton()) return;
		if (interaction.message.id != propositionMessage.id) return;
		if (interaction.user.id != author.id) 
			interaction.reply({content: ":warning: Désolé, vous n'êtes pas la personne à qui est destinée cette proposition", ephemeral: true});
		if (interaction.customId === "remove") {
			interaction.message.delete();
			return;
		}

		interaction.update({content: "Rappel ajouté !", components: []});
		const endDate = interaction.message.createdTimestamp + parseInt(interaction.customId);
		const reminder = new Reminder(
			client,
			{
				channel: db.getData(`/users/${createHash('md5').update(author.id).digest('hex')}/config/reminders/auto_proposition/in_dm`)
					? author : propositionMessage.channel,
				channel_type: "text"
			},
			endDate,
			`Vous avez ajouté un rappel il y a ${generateTimeDisplay(parseInt(interaction.customId))}`,
			author,
			db,
			config
		);
		reminder.save();
		reminder.start();
		await log(`${author.username} ajoute un rappel pour dans ${generateTimeDisplay(parseInt(interaction.customId))} suite à une proposition de rappel automatique`);
	};

	propositionMessage
	client.on('interactionCreate', listener);
		setTimeout(() => {
			client.removeListener('interactionCreate', listener);
			if (propositionMessage.deletable) {
				propositionMessage.delete();
			}
		}, 60000
	);
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
			if (button_interaction.user.id != msg.author.id) {
				button_interaction.reply({ content: ":warning: Désolé, vous n'êtes pas la personne à qui est destinée cette proposition", ephemeral: true});
			}

			switch (button_interaction.customId) {
				case "add":
					button_interaction.update({ content: "Rappel ajouté !", components: [] });
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
					let new_reminder = new Reminder(client, { channel: reminder.in_dm ? msg.author : msg.channel, channel_type: "text" }, dead_line.getTime(), `Vous avez ajouté un rappel il y a ${reminder.duration} ${reminder.unit} après le message \`${msg.content}\``, msg.author, db, config);
					await new_reminder.save();
					await new_reminder.start();
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
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (!msg.content) return;
	if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(msg.content))) return;

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
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (msg.embeds.length === 0) return;
	if(!msg.embeds[0].author) return;
	if (!msg.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
	if (!msg.interaction) return;

	let user_hash = createHash('md5').update(msg.interaction.user.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.reports) return;

	db.push(`/users/${user_hash}/tracking[]`, {
		type: "short_report",
		timestamp: msg.createdTimestamp
	});
	log("Short repport tracked");
}

let profile_listener = async msg => {
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (!msg.interaction) return;
	if (msg.interaction.commandName !== "profile") return;
	if (msg.interaction.user.username !== msg.embeds[0].title.split(" | ")[1]) return;

	let user_hash = createHash('md5').update(msg.interaction.user.id).digest('hex');
	if (!(user_hash in db.getData("/users"))) return;
	let db_user = db.getData(`/users/${user_hash}`);
	if (!db_user.config.tracking.profile) return;

	let embed = msg.embeds[0];

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
		guild_name: embed.fields[5].name === "Guilde :" ? splited_embed.fields[5][0].value : undefined,
		//Bot crashed if the user didn't have a guild while using the command
		destination: splited_embed.fields[splited_embed.fields.length - 1][0].full
	}

	db.push(`/users/${user_hash}/tracking[]`, {
		type: "profile",
		timestamp: msg.createdTimestamp,
		data: data
	});
	if (db_user.config.goal) {
		if (db_user.config.goal.end < msg.createdTimestamp) {
			await msg.channel.send({ embeds: [
				new MessageEmbed()
					.setColor(config.getData("/main_color"))
					.setTitle("Expiration de votre objectif")
					.setDescription(`Votre objectif de ${db_user.config.goal.value} ${
						{
							lvl: "niveaux",
							gold: ":moneybag:",
							pv: ":heart:",
							xp: ":star:",
							gems: ":gem:",
							quest_missions_percentage: "% de missions de quêtes",
							rank_points: ":medal:"
						}[db_user.config.goal.unit]
					} a expiré, vous pouvez en définir un nouveau avec \`/set_goal\``)
			]});
			db.delete(`/users/${user_hash}/config/goal`);
		} else if (db_user.config.goal.value <= data[db_user.config.goal.unit] ) {
			await msg.channel.send({ embeds: [
				new MessageEmbed()
					.setColor(config.getData("/main_color"))
					.setTitle("Objectif atteint !")
					.setDescription(`<@${msg.author.id}>, vous avez atteint votre objectif de ${db_user.config.goal.value} ${
						{
							lvl: "niveaux",
							gold: ":moneybag:",
							pv: ":heart:",
							xp: ":star:",
							gems: ":gem:",
							quest_missions_percentage: "% de missions de quêtes",
							rank_points: ":medal:"
						}[db_user.config.goal.unit]
					} !`)
			]});
			db.delete(`/users/${user_hash}/config/goal`);
		}
	}
}

client.setMaxListeners(0);
client.on('interactionCreate', cmd_listener);
client.on('messageCreate', (message) => {
	help_msg_listener(message);
	fetch_guild_listener(message);
	propo_msg_listener(message);
	long_report_listener(message);
	short_report_listener(message);
	profile_listener(message);
	eventsMsgListener(message);
	minieventMsgListener(message);
	guildDailyMessageListener(message);
	dailyMessageListener(message);
	petFeedMessageListener(message);
	petFreeMessageListener(message);
	voteMessageListener(message);
});

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