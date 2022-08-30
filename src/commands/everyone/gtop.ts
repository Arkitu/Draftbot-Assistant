import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton, Interaction } from 'discord.js';
import { CommandInteraction } from 'discord.js';

async function createGtop(page: number): Promise<{embed: MessageEmbed, components: MessageActionRow[]}> {
	const embed = new MessageEmbed()
		.setTitle("🏆 Classement des guildes")
		.setColor(config.getData("/main_color"));
	
	const buttons = new MessageActionRow();

	const guilds =await models.Guild.findAll({
		offset: page*15,
		limit: 15,
		order: [["level", "DESC"]]
	});

	let description = "";

	for (let i = 0; i < guilds.length; i++) {
		let emoji;
		if (page === 1) {
			switch (i) {
				case 0:
					emoji = "🥇";
					break;
				case 1:
					emoji = "🥈";
					break;
				case 2:
					emoji = "🥉";
					break;
				case 3:
				case 4:
					emoji = "🎖️";
					break;
				default:
					emoji = "⚫";
					break;
			}
		}
		description += `${emoji}${i + 1} **${guilds[i].name}** | \`Niveau ${Math.round(guilds[i].level*100)/100}\`\n`;
	}
	embed.setDescription(description);

	if (guilds.length > 15 && (page+1)*15 < await models.Guild.count()) {
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
	.setName('gtop')
	.setDescription('Affiche le classement des guildes');
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	let page = 0;
	let gtop = await createGtop(page);

	await interaction.editReply({ embeds: [gtop.embed], components: gtop.components })

	if (gtop.components) {
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
			gtop = await createGtop(page);
			await button_interaction.update({ embeds: [gtop.embed], components: gtop.components });
		};
		interaction.client.on('interactionCreate', button_listener);
		setTimeout(() => {
			if (!("edit" in msg)) return;
			msg.edit({ components: []});
			interaction.client.removeListener('interactionCreate', button_listener);
		}, 300000);
	}
}