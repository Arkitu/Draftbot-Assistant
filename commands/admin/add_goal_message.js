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
            .setDescription('La durée avant que le message ne disparaisse (en millisecondes')
            .setRequired(true)
    )
export async function execute(interaction, config, db) {
	pass
}