import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { createHash } from "crypto";

export const data = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Paramètres du bot")
    .addSubcommandGroup(subcommandgroup =>
        subcommandgroup
            .setName("reminders")
            .setDescription("Paramètres des rappels")
            .addSubcommand(subcommand =>
                subcommand
                    .setName("view")
                    .setDescription("Affiche les paramètres des rappels")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("add_propo")
                    .setDescription("Ajouter une proposition de rappel")
                    .addStringOption(option =>
                        option
                            .setName("trigger")
                            .setDescription("Le mot clé pour déclencher la proposition de rappel")
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option
                            .setName("duration")
                            .setDescription("La durée du rappel")
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName("unit")
                            .setDescription("L'unité de temps")
                            .setRequired(true)
                            .addChoice("secondes", "secondes")
                            .addChoice("minutes", "minutes")
                            .addChoice("heures", "heures")
                            .addChoice("jours", "jours")
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("del_propo")
                    .setDescription("Supprime une proposition de rappel")
                    .addStringOption(option =>
                        option
                            .setName("trigger")
                            .setDescription("Le mot clé pour déclencher la proposition de rappel")
                            .setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(subcommandgroup =>
        subcommandgroup
            .setName("tracking")
            .setDescription("Paramètres de suivi")
            .addSubcommand(subcommand =>
                subcommand
                    .setName("view")
                    .setDescription("Affiche les paramètres de suivi")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("switch_option")
                    .setDescription("Active ou désactive une option de suivi")
                    .addStringOption(option =>
                        option
                            .setName("option")
                            .setDescription("L'option à activer ou désactiver")
                            .setRequired(true)
                            .addChoice("reports", "reports")
                    )
            )
    );

export async function execute(interaction) {
    await interaction.deferReply();
    const config = new JsonDB(new Config("config", true, true, '/'));
    const db = new JsonDB(new Config("db", true, true, '/'));
    let opt = {
        subcommandgroup: interaction.options.getSubcommandGroup(),
        subcommand: interaction.options.getSubcommand()
    };
    let user_hash = createHash('md5').update(interaction.user.id).digest('hex');
    if (!(user_hash in db.getData("/users"))) {
        console.log(`Création de l'utilisateur ${interaction.user.username} à partir de /config`);
        db.push("/users/" + user_hash, {"config": {"reminders": {"on": {}}, "tracking": {"reminders": false}}});
    }
    let db_user = db.getData(`/users/${user_hash}`);

    switch (`${opt.subcommandgroup}/${opt.subcommand}`) {
        case "reminders/view":
            let reminders_embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres des reminders de ${interaction.user.username}`, iconURL: interaction.client.user.avatarURL() })
                .addField("Proposition de reminders :", (()=>{
                    let str_propos = "";
                    for (let propo in db_user.config.reminders.on) {
                        str_propos += `${propo} : \`${db_user.config.reminders.on[propo].duration} ${db_user.config.reminders.on[propo].unit}\`\n`;
                    }
                    if (!str_propos) {
                        str_propos = "Aucune proposition de rappel\n";
                    }
                    str_propos += "\nPour rajouter une proposition, utilisez la commande `/config reminders add_propo <message déclencheur> <durée> <unité>`\nPour en supprimer une, utilisez `/config reminders del_propo <message déclencheur>`";
                    return str_propos;
                })());
            await interaction.editReply({ embeds: [reminders_embed] });
            break;
        case "reminders/add_propo":
            db.push(`/users/${user_hash}/config/reminders/on/${interaction.options.getString("trigger")}`, { duration: interaction.options.getInteger("duration"), unit: interaction.options.getString("unit") });
            await interaction.editReply("Proposition ajoutée avec succès !");
            break;
        case "reminders/del_propo":
            if (interaction.options.getString("trigger") in db_user.config.reminders.on) {
                db.delete(`/users/${user_hash}/config/reminders/on/${interaction.options.getString("trigger")}`);
                await interaction.editReply("Proposition supprimée avec succès !");
            } else {
                await interaction.editReply("Cette proposition n'existe pas !");
            }
            break;
        case "tracking/view":
            let tracking_embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres de suivi de ${interaction.user.username}`, iconURL: interaction.client.user.avatarURL() })
                .setDescription(`Suivi des reports : ${(()=>{
                    if (db_user.config.tracking.reports) {
                        return "🟢";
                    } else {
                        return "🔴";
                    }
                })()}`);
            await interaction.editReply({ embeds: [tracking_embed] });
            break;
        case "tracking/switch_option":
            switch (interaction.options.getString("option")) {
                case "reports":
                    db.push(`/users/${user_hash}/config/tracking/reports`, !db_user.config.tracking.reports);
                    await interaction.editReply("L'option a été modifiée avec succès !");
                    break;
            }
    }
}
