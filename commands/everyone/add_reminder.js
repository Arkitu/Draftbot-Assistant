import { SlashCommandBuilder } from '@discordjs/builders';
import { Reminder } from '../../libs/Reminder.js';

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
		.setDescription("Le temps avant que le rappel soit envoyé")
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
export async function execute(interaction, config, db) {
    await interaction.deferReply();
    let args = {
        time: interaction.options.getInteger("time"),
        message: interaction.options.getString("message"),
        unit: interaction.options.getString("unit") || "minutes"
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
    
    let channel;
    if (await interaction.channel) {
        channel = { 
            channel: await interaction.channel,
            channel_type: true
        }
    } else {
        channel = { 
            channel: await interaction.user,
            type_channel: false
        }
    }

    let reminder = new Reminder(interaction.client, channel, dead_line.getTime(), args.message, await interaction.user, db, config);
    await reminder.save();
    await reminder.start();

    await interaction.editReply("Le rappel a été ajouté !");
}