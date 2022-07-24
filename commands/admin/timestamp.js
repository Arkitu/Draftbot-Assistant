import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName('timestamp')
	.setDescription('Affiche le timestamp actuel');
export async function execute(interaction, config, db, constants) {
	await interaction.reply(`${Date.now()}`);
}