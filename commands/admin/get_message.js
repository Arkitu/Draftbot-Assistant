import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName('get_message')
	.setDescription('Tkt)');

export async function execute(interaction, config, db) {
    await interaction.reply((await (await interaction.client.channels.fetch("807634694602489876")).messages.fetch("975438110471094403")).content.replace(" ", "÷"));
}