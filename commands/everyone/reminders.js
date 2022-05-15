import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('reminders')
	.setDescription('Renvois la liste des rappels');
export async function execute(interaction, config, db) {
	await interaction.deferReply();

	let reminders = db.getData('/reminders').filter(reminder => reminder.author_id == interaction.user.id);

	let str_reminders = "";
	if (reminders.length > 0) {
		for (let reminder of reminders) {
			let delay = reminder.dead_line_timestamp - Date.now();
			let str_date = "";
			if (delay > 86400000) {
				str_date = `${Math.floor(delay / 86400000)} jour(s) `;
			} else if (delay > 3600000) {
				str_date = `${Math.floor(delay / 3600000)}h ${Math.floor(delay % 3600000 / 60000)}min`;
			} else if (delay > 60000) {
				str_date = `${Math.floor(delay / 60000)}min ${Math.floor(delay % 60000 / 1000)}sec`;
			} else if (delay > 1000) {
				str_date = `${Math.floor(delay / 1000)}sec`;
			} else if (delay > 0) {
				str_date = `${delay}ms`;
			} else {
				str_date = "maintenant";
			}
			str_reminders += `• **message :** ${reminder.message} - **temps restant :** ${str_date} - **salon :** <#${reminder.channel.channel_id}>\n\n`;
		}
	} else {
		str_reminders = "Vous n'avez aucun rappel";
	}

	let embed = new MessageEmbed()
		.setColor(config.getData("/main_color"))
		.setTitle(`Rappels de ${interaction.user.username}`)
		.setDescription(str_reminders);
	
	interaction.editReply({ embeds: [embed] });
}