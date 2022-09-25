import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { log_error, generateTimeDisplay } from "../../bot.js";
import { CommandInteraction } from 'discord.js';
import { Includeable } from "sequelize/types/model.js";

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
                    .setName("add_custom_propo")
                    .setDescription("Ajouter une proposition de rappel à la suite d'un message donné")
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
                    .setName("del_custom_propo")
                    .setDescription("Supprime une proposition de rappel à la suite d'un message donné")
                    .addStringOption(option =>
                        option
                            .setName("trigger")
                            .setDescription("Le mot clé déclenchant la proposition de rappel")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("switch_command_propo")
                    .setDescription("Active/désactive une proposition de rappel suite à une commande")
                    .addStringOption(opt =>
                        opt
                            .setName("trigger")
                            .setDescription("La situation dans laquelle activer/désactiver la proposition")
                            .setRequired(true)
                            .addChoice("events", "events")
                            .addChoice("minievents", "minievents")
                            .addChoice("guilddaily", "guilddaily")
                            .addChoice("daily", "daily")
                            .addChoice("petfeed", "petfeed")
                            .addChoice("petfree", "petfree")
                            .addChoice("vote", "vote")
                    )
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

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    let opt = {
        subcommandgroup: interaction.options.getSubcommandGroup(),
        subcommand: interaction.options.getSubcommand(),
        trigger: interaction.options.getString("trigger"),
        duration: interaction.options.getInteger("duration"),
        unit: interaction.options.getString("unit"),
        in_dm: interaction.options.getBoolean("in_dm"),
        option: interaction.options.getString("option") as "reports" | "public" | "profile"
    };
    if (`${opt.subcommandgroup}/${opt.subcommand}` === "reminders/switch_custom_propo") {
        ;
    }

    let include: Includeable[] = [];
    if (`${opt.subcommandgroup}/${opt.subcommand}` === "reminders/view") {
        include.push(db.models.PropoReminder)
    }
    const user = (await db.models.User.findOrCreate({
        where: {
            discordId: interaction.user.id
        },
        include: include
    }))[0];

    switch (`${opt.subcommandgroup}/${opt.subcommand}`) {
        case "reminders/view": {
            let reminders_embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres des reminders de ${interaction.user.username}`, iconURL: client.user.avatarURL() })
                .addFields({
                    name: "Proposition de reminders :",
                    value: (()=>{
                        let str_propos = "";
                        for (let propo of user.propoReminders) {
                            if (str_propos.length > 800) {
                                str_propos += "…\n";
                                break;
                            }
                            str_propos += `${propo.trigger} : \`${generateTimeDisplay(propo.duration)} ${propo.inDm ? "en DM" : ""}\`\n`;
                        }
                        if (!str_propos) {
                            str_propos = "Aucune proposition de rappel\n";
                        }
                        str_propos += "\nPour rajouter une proposition, utilisez la commande `/config reminders add_propo <message déclencheur> <durée> <unité>`\nPour en supprimer une, utilisez `/config reminders del_propo <message déclencheur>`";
                        return str_propos;
                    })()
                });
            interaction.editReply({ embeds: [reminders_embed] });
            break;
        }
        case "reminders/add_custom_propo": {
            if (opt.trigger.includes("/")) {
                interaction.editReply("Vous ne pouvez pas utiliser le caractère `/` dans le message déclencheur");
                return;
            }

            let multiplier = {
                secondes: 1000,
                minutes: 60 * 1000,
                heures: 60 * 60 * 1000,
                jours: 24 * 60 * 60 * 1000
            }[opt.unit];

            user.createPropoReminder({
                trigger: opt.trigger,
                duration: opt.duration * multiplier,
                inDm: opt.in_dm
            })
            
            interaction.editReply("Proposition ajoutée avec succès !");
            break;
        }
        case "reminders/del_custom_propo": {
            const deleted = await db.models.PropoReminder.destroy({
                where: {
                    trigger: opt.trigger,
                    userId: user.discordId
                }
            })
            if (deleted) {
                interaction.editReply(`La/les proposition(s) pour le message \`${opt.trigger}\` supprimée avec succès !`);
            } else {
                interaction.editReply(`Aucune proposition n'existe pour le message \`${opt.trigger}\` !`);
            }
            break;
        }
        case "reminders/switch_custom_propo": {
            let trigger = opt.trigger as "events" | "minievents" | "guilddaily" | "daily" | "petfeed" | "petfree" | "vote";
            user.config.reminders.auto_proposition[trigger] = !user.config.reminders.auto_proposition[trigger];
            user.save()
            interaction.editReply(`L'option a été ${["désactivée", "activée"][+user.config.reminders.auto_proposition[trigger]]} avec succès !`)
            break;
        }
        case "reminders/in_dm": {
            user.config.reminders.auto_proposition.in_dm = !user.config.reminders.auto_proposition.in_dm;
            user.save()
            interaction.editReply(`L'option a été ${["désactivée", "activée"][+user.config.reminders.auto_proposition.in_dm]} avec succès !`);
            break;
        }
        case "tracking/view": {
            let tracking_embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres de suivi de ${user.discordUser.username}`, iconURL: user.discordUser.avatarURL() })
                .setDescription(`Suivi des reports : ${(()=>{
                    if (user.config.tracking.reports) {
                        return "🟢";
                    } else {
                        return "🔴";
                    }
                })()}\nTracking public : ${(()=>{
                    if (user.config.tracking.public) {
                        return "🟢";
                    } else {
                        return "🔴";
                    }
                })()}\n Tracking du profil : ${(()=>{
                    if (user.config.tracking.profile) {
                        return "🟢";
                    } else {
                        return "🔴";
                    }
                })()}`);
            interaction.editReply({ embeds: [tracking_embed] });
            break;
        }
        case "tracking/switch_option": {
            user.config.tracking[opt.option] = !user.config.tracking[opt.option];
            user.save()

            db.models.Tracking.destroy({
                where: {
                    userId: user.discordId,
                    type: opt.option
                }
            });

            interaction.editReply(`L'option a été ${["désactivée", "activée"][+user.config.tracking[opt.option]]} avec succès !`);
            break;
        }
        default: {
            log_error(`${interaction.user.username} a utilisé une commande inconnue ("/config ${opt.subcommandgroup} ${opt.subcommand}")`);
            interaction.editReply(":warning: Cette commande n'existe pas ! Le propriétaire du bot en a été informé.");
            break;
        }
    }
}
