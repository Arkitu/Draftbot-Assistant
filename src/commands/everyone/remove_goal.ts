import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('remove_goal')
	.setDescription('Supprime un objectif')
    .addIntegerOption(opt=>
        opt
            .setName("id")
            .setDescription("L'id de l'objectif (fais /goals pour le connaître)")
            .setRequired(true)
    )
export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    let opt = {
        id: interaction.options.getInteger("id")
    }

    const goal = await models.Goal.findByPk(opt.id);
    if (!goal) {
        interaction.editReply(":warning: Cet objectif n'existe pas ! Fais `/goals` pour connaitres tes objectifs");
        return;
    }
    if (goal.userId != interaction.user.id) {
        interaction.editReply(":warning: Tu ne peux pas supprimer les objectifs des autres ! Fais `/goals` pour connaitres tes objectifs");
        return;
    }

    goal.destroy()

    interaction.editReply("Objectif supprimé !");
}