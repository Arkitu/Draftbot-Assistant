import { SlashCommandBuilder } from '@discordjs/builders';

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

export async function execute(interaction, config, db) {
    await interaction.deferReply();
	switch (interaction.options.getSubcommand()) {
        case 'tracked':
            let tracked = 0;
            for (let user in db.getData("/users")) {
                if (db.getData(`/users/${user}/config/tracking/reports`)) {
                    tracked++;
                }
            }
            await interaction.editReply(`${tracked} utilisateurs suivis`);
            break;
        case 'tracked_events':
            let tracked_events = 0;
            for (let user in db.getData("/users")) {
                tracked_events += db.getData(`/users/${user}/tracking`).length;
            }
            await interaction.editReply(`${tracked_events} événements trackés`);
            break;
    }
}