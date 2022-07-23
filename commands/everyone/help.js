import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("help")
	.setDescription("Renvoie la liste des commandes")
	.addStringOption(option => option
		.setName("categorie")
		.setDescription("La categorie sur laquelle vous voulez des précisions")
		.setRequired(false)
		.addChoice("Classiques", "Classiques")
		.addChoice("Reminders", "Reminders")
		.addChoice("Tracking", "Tracking")
	);

export async function execute(interaction, config, db, constants) {
	await interaction.deferReply();

	const opt_categorie = interaction.options.getString("categorie");

	let help_embed = new MessageEmbed()
		.setColor(config.getData("/main_color"))
		.setThumbnail(interaction.client.user.avatarURL())
	
	if (opt_categorie) {
		help_embed.setAuthor({ name: opt_categorie, iconURL: interaction.client.user.avatarURL(), url: config.getData("/help_link") });
		for (let cmd of constants.getData(`helpCategories[${constants.getIndex("/helpCategories", opt_categorie, "name")}]/commands`)) {
			help_embed.addField(`\`/${cmd}\``, db.getData(`/commands[${db.getIndex("/commands", cmd, "name")}]/description`));
		}
		if (help_embed.fields.length === 0) {
			help_embed.setDescription("Aucune commande dans cette catégorie");
		}
	} else {
		help_embed.setAuthor({ name: `Aide de ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL(), url: config.getData("/help_link") });
		for (let categorie of constants.getData("helpCategories")) {
			help_embed.addField(categorie.name, `\`/help ${categorie.name}\``, true);
		}
	}

	await interaction.editReply({ embeds: [help_embed] });
}