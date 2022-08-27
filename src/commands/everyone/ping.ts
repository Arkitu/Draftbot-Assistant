import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Répond pong');
export async function execute(interaction: CommandInteraction) {
	await ctx.interaction.reply(':ping_pong: Pong !');
}