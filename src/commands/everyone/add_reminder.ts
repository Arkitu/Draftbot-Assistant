import { SlashCommandBuilder } from '@discordjs/builders';
import { User, TextBasedChannel } from 'discord.js';
import { CommandInteraction } from 'discord.js';

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
export async function execute(interaction: CommandInteraction) {
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
    
    let channel: User | TextBasedChannel
    if (interaction.channel) {
        channel = interaction.channel
    } else {
        channel = interaction.user
    }

    const user = (await db.models.User.findOrCreate({
        where: {
            discordId: interaction.user.id
        }
    }))[0]

    user.createReminder({
        channelId: channel.id,
        channelIsUser: channel instanceof User,
        deadLineTimestamp: dead_line.getTime(),
        message: args.message
    }).then((r)=>r.start());

    await interaction.editReply(`Le rappel de ${args.time} ${args.unit} a été ajouté !`);
}