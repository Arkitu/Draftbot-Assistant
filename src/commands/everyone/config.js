import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { createHash } from "crypto";
import { log, log_error } from "../../bot.js";

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
                            .setDescription("Le mot clé déclenchant la proposition de rappel")
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
                    .addBooleanOption(option =>
                        option
                            .setName("in_dm")
                            .setDescription("L'endroit où le rappel sera envoyé")
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("del_propo")
                    .setDescription("Supprime une proposition de rappel")
                    .addStringOption(option =>
                        option
                            .setName("trigger")
                            .setDescription("Le mot clé déclenchant la proposition de rappel")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("events")
                    .setDescription("Active/désactive la proposition automatique de rappel après un event")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("minievents")
                    .setDescription("Active/désactive la proposition automatique de rappel après un minievent")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("guilddaily")
                    .setDescription("Active/désactive la proposition automatique de rappel après un /guilddaily")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("daily")
                    .setDescription("Active/désactive la proposition automatique de rappel après un /daily")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("petfeed")
                    .setDescription("Active/désactive la proposition automatique de rappel après un /petfeed")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("petfree")
                    .setDescription("Active/désactive la proposition automatique de rappel après un /petfree")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("vote")
                    .setDescription("Active/désactive la proposition automatique de rappel après un /vote")
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("in_dm")
                    .setDescription("Active/désactive l'envoi des reminders en DM")
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
                            .addChoice("public", "public")
                            .addChoice("profile", "profile")
                    )
            )
    );

export async function execute(interaction, config, db, constants) {
    await interaction.deferReply();
    let opt = {
        subcommandgroup: interaction.options.getSubcommandGroup(),
        subcommand: interaction.options.getSubcommand()
    };
    let user_hash = createHash('md5').update(interaction.user.id).digest('hex');
    if (!(user_hash in db.getData("/users"))) {
        log(`Création de l'utilisateur ${interaction.user.username} à partir de /config`);
        db.push("/users/" + user_hash, constants.getData("/databaseDefault/user"));
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
                        if (str_propos.length > 800) {
                            str_propos += "…\n";
                            break;
                        }
                        str_propos += `${propo} : \`${db_user.config.reminders.on[propo].duration} ${db_user.config.reminders.on[propo].unit} ${db_user.config.reminders.on[propo].in_dm ? "en DM" : ""}\`\n`;
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
            db.push(`/users/${user_hash}/config/reminders/on/${interaction.options.getString("trigger")}`, { duration: interaction.options.getInteger("duration"), unit: interaction.options.getString("unit"), in_dm: interaction.options.getBoolean("in_dm")});
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
        case "reminders/events":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/events`, !db_user.config.reminders.auto_proposition.events);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/minievents":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/minievents`, !db_user.config.reminders.auto_proposition.minievents);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/guilddaily":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/guilddaily`, !db_user.config.reminders.auto_proposition.guilddaily);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/daily":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/daily`, !db_user.config.reminders.auto_proposition.daily);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/petfree":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/petfree`, !db_user.config.reminders.auto_proposition.petfree);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/petfeed":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/petfeed`, !db_user.config.reminders.auto_proposition.petfeed);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/vote":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/vote`, !db_user.config.reminders.auto_proposition.vote);
            await interaction.editReply("L'option a été modifiée avec succès !");
            break;
        case "reminders/in_dm":
            db.push(`/users/${user_hash}/config/reminders/auto_proposition/in_dm`, !db_user.config.reminders.auto_proposition.in_dm);
            await interaction.editReply("L'option a été modifiée avec succès !");
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
                })()}\nTracking public : ${(()=>{
                    if (db_user.config.tracking.public) {
                        return "🟢";
                    } else {
                        return "🔴";
                    }
                })()}\n Tracking du profil : ${(()=>{
                    if (db_user.config.tracking.profile) {
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
                    if (!db_user.config.tracking.reports) {
                        // Delete all tracked reports
                        for (let i=0; i < db_user.tracking.length; i++) {
                            if (["long_report", "short_report"].includes(db_user.tracking[i].type)) {
                                db.delete(`/users/${user_hash}/tracking[${i}]`);
                                i--;
                            }
                        }
                    }
                    await interaction.editReply("L'option a été modifiée avec succès !");
                    break;
                case "public":
                    db.push(`/users/${user_hash}/config/tracking/public`, !db_user.config.tracking.public);
                    await interaction.editReply("L'option a été modifiée avec succès !");
                    break;
                case "profile":
                    db.push(`/users/${user_hash}/config/tracking/profile`, !db_user.config.tracking.profile);
                    if (!db_user.config.tracking.profile) {
                        // Delete all tracked profiles
                        for (let i=0; i < db_user.tracking.length; i++) {
                            if (db_user.tracking[i].type === "profile") {
                                db.delete(`/users/${user_hash}/tracking[${i}]`);
                                i--;
                            }
                        }
                    }
                    await interaction.editReply("L'option a été modifiée avec succès !");
                    break;
            }
            break;
        default:
            log_error(`${interaction.user.username} a utilisé une commande inconnue ("/config ${opt.subcommandgroup} ${opt.subcommand}")`);
    }
}
