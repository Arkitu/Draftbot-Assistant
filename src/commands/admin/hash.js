import { SlashCommandBuilder } from "@discordjs/builders";
import { createHash } from "crypto";

export const data = new SlashCommandBuilder()
	.setName("hash")
	.setDescription("Renvoie le hash de la chaine de caractères passée en paramètre")
	.addStringOption(option => option
		.setName("string")
		.setDescription("La chaine de caractères à hasher")
		.setRequired(true)
	);

export async function execute(interaction, config, db, constants) {
	await interaction.deferReply();
	const opt_string = interaction.options.getString("string");

	var hash = createHash('md5').update(opt_string).digest('hex');
	await interaction.editReply(hash);
}