import { SlashCommandBuilder } from '@discordjs/builders';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Répond pong');
export async function execute(ctx: Context) {
	await ctx.interaction.reply(':ping_pong: Pong !');
}