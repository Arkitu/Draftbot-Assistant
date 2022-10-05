import { Collection, Intents, Interaction, Message, MessageActionRow, MessageButton, Client as DiscordClient } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { join, dirname } from 'path';
import { User } from './sequelize/models/user.js';
import { RemindListeners as Remind} from './listeners/RemindListeners.js';
import { TrackingListeners as Track } from './listeners/TrackingListeners.js';
import './sequelize/models/index.js';

global.botDir = new URL(import.meta.url);
global.botDirString = (()=>{
	let urlArray = decodeURI(botDir.pathname).split("/");
	urlArray.pop();
	return urlArray.join("/");
})();
// Import config and constants
global.config = new JsonDB(new Config(`${botDirString}/../config.json`, true, true, '/'));
global.constants = new JsonDB(new Config(`${botDirString}/../constants.json`, true, true, '/'));

// Some utils functions
export function log(msg: string) {
	const datetime: string = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
}

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

export class Client extends DiscordClient {
	public commands: Collection<string, any> = new Collection();
}

// Create a new client instance
global.client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	log('Bot logged !');
	client.users.fetch(config.getData("/creator_id")).then(u => u.send("🔄 Le bot a redemarré !"));
	await db.authenticate();
	setTimeout(async ()=>{
		// Relauch the stoped reminders
		for (let reminder of await db.models.Reminder.findAll()) {
			console.debug(reminder.toJSON())
			reminder.start()
		}
	}, 5000)
});

export function getTimeLostByString(timeDisplayed: string): number {
	const splitedDisplay = timeDisplayed.split(" H");
	const lastElement = splitedDisplay[splitedDisplay.length - 1].replace(" Min", "");

	const hours = splitedDisplay.length > 1 ? parseInt(splitedDisplay[0]) : 0;
	// If there are only hours, the list is ["number", ""]
	const minutes = lastElement !== "" ? parseInt(lastElement) : 0;
	return hours * 3600000 + minutes * 60000;
}

export async function proposeAutoReminder(message: Message, reminders: number[], author: User) {
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

async function addReminder(propositionMessage: Message, author: User) {
	const listener = async (interaction: Interaction) => {
		if (!interaction.isButton()) return;
		if (!(interaction.message instanceof Message)) return;
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
		author.createReminder({
			channelId: author.config.reminders.auto_proposition.in_dm
				? author.discordId : propositionMessage.channel.id,
			channelIsUser: author.config.reminders.auto_proposition.in_dm,
			deadLineTimestamp: endDate,
			message: `Vous avez ajouté un rappel il y a ${generateTimeDisplay(parseInt(interaction.customId))}`
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

async function cmdListener(interaction: Interaction) {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const command: any = client.commands.get(commandName);

	if (!command) return;

	log(`${interaction.user.username} execute ${commandName}`);

	command.execute(interaction);
}
async function helpListener(msg: Message) {
	if (["help", "$help", "!help", "?help", `<@${client.user.id}>`, `<@${client.user.id}> help`].includes(msg.content.toLowerCase())) {
		await msg.channel.send("Si vous voulez la liste des commandes, utilisez la commande `/help`");
	}
}

client.setMaxListeners(0);
client.on('interactionCreate', cmdListener);
client.on('messageCreate', (message) => {
	if (message.author.id === config.getData("/draftbot_id")) {
		if (message.content) {
			Remind.event(message);

			Track.event(message);
		}
		if (message.interaction) {
			if (message.embeds.length !== 0) {
				if (message.embeds[0].author) {
					Remind.petFree(message);
					Remind.petFeed(message);
					Track.miniEvent(message);
				}
				Remind.miniEvent(message); // Not with the minievent track because sometimes the result of the minievent comes in another message (gobletsGame for example), without the classical formated author
				Remind.guildDaily(message);
				Remind.daily(message);
				Remind.vote(message);
				Track.fetchGuild(message);
				Track.profile(message);
			}
		}
	}
	else {
		if (!message.content) return;
		helpListener(message);
		Remind.propo(message);
	}
});

// Import all the commands from the commands files
client.commands = new Collection();
const admin_path = new URL("commands/admin/", botDir)
const everyone_path = new URL("commands/everyone/", botDir)
const commandFiles = {
	admin: readdirSync(admin_path).filter(file => file.endsWith(".js")),
	everyone: readdirSync(everyone_path).filter(file => file.endsWith(".js"))
};
for (const file of commandFiles.admin) {
	import(join(dirname(botDir.pathname), "commands", "admin", file))
  		.then((command) => {
    		client.commands.set(command.data.name, command);
  		});
}
for (const file of commandFiles.everyone) {
	import(join(dirname(botDir.pathname), "commands", "everyone", file))
  		.then((command) => {
    		client.commands.set(command.data.name, command);
  		});
}

// Login to Discord
client.login(config.getData("/token"));