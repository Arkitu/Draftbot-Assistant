import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('gtop')
	.setDescription('Renvoie le classement des guildes');
export async function execute(interaction, config, db) {
	await interaction.deferReply();

	let embed = new MessageEmbed()
		.setTitle("Classement des guildes")
		.setColor(config.getData("/main_color"));
	let components;
	let guilds = Object.values(await db.getData("/guilds")).sort((a, b) => {return b.level - a.level;});
	let guilds_limited;
	let page = 1;
	if (guilds.length > 10) {
		guilds_limited = guilds.slice((page-1)*10, page*10-1);
		embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length*0.1)}` });
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

	for (let guild of guilds_limited) {
		embed.addField(guild.name, `level: \`${guild.level}\``);
	}
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
			guilds_limited = guilds.slice((page - 1) * 10, page * 10 - 1);
			embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length * 0.1)}` });
			embed.setFields([]);
			for (let guild of guilds_limited) {
				let last_update = new Date(guild.last_update);
				embed.addField(guild.name, `level: \`${guild.level}\``);
			}
			components.setComponents();
			if (page > 1) {
				components.addComponents([
					new MessageButton()
						.setCustomId('previous_page')
						.setStyle('SECONDARY')
						.setEmoji('⬅')
				]);
			}
			if (page < Math.ceil(guilds.length*0.1)) {
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