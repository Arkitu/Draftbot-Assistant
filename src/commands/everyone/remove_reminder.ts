import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('remove_reminder')
	.setDescription('Supprime un rappel')
    .addIntegerOption(opt=>
        opt
            .setName("id")
            .setDescription("L'id du rappel (faites /reminders pour le connaître)")
            .setRequired(true)
    )
export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    let opt = {
        id: interaction.options.getInteger("id")
    }

    const reminder = await db.models.Reminder.findByPk(opt.id);
    if (!reminder) {
        interaction.editReply(":warning: Ce rappel n'existe pas ! Faites `/reminders` pour connaitres vos rappels");
        return;
    }
    if (reminder.UserId != interaction.user.id) {
        interaction.editReply(":warning: Vous ne pouvez pas supprimer les rappels des autres ! Faites `/reminders` pour connaitres vos rappels");
        return;
    }

    reminder.destroy()

    interaction.editReply("Rappel supprimé !");
}