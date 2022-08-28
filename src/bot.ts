import { Intents, Collection, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import * as Discord from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { createHash } from "crypto";
import { Sequelize } from 'sequelize-typescript';
import { PropoReminder, sequelizeModels, User } from './models';

// Import config, constants, sequelize, models
config = new JsonDB(new Config("../config", true, true, '/'));
constants = new JsonDB(new Config("../constants", true, true, '/'));
models = sequelizeModels;

const sequelize = new Sequelize("sqlite::memory", {
	models: Object.values(models)
});

sequelize.sync({ alter: true });

// Some utils functions
export function log(msg: string) {
	var datetime: string = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
};

export async function log_error(msg: string) {
	log(`ERROR: ${msg}`);
	await (await client.users.fetch(config.getData("/creator_id"))).send(`:warning: ERROR: ${msg}`);
}

export function generateTimeDisplay(milliseconds: number): string {
	let seconds = Math.ceil(milliseconds / 1000);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	seconds %= 60;
	minutes %= 60;
	hours %= 24;

	let arrayTime: string[] = [];
	if (days > 0) {
		arrayTime.push(days + "j");
	}
	if (hours > 0) {
		arrayTime.push(hours + "h");
	}
	if (minutes > 0) {
		arrayTime.push(minutes + "min");
	}
	if (seconds > 0) {
		arrayTime.push(seconds + "s");
	}

	return arrayTime.join(" ");
}

export class Client extends Discord.Client {
	public commands: Collection<string, any> = new Collection();
}

// Create a new client instance
client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	log('Bot logged !');
	client.users.fetch(config.getData("/creator_id")).then(u => u.send("🔄 Le bot a redemarré !"));
	// Relauch the stoped reminders
	for (let reminder of await models.Reminder.findAll()) {
		reminder.start()
	}
});

// Set listeners
let cmdListener = async (interaction: Discord.Interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const command: any = client.commands.get(commandName);

	if (!command) return;

	log(`${interaction.user.username} execute ${commandName}`);

	command.execute(interaction);
}

let helpMsgListener = async (msg: Discord.Message) => {
	if (["help", "$help", "!help", "?help", `<@${client.user.id}>`, `<@${client.user.id}> help`].includes(msg.content.toLowerCase())) {
		await msg.channel.send("Si vous voulez la liste des commandes, utilisez la commande `/help`");
	}
}

let fetchGuildListener = async (msg: Discord.Message) => {
	if (msg.author.id != "448110812801007618") return;
	if (!msg.embeds.length) return;
	if (!msg.embeds[0].title) return;
    if (!msg.embeds[0].title.startsWith("Guilde ")) return;
	let guild = new models.Guild({
		name: msg.embeds[0].title.substring(7),
		level: parseInt((msg.embeds[0].fields[1].name.split(" "))[6]) + (parseInt((msg.embeds[0].fields[1].name.split(" "))[1]) / parseInt((msg.embeds[0].fields[1].name.split(" "))[3])),
		description: "",
	})
	if (isNaN(guild.level)) guild.level = 100;
	if (msg.embeds[0].description) {
		guild.description = msg.embeds[0].description.split("`")[1];
	}
	guild.save();
	log(`Guild ${guild.name} fetched. Level: ${Math.round(guild.level*100)/100}`);
}

function getTimeLostByString(timeDisplayed: string): number {
	const splitedDisplay = timeDisplayed.split(" H");
	const lastElement = splitedDisplay[splitedDisplay.length - 1].replace(" Min", "");

	const hours = splitedDisplay.length > 1 ? parseInt(splitedDisplay[0]) : 0;
	// If there are only hours, the list is ["number", ""]
	const minutes = lastElement !== "" ? parseInt(lastElement) : 0;
	return hours * 3600000 + minutes * 60000;
}

const eventsMsgListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.content) return;
	if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(message.content))) return;
	const user = await models.User.findByPk(message.content.slice(message.content.indexOf("<@") + 2, message.content.indexOf(">"))) // get the user
	if (!user) return;
	if (!user.config.reminders.auto_proposition.events) return;

	const timeBetweenMinievents: number = constants.getData("/times/betweenMinievents");
	//A time for the possibility where 1) no alte/no time lost 2)  the player wants to skip alte / losetime with shop right after
	const reminders = [timeBetweenMinievents];

	if (message.content.includes(constants.getData("/regex/timeLostBigEvent"))) {
		const splicedMessage = message.content.split(" | ");

		reminders.push(timeBetweenMinievents
			+ getTimeLostByString(
				//The time lost is always just before the text
				splicedMessage[splicedMessage.length - 2]
					.slice(26, -2)
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
		
	await proposeAutoReminder(message, reminders, user);
};

const minieventMsgListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
	const userID = message.interaction ? message.interaction.user.id
		: message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const user = await models.User.findByPk(userID);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.minievents) return;
	let text = message.embeds[0].description;
	if (constants.getData("/regex/twoMessagesMinieventsEmojis").some((emoji: string) => text.startsWith(emoji))) return;
	for (const obj of constants.getData("/regex/possibleTwoMessagesMinievents")) {
		if (text.startsWith(obj.emoji) && text.endsWith(obj.endsWith)) return;
	}

	const timeBetweenMinievents: number = constants.getData("/times/betweenMinievents");
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
			)
		);
	}

	//Remove 2nd text.endsWith for the next draftbot update, for now there's a typo on bigBadEvent's head bandage sentence
	if (text.endsWith(constants.getData("/regex/emojiEnd") || text.endsWith(":head_bandage:."))) {
		const splitedMessage = text.split(" ");
		if (constants.getData("/effectDurations").hasOwnProperty(splitedMessage[splitedMessage.length - 1])) {
			reminders.push(timeBetweenMinievents
				+ constants.getData(`/effectDurations/${splitedMessage[splitedMessage.length - 1]}`));
		}
	}

	await proposeAutoReminder(message, reminders, user);
};

const guildDailyMessageListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "guilddaily") return;

	const user = await models.User.findByPk(message.interaction.user.id);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.guilddaily) return;


	await proposeAutoReminder(message, [constants.getData("/times/betweenGuildDailies")], user);
}

const dailyMessageListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "daily") return;

	const user = await models.User.findByPk(message.interaction.user.id);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.daily) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenDailies")], user);
}

const petFeedMessageListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFeedAuthorEnd"))) return;

	const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const user = await models.User.findByPk(userID);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.petfeed) return;

	const reminders: number[] = [];
	constants.getData("/pets/" + message.embeds[0].description.replace("**", "").split(" ")[0])
		.forEach((rarity: number) => {
			reminders.push(rarity * constants.getData("/times/betweenBasicPetFeeds"))
		});

	await proposeAutoReminder(message, reminders, user);
}

const petFreeMessageListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (message.embeds.length === 0) return;
	if(!message.embeds[0].author) return;
	if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFreeAuthorEnd"))) return;
	// Get rid of first part of /petfree
	if (message.interaction) return;

	const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
	const user = await models.User.findByPk(userID);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.petfree) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenPetFrees")], user);
}

const voteMessageListener = async (message: Discord.Message) => {
	if (message.author.id !== config.getData("/draftbot_id")) return;
	if (!message.interaction) return;
	if (message.interaction.commandName !== "vote") return;

	const user = await models.User.findByPk(message.interaction.user.id);
	if (!user) return;
	if (!user.config.reminders.auto_proposition.vote) return;

	await proposeAutoReminder(message, [constants.getData("/times/betweenVotes"), constants.getData("/times/betweenUsefulVotes")], user);
}

let propoMsgListener = async (message: Discord.Message) => {
	if (!message.content) return;
	const user = await models.User.findByPk(message.author.id)
	if (!user) return;
	const reminders = await user.$get('propoReminders', {
		where: {
			trigger: message.content
		}
	})
	if (!reminders.length) return;

	await proposeAutoReminder(message, reminders.map(r=>r.duration), user)
}

async function proposeAutoReminder(message: Discord.Message, reminders: number[], author: User) {
	const components = new MessageActionRow();
	reminders.forEach((time: number) => {
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

async function addReminder(propositionMessage: Discord.Message, author: User) {
	const listener = async (interaction: Discord.Interaction) => {
		if (!interaction.isButton()) return;
		if (!(interaction.message instanceof Discord.Message)) return;
		if (interaction.message.id != propositionMessage.id) return;
		if (interaction.user.id != author.discordId) {
			interaction.reply({content: ":warning: Désolé, vous n'êtes pas la personne à qui est destinée cette proposition", ephemeral: true});
			return;
		}
		if (interaction.customId === "remove") {
			interaction.message.delete();
			propositionMessage = interaction.message;
			return;
		}

		interaction.update({content: "Rappel ajouté !", components: []});
		const endDate = interaction.message.createdTimestamp + parseInt(interaction.customId);
		models.Reminder.create({
			channelId: author.config.reminders.auto_proposition.in_dm
				? author.discordId : propositionMessage.channel.id,
			channelIsUser: author.config.reminders.auto_proposition.in_dm,
			deadLineTimestamp: endDate,
			message: `Vous avez ajouté un rappel il y a ${generateTimeDisplay(parseInt(interaction.customId))}`,
			author: author
		}).then((r)=>r.start())
		propositionMessage = interaction.message;
		log(`${author.discordUser.toString()} ajoute un rappel pour dans ${generateTimeDisplay(parseInt(interaction.customId))} suite à une proposition de rappel automatique`);
	};

	client.on('interactionCreate', listener);
	setTimeout(() => {
		client.removeListener('interactionCreate', listener);
		if (propositionMessage.deletable && propositionMessage.components.length>0) {
			propositionMessage.delete();
		}
	}, 60000);
}

let longReportListener = async (msg: Discord.Message) => {
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (!msg.content) return;
	if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(msg.content))) return;

	const user = await models.User.findByPk(msg.content.split("<@")[1].split(">")[0])
	if (!user) return;
	if (!user.config.tracking.reports) return;

	// Training message : :newspaper: ** Journal de @Arkitu  :** :medal: Points gagnés : ** 358** | :moneybag: Argent gagné : ** 24** | :star: XP gagné : ** 25** | :clock10: Temps perdu : ** 45 Min ** | ⛓️ Vous grimpez jusqu'en haut des échafaudages, mais à l'exception d'un magnifique paysage, vous ne trouvez rien. Après avoir passé quelques minutes à l'admirer, vous repartez.
	const data = {
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
			name: e.split("**").slice(0, 2)[0].slice(0, -3),
			value: e.split("**").slice(0, 2)[1].slice(1)
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

	const tracking = new models.Tracking({
		type: "long_report",
		data: data
	});
	user.$add('tracking', tracking);
	tracking.save()

	log("Long repport tracked");
}

let shortReportListener = async (msg: Discord.Message): Promise<void> => {
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (msg.embeds.length === 0) return;
	if(!msg.embeds[0].author) return;
	if (!msg.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
	if (!msg.interaction) return;

	const user = await models.User.findByPk(msg.interaction.user.id)
	if (!user) return;
	if (!user.config.tracking.reports) return;

	const tracking = new models.Tracking({
		type: "short_report"
	});
	user.$add('tracking', tracking);
	tracking.save()

	log("Short repport tracked");
}

let profileListener = async (msg: Discord.Message): Promise<void> => {
	if (msg.author.id !== config.getData("/draftbot_id")) return;
	if (!msg.interaction) return;
	if (msg.interaction.commandName !== "profile") return;
	if (msg.interaction.user.username !== msg.embeds[0].title.split(" | ")[1]) return;

	const user = await models.User.findByPk(msg.interaction.user.id, {include:[models.Goal]})
	if (!user) return;
	if (!user.config.tracking.reports) return;

	let embed = msg.embeds[0];

	let splited_embed = {
		title: embed.title.split(" | "),
		fields: embed.fields.map(f => {
			return f.value.split(" | ").map(e => {
				return {
					full: e,
					emoji: e.split(":")[1],
					value: (() => {
						if (!e.split(":")[2]) return undefined;
						let v: string = e.split(":")[2].slice(1)
						return v;
					})()
				}
			})
		})
	}

	let data = {
		lvl: parseInt(splited_embed.title[2].split(" ")[1]),
		pv: parseInt(splited_embed.fields[0][0].value.split("/")[0]),
		max_pv: parseInt(splited_embed.fields[0][0].value.split("/")[1]),
		xp: parseInt(splited_embed.fields[0][1].value.split("/")[0]),
		max_xp: parseInt(splited_embed.fields[0][1].value.split("/")[1]),
		gold: parseInt(splited_embed.fields[0][2].value),
		energy: parseInt(splited_embed.fields[1][0].value.split("/")[0]),
		max_energy: parseInt(splited_embed.fields[1][0].value.split("/")[1]),
		strenght: parseInt(splited_embed.fields[1][1].value),
		defense: parseInt(splited_embed.fields[1][2].value),
		speed: parseInt(splited_embed.fields[1][3].value),
		gems: parseInt(splited_embed.fields[2][0].value),
		quest_missions_percentage: parseInt(splited_embed.fields[2][1].value),
		rank: parseInt(splited_embed.fields[3][0].value.split("/")[0]),
		rank_points: parseInt(splited_embed.fields[3][1].value),
		class: {
			name: splited_embed.fields[4][0].value,
			emoji: `:${splited_embed.fields[4][0].emoji}:`,
		},
		guild_name: embed.fields[5].name === "Guilde :" ? splited_embed.fields[5][0].value : null,
		//Bot crashed if the user didn't have a guild while using the command
		destination: splited_embed.fields[splited_embed.fields.length - 1][0].full
	}

	const tracking = new models.Tracking({
		type: "profile",
		data: data
	});
	user.$add('trackings', tracking);
	tracking.save();

	for (let goal of user.goals) {
		if (goal.end < msg.createdTimestamp) {
			await msg.channel.send({ embeds: [
				new MessageEmbed()
					.setColor(config.getData("/main_color"))
					.setTitle("Expiration de votre objectif")
					.setDescription(`Votre objectif de ${goal.value} ${
						{
							lvl: "niveaux",
							gold: ":moneybag:",
							pv: ":heart:",
							xp: ":star:",
							gems: ":gem:",
							quest_missions_percentage: "% de missions de quêtes",
							rank_points: ":medal:"
						}[goal.unit]
					} a expiré, vous pouvez en définir un nouveau avec \`/set_goal\``)
			]});
			goal.destroy();
		} else if (goal.endValue <= data[goal.unit] ) {
			await msg.channel.send({ embeds: [
				new MessageEmbed()
					.setColor(config.getData("/main_color"))
					.setTitle("Objectif atteint !")
					.setDescription(`<@${msg.author.id}>, vous avez atteint votre objectif de ${goal.value} ${
						{
							lvl: "niveaux",
							gold: ":moneybag:",
							pv: ":heart:",
							xp: ":star:",
							gems: ":gem:",
							quest_missions_percentage: "% de missions de quêtes",
							rank_points: ":medal:"
						}[goal.unit]
					} !`)
			]});
			goal.destroy();
		}
	}
}

client.setMaxListeners(0);
client.on('interactionCreate', cmdListener);
client.on('messageCreate', (message) => {
	helpMsgListener(message);
	fetchGuildListener(message);
	propoMsgListener(message);
	longReportListener(message);
	shortReportListener(message);
	profileListener(message);
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
