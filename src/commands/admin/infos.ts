import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('infos')
	.setDescription('Infos sur le bot')
    .addSubcommand(subcmd =>
        subcmd
            .setName('tracked')
            .setDescription("Affiche le nombre d'utilisateurs suivis")
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName('tracked_events')
            .setDescription("Affiche le nombre d'événements trackés")
    );

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
	switch (interaction.options.getSubcommand()) {
        case 'tracked':
            interaction.editReply(`${await models.Tracking.count({
                distinct: true,
                col: "userId"
            })} utilisateurs suivis`);
            break;
        case 'tracked_events':
            interaction.editReply(`${await models.Tracking.count()} événements trackés`);
            break;
    }
}