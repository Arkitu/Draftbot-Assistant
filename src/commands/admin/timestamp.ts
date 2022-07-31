import { SlashCommandBuilder } from '@discordjs/builders';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('timestamp')
	.setDescription('Affiche le timestamp actuel');
export async function execute(ctx: Context) {
	await ctx.interaction.reply(`${Date.now()}`);
}