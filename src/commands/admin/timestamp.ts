import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('timestamp')
	.setDescription('Affiche le timestamp actuel');
export async function execute(interaction: CommandInteraction) {
	await interaction.reply(`${Date.now()}`);
}