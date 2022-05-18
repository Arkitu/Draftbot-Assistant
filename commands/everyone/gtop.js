import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('gtop')
	.setDescription('Renvoie le classement des guildes');
export async function execute(interaction, config, db) {
	await interaction.deferReply();

	let embed = new MessageEmbed()
		.setTitle("🏆 Classement des guildes")
		.setColor(config.getData("/main_color"));
	let components;
	let guilds = Object.values(await db.getData("/guilds")).sort((a, b) => {return b.level - a.level;});
	let guilds_limited;
	let page = 1;
	if (guilds.length > 16) {
		guilds_limited = guilds.slice((page-1)*16, page*16);
		embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length/16)} | ${guilds.length} guildes` });
		components = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('next_page')
					.setStyle('SECONDARY')
					.setEmoji('➡')
			);
	} else {
		guilds_limited = guilds;
	}

	let description = "";

	for (let i = 0; i < guilds_limited.length; i++) {
		let emoji;
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
		description += `${emoji}${i + 1} **${guilds_limited[i].name}** | \`Niveau ${guilds_limited[i].level}\`\n`
	}
	embed.setDescription(description);
	if (components) {
		await interaction.editReply({ embeds: [embed], components: [components] });
	} else {
		await interaction.editReply({ embeds: [embed] });
	}

	if (components) {
		let msg = await interaction.fetchReply();
		let button_listener = async button_interaction => {
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
			guilds_limited = guilds.slice((page - 1) * 15, page * 15);
			embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length/16)} | ${guilds.length} guildes` });
			embed.setFields([]);
			description = "";
			for (let i = 0; i < guilds_limited.length; i++) {
				let emoji;
				if (page == 1) {
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
				} else emoji = "⚫";
				description += `${emoji}${i + 1 + (15 * (page - 1))} **${guilds_limited[i].name}** | \`Niveau ${guilds_limited[i].level}\`\n`
			}
			embed.setDescription(description);
			components.setComponents();
			if (page > 1) {
				components.addComponents([
					new MessageButton()
						.setCustomId('previous_page')
						.setStyle('SECONDARY')
						.setEmoji('⬅')
				]);
			}
			if (page < Math.ceil(guilds.length/16)) {
				components.addComponents([
					new MessageButton()
						.setCustomId('next_page')
						.setStyle('SECONDARY')
						.setEmoji('➡')
				]);
			}
			await button_interaction.update({ embeds: [embed], components: [components] });
		};
		interaction.client.on('interactionCreate', button_listener);
		setTimeout(() => {
			interaction.client.removeListener('interactionCreate', button_listener);
		}, 300000);
	}	
}