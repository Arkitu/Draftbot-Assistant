import { SlashCommandBuilder } from '@discordjs/builders';
import { User, TextBasedChannel } from 'discord.js';
import { Reminder } from '../../libs/Reminder.js';
import { Context } from '../../libs/Context.js';

export const data = new SlashCommandBuilder()
	.setName('add_reminder')
	.setDescription('Ajoute un rappel')
    .addStringOption(option => option
        .setName("message")
        .setDescription("Le message à rappeler")
        .setRequired(true)
    )
    .addIntegerOption(option => option
		.setName("time")
		.setDescription("Le temps avant que le rappel ne soit envoyé")
		.setRequired(true)
	)
    .addStringOption(option => option
        .setName("unit")
        .setDescription("L'unité de temps (par default sur `minutes`)")
        .setRequired(false)
        .addChoice("secondes", "secondes")
        .addChoice("minutes", "minutes")
        .addChoice("heures", "heures")
        .addChoice("jours", "jours")
    );
export async function execute(ctx: Context) {
    await ctx.interaction.deferReply();
    let args = {
        time: ctx.interaction.options.getInteger("time"),
        message: ctx.interaction.options.getString("message"),
        unit: ctx.interaction.options.getString("unit") || "minutes"
    }

    let dead_line = new Date();

    switch (args.unit) {
        case "secondes":
            dead_line.setSeconds(dead_line.getSeconds() + args.time);
            break;
        case "minutes":
            dead_line.setMinutes(dead_line.getMinutes() + args.time);
            break;
        case "heures":
            dead_line.setHours(dead_line.getHours() + args.time);
            break;
        case "jours":
            dead_line.setDate(dead_line.getDate() + args.time);
            break;
    }
    
    let channel: User | TextBasedChannel
    if (ctx.interaction.channel) {
        channel = ctx.interaction.channel
    } else {
        channel = ctx.interaction.user
    }

    let reminder = new Reminder({
        ctx: ctx,
        channel: channel,
        dead_line_timestamp: dead_line.getTime(),
        message: args.message,
        author: ctx.interaction.user
    })
    reminder.save();
    reminder.start();

    await ctx.interaction.editReply("Le rappel a été ajouté !");
}