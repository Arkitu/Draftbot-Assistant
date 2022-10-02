import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, Interaction } from 'discord.js';
import { CommandInteraction, MessageActionRow, MessageButton, User as DiscordUser } from 'discord.js';

async function createReminders(page: number, user: DiscordUser): Promise<{embed: MessageEmbed, components: MessageActionRow[]}> {
	const embed = new MessageEmbed()
		.setColor(config.getData("/main_color"))
		.setTitle(`Rappels de ${user.username}`)
	
	const buttons = new MessageActionRow();

	const reminders = await db.models.Reminder.findAll({
		offset: page*10,
		limit: 10,
		order: db.col('deadLineTimestamp'),
		where: {
			UserDiscordId: user.id
		}
	});

	if (reminders.length === 0) {
		embed.setDescription("Vous n'avez aucun rappel")
		return {
			embed: embed,
			components: []
		};
	}

	for (let reminder of reminders) {
		embed.addField(
			reminder.message,
			`id: ${reminder.id} | déclanchement <t:${reminder.deadLineTimestamp}:R> | salon: <${["#", "@"][+reminder.channelIsUser]}${reminder.channelId}>`
		)
	}

	if (
		reminders.length > 10
		&&
		(page+1)*10 < await db.models.Reminder.count({
			where: { UserDiscordId: user.id }
		})
	) {
		buttons.addComponents(
			new MessageButton()
				.setCustomId('next_page')
				.setStyle('SECONDARY')
				.setEmoji('➡')
		);
	}
	if (page > 0) {
		buttons.addComponents(
			new MessageButton()
				.setCustomId('previous_page')
				.setStyle('SECONDARY')
				.setEmoji('⬅')
		);
	}

	const components: MessageActionRow[] = [];

	if (buttons.components.length) components.push(buttons);

	return {
		embed: embed,
		components: components
	};
}

export const data = new SlashCommandBuilder()
	.setName('reminders')
	.setDescription('Renvois la liste des rappels');
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	let page = 0;
	let reminders = await createReminders(page, interaction.user);

	await interaction.editReply({ embeds: [reminders.embed], components: reminders.components })

	if (reminders.components) {
		let msg = await interaction.fetchReply();
		let button_listener = async (button_interaction: Interaction) => {
			if (!button_interaction.isButton()) return;
			if (button_interaction.message.id != msg.id) return;
			switch (button_interaction.customId) {
				case 'next_page':
					page++;
					break;

				case 'previous_page':
					page--;
					break;
			}
			reminders = await createReminders(page, interaction.user);
			await button_interaction.update({ embeds: [reminders.embed], components: reminders.components });
		};
		interaction.client.on('interactionCreate', button_listener);
		setTimeout(() => {
			if (!("edit" in msg)) return;
			msg.edit({ components: []});
			interaction.client.removeListener('interactionCreate', button_listener);
		}, 300000);
	}
}