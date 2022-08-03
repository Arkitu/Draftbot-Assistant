import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Context } from '../../libs/Context.js';
import { DB_Reminder } from '../../libs/Interfaces.js';

export const data = new SlashCommandBuilder()
	.setName('reminders')
	.setDescription('Renvois la liste des rappels');
export async function execute(ctx: Context) {
	await ctx.interaction.deferReply();

	let reminders = ctx.db.getData('/reminders').filter((reminder: DB_Reminder) => reminder.author_id == ctx.interaction.user.id);

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
		.setColor(ctx.config.getData("/main_color"))
		.setTitle(`Rappels de ${ctx.interaction.user.username}`)
		.setDescription(str_reminders);
	
	ctx.interaction.editReply({ embeds: [embed] });
}