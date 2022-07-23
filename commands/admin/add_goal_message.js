import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
	.setName('add_goal_message')
	.setDescription('Ajoute un messaeg sur lequel les utilisateurs peuvent cliquer pour ajouter un objectif')
    .addChannelOption(opt=>
        opt
            .setName('channel')
            .setDescription('Le channel dans lequel le message sera créé')
            .setRequired(true)
    )
    .addIntegerOption(opt=>
        opt
            .setName('duration')
            .setDescription('La durée avant que le message ne disparaisse (en millisecondes)')
            .setRequired(true)
    )
    .addIntegerOption(opt=>
        opt
            .setName('start_time')
            .setDescription('L\'heure à laquelle le message sera créé (en millisecondes)')
            .setRequired(false)
    )
export async function execute(interaction, config, db, constants) {
    let opts = {
        channel: interaction.options.getChannel('channel'),
        start: interaction.options.getInteger('start_time') || Date.now(),
        duration: interaction.options.getInteger('duration')
    }
	db.push("/goal_messages", {
        channel: opts.channel.id,
        start: opts.start,
        end: opts.start + opts.duration
    });
}