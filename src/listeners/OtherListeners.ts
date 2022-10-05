import { Interaction, Message } from "discord.js";
import { LogUtils } from "../Utils.js";

export class OtherListeners {
	static async command(interaction: Interaction) {
		if (!interaction.isCommand()) return;
	
		const { commandName } = interaction;
		const command: any = client.commands.get(commandName);
	
		if (!command) return;
	
		LogUtils.log(`${interaction.user.username} executed ${commandName}`);
	
		command.execute(interaction);
	}
	
	static async help(msg: Message) {
		if (["help", "$help", "!help", "?help", `<@${client.user.id}>`, `<@${client.user.id}> help`].includes(msg.content.toLowerCase())) {
			await msg.channel.send("Si vous voulez la liste des commandes, utilisez la commande `/help`");
		}
	}
}