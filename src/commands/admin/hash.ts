import { SlashCommandBuilder } from "@discordjs/builders";
import { createHash } from "crypto";
import { Context } from "../../libs/Context.js";

export const data = new SlashCommandBuilder()
	.setName("hash")
	.setDescription("Renvoie le hash de la chaine de caractères passée en paramètre")
	.addStringOption(option => option
		.setName("string")
		.setDescription("La chaine de caractères à hasher")
		.setRequired(true)
	);

export async function execute(ctx: Context) {
	await ctx.interaction.deferReply();
	const opt_string = ctx.interaction.options.getString("string");

	const hash = createHash('md5').update(opt_string).digest('hex');
	await ctx.interaction.editReply(hash);
}