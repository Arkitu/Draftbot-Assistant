import { SlashCommandBuilder } from '@discordjs/builders';
import { Context } from '../../libs/Context.js';

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

export async function execute(ctx: Context) {
    await ctx.interaction.deferReply();
	switch (ctx.interaction.options.getSubcommand()) {
        case 'tracked':
            let tracked = 0;
            for (let user in ctx.db.getData("/users")) {
                if (ctx.db.getData(`/users/${user}/tracking`).length > 0) {
                    tracked++;
                }
            }
            await ctx.interaction.editReply(`${tracked} utilisateurs suivis`);
            break;
        case 'tracked_events':
            let tracked_events = 0;
            for (let user in ctx.db.getData("/users")) {
                tracked_events += ctx.db.getData(`/users/${user}/tracking`).length;
            }
            await ctx.interaction.editReply(`${tracked_events} événements trackés`);
            break;
    }
}