import { SlashCommandBuilder } from '@discordjs/builders';
import Goal from '../../libs/Goal.js';
import { createHash } from "crypto";
import { CommandInteraction } from 'discord.js';
import { DB_Tracking, DB_Tracking_Profile, DB_User, Profile_Property } from '../../libs/Interfaces.js';

export const data = new SlashCommandBuilder()
	.setName('set_goal')
	.setDescription('Crée un objectif')
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
	await ctx.interaction.deferReply();

    let opts = {
        value: ctx.interaction.options.getInteger('value'),
        unit: ctx.interaction.options.getString('unit') as 
            'lvl' | 'gold' | 'pv' | 'xp' | 'gems' | 'quest_missions_percentage' | 'rank_points'
        || 'rank_points',
        duration: parseInt(ctx.interaction.options.getString('duration')) || 604800000
    };

    let user_hash = createHash('md5').update(ctx.interaction.user.id).digest('hex');
    if (!ctx.db.getData(`/users`).hasOwnProperty(user_hash)) {
        await ctx.interaction.editReply(':warning: Veuillez activer le tracking du profil et enregistrer au moins une fois votre profil pour utiliser cette commande.');
        return;
    }
    let db_user: DB_User = ctx.db.getData(`/users/${user_hash}`);
    if (db_user.tracking.filter((t: DB_Tracking)=>t.type==='profile').length===0) {
        await ctx.interaction.editReply(':warning: Veuillez enregistrer au moins une fois votre profil pour utiliser cette commande.');
        return;
    }
    
    let init_value = db_user.tracking.filter(
            (t: DB_Tracking): t is DB_Tracking_Profile =>t.type==='profile'
        )
        [
            db_user.tracking.filter(
                (t: DB_Tracking): t is DB_Tracking_Profile =>t.type==='profile'
            ).length-1
        ]
        .data[opts.unit];
    
    new Goal({
        ctx: ctx,
        user_id: ctx.interaction.user.id,
        start: new Date(),
        end: new Date(new Date().getTime()+opts.duration),
        value: opts.value,
        unit: opts.unit,
        init_value: init_value
    }).save();
    await ctx.interaction.editReply(':white_check_mark: Objectif créé avec succès.');
}