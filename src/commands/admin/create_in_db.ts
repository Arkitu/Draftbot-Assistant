import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName("create_in_db")
	.setDescription("Crée des données dans la db")
	.addStringOption(option => option
		.setName("category")
		.setDescription("Le type de donnée")
		.setRequired(true)
        .addChoices([
            ["me", "me"],
        ])
	).addBooleanOption(option => option
        .setName("force")
        .setDescription("Si il faut forcer la création (et supprimer l'objet si il existe)")
    )

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	
    const opts = {
        category: interaction.options.getString("category", true) as "me",
        force: interaction.options.getBoolean("force") === null ? false : interaction.options.getBoolean("force")
    };

    switch (opts.category) {
        case "me": {
            if (opts.force) {
                await db.models.User.destroy({
                    where: {
                        id: interaction.user.id
                    }
                })
            }

            await db.models.User.findOrCreate({
                where: {
                    id: interaction.user.id
                }
            })
        }
    }

    interaction.editReply("Données créées !");
}