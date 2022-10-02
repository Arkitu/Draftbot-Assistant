import { Collection, Intents, Interaction, Message, MessageActionRow, MessageButton, Client as DiscordClient } from 'discord.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { join, dirname } from 'path';
import { User } from './sequelize/models/user.js';
import { RemindListeners } from './listeners/RemindListeners.js';
import { TrackingListeners } from './listeners/TrackingListeners.js';
import './sequelize/models/index.js';
import { OtherListeners } from './listeners/OtherListeners.js';
import { TimeStringUtils, LogUtils } from './Utils.js';

global.botDir = new URL(import.meta.url);
global.botDirString = (()=>{
	let urlArray = decodeURI(botDir.pathname).split("/");
	urlArray.pop();
	return urlArray.join("/");
})();
// Import config and constants
global.config = new JsonDB(new Config(`${botDirString}/../config.json`, true, true, '/'));
global.constants = new JsonDB(new Config(`${botDirString}/../constants.json`, true, true, '/'));

export class Client extends DiscordClient {
	public commands: Collection<string, any> = new Collection();
}

// Create a new client instance
global.client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS
] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	LogUtils.log('Bot logged !');
	client.users.fetch(config.getData("/creator_id")).then(u => u.send("🔄 Le bot a redemarré !"));
	await db.authenticate();
	setTimeout(async ()=>{
		// Relauch the stoped reminders
		for (let reminder of await db.models.Reminder.findAll()) {
			try {
				await reminder.start()
			} catch (e) {
				reminder.destroy();
			}
		}
	}, 5000)
});

export async function proposeAutoReminder(message: Message, reminders: number[], author: User) {
	const components = new MessageActionRow();
	reminders.forEach((time: number) => {
		components.addComponents(
			new MessageButton()
				.setCustomId(time.toString())
				.setLabel(TimeStringUtils.generateTimeDisplay(time))
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
			message: `Vous avez ajouté un rappel il y a ${TimeStringUtils.generateTimeDisplay(parseInt(interaction.customId))}`
		}).then((r) => r.start())
		propositionMessage = interaction.message;
		LogUtils.log(`${author.discordUser.toString()} ajoute un rappel pour dans ${TimeStringUtils.generateTimeDisplay(parseInt(interaction.customId))} suite à une proposition de rappel automatique`);
	};

	client.on("interactionCreate", listener);
	setTimeout(() => {
		client.removeListener('interactionCreate', listener);
		if (propositionMessage.deletable && propositionMessage.components.length>0) {
			propositionMessage.delete();
		}
	}, 60000);
}

client.setMaxListeners(0);
client.on('interactionCreate', OtherListeners.command);
client.on('messageCreate', (message) => {
	if (message.author.id === config.getData("/draftbot_id")) {
		if (message.content) {
			RemindListeners.event(message);
			TrackingListeners.event(message);
		}
		if (message.interaction) {
			if (message.embeds.length !== 0) {
				if (message.embeds[0].author) {
					RemindListeners.petFree(message);
					RemindListeners.petFeed(message);
					TrackingListeners.miniEvent(message);
				}
				RemindListeners.miniEvent(message); // Not with the minievent track because sometimes the result of the minievent comes in another message (gobletsGame for example), without the classical formated author
				RemindListeners.guildDaily(message);
				RemindListeners.daily(message);
				RemindListeners.vote(message);
				TrackingListeners.fetchGuild(message);
				TrackingListeners.profile(message);
			}
		}
	}
	else {
		if (!message.content) return;
		RemindListeners.propo(message);
		OtherListeners.help(message);
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
