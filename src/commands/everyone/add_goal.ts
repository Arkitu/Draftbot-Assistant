import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ProfileData } from '../../models/Tracking.js';

export const data = new SlashCommandBuilder()
	.setName('add_goal')
	.setDescription('Crée un objectif. Il est conseillé de faire un /profile juste avant')
    .addIntegerOption(opt=>
        opt
            .setName('value')
            .setDescription('La valeur de l\'objectif')
            .setRequired(true)
            .setMinValue(0)
    )
    .addStringOption(opt=>
        opt
            .setName('unit')
            .setDescription('L\'unité de l\'objectif (par defaut: rank_points)')
            .setRequired(false)
            .addChoice('level', 'lvl')
            .addChoice('gold', 'gold')
            .addChoice('pv', 'pv')
            .addChoice('xp', 'xp')
            .addChoice('gems', 'gems')
            .addChoice('quest_missions', 'quest_missions_percentage')
            .addChoice('rank_points', 'rank_points')
    )
    .addStringOption(opt=>
        opt
            .setName('duration')
            .setDescription('La durée de l\'objectif (par defaut: 1 semaine)')
            .setRequired(false)
            .addChoice('1 jour', '86400000')
            .addChoice('2 jours', '172800000')
            .addChoice('3 jours', '259200000')
            .addChoice('4 jours', '345600000')
            .addChoice('5 jours', '432000000')
            .addChoice('6 jours', '518400000')
            .addChoice('1 semaine', '604800000')
            .addChoice('2 semaines', '1209600000')
            .addChoice('3 semaines', '1814400000')
            .addChoice('1 mois', '2678400000')
    )
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

    let opts = {
        value: interaction.options.getInteger('value'),
        unit: interaction.options.getString('unit') as 
            'lvl' | 'gold' | 'pv' | 'xp' | 'gems' | 'quest_missions_percentage' | 'rank_points'
        || 'rank_points',
        duration: parseInt(interaction.options.getString('duration')) || 604800000
    };

    const user = (await models.User.findOrCreate({
        where: {
            discordId: interaction.user.id
        }
    }))[0]

    const lastProfile = (await user.$get("trackings", {
        limit: 1,
        order: [["createdAt", "DESC"]],
        where: {
            type: "profile"
        }
    }))[0]

    if (!lastProfile) {
        interaction.editReply(":warning: Vous devez activer le tracking des profiles (</config tracking switch_option:971457425842536458>) et traquer au moins un profile pour créer un objectif");
        return;
    }

    const goal = new models.Goal({
        start: Date.now(),
        end: Date.now() + opts.duration,
        unit: opts.unit,
        initValue: (lastProfile.data as ProfileData)[opts.unit],
        value: opts.value
    });
    user.$add("goals", goal)
    goal.save()

    await interaction.editReply(':white_check_mark: Objectif créé avec succès. Faites des </profile:1006239067597443128> assez souvent car c\'est avec eux que le bot vérifie vos objectifs');
}