import { SlashCommandBuilder } from '@discordjs/builders';
import { long_report_listener } from '../../../bot';

export const data = new SlashCommandBuilder()
	.setName('get_message')
	.setDescription('Tkt)');

export async function execute(interaction, config, db) {
    long_report_listener(await (await interaction.client.channels.fetch("807634694602489876")).messages.fetch("975438110471094403"))
}