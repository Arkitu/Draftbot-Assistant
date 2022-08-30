import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('get_db')
	.setDescription('Renvoie des donnée depuis la db')
    .addStringOption(opt=>
        opt.setName("category")
            .setDescription("Le type de donnée")
            .setRequired(true)
            .addChoices([
                ["guild", "Guild"],
                ["goal", "Goal"],
                ["propo_reminder", "PropoReminder"],
                ["reminder", "Reminder"],
                ["tracking", "Tracking"],
                ["user", "User"]
            ])
    )
    .addUserOption(opt=>
        opt.setName("user")
            .setDescription("L'utilisateur à qui appartiennent les données (ne pas utiliser avec user ou guild)")
    )
    .addBooleanOption(opt=>
        opt.setName("send_in_discord")
            .setDescription("Si il faut envoyer ou pas le résultat dans discord (il sera loggé dans tous les cas)")
    )
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply()

    const opts = {
        category: interaction.options.getString("category", true) as "Guild" | "Goal" | "PropoReminder" | "Reminder" | "Tracking" | "User",
        user: interaction.options.getUser("user"),
        send_in_discord: interaction.options.getBoolean("send_in_discord") || false
    };

    const model: any = models[opts.category]

    let fetched: any[];

    if (opts.user) {
        fetched = (await model.findAll({
            where: {
                userId: opts.user.id
            }
        })).map((f: any)=>f.toJSON());
    } else {
        fetched = (await model.findAll())
            .map((f: any)=>f.toJSON());
    }

    console.log(...fetched);

    interaction.editReply("Données récupérées !");
    if (opts.send_in_discord) {
        interaction.followUp(fetched.toString());
    }
}