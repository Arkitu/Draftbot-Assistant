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
            .setDescription("Si il faut envoyer ou pas le résultat dans discord (par défaut à false)")
    )
    .addBooleanOption(opt=>
        opt.setName("to_json")
            .setDescription("Si il faut utiliser toJSON sur les données avant de les afficher (par défaut à true)")
    )
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply()

    const opts = {
        category: interaction.options.getString("category", true) as "Guild" | "Goal" | "PropoReminder" | "Reminder" | "Tracking" | "User",
        user: interaction.options.getUser("user"),
        send_in_discord: interaction.options.getBoolean("send_in_discord") === null ? false : interaction.options.getBoolean("send_in_discord"),
        to_json: interaction.options.getBoolean("to_json") === null ? true : interaction.options.getBoolean("to_json")
    };

    const model: any = db.models[opts.category]

    let fetched: any[];

    if (opts.user) {
        fetched = await model.findAll({
            where: {
                userId: opts.user.id
            }
        })
    } else {
        fetched = await model.findAll()
    }
    if (opts.to_json) fetched.forEach((f: any)=>f.toJSON());

    console.log(...fetched);

    interaction.editReply("Données récupérées !");
    if (opts.send_in_discord) {
        interaction.followUp(fetched.map((f)=>f.toString()).join("\n"));
    }
}