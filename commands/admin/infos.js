import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName('infos')
	.setDescription('Infos sur le bot')
    .addSubcommand(subcmd =>
        subcmd
            .setName('tracked')
            .setDescription("Affiche le nombre d'utilisateurs suivis")
    )

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
    }
}