import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import { createHash } from "crypto";

export const data = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Paramètres du bot")
    .addStringOption(option => option
        .setName("category")
        .setDescription("La catégorie de paramètres à modifier")
        .setRequired(false)
        .addChoice("reminders", "reminders")
        .addChoice("tracking", "tracking"),
    );

export async function execute(interaction) {
    if (interaction.user.id !== interaction.client.owner.id) {
        await interaction.reply(":warning: Désolé, cette commande est encore en phase de développement.");
        return;
    }
    await interaction.deferReply();
	const db = new JsonDB(new Config("db", true, true, '/'));
	const config = new JsonDB(new Config("config", true, true, '/'));

    let opt_category = interaction.options.getString("category");

    let db_user = db.getData(`/users/${createHash('md5').update(interaction.user.id).digest('hex')}`);

    let embed;
    switch (opt_category) {
        case "reminders":
            embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres des reminders de ${interaction.user.username}`, iconURL: interaction.client.user.avatarURL() })
                .addField("Proposition de reminders :", (async()=>{
                    let str_propos = "";
                    for (let propo in db_user.config.reminders.on) {
                        str_propos += `${propo} : \`${db_user.config.reminders.on[propo].duration}${db_user.config.reminders.on[propo].unit}\`\n`;
                    }
                    return str_propos;
                })());
            await interaction.editReply({ embeds: [embed] });
            break;
        case "tracking":
            embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres du tracking de ${interaction.user.username}`, iconURL: interaction.client.user.avatarURL() })
        default:
            let embed = new MessageEmbed()
                .setColor(config.getData("/main_color"))
                .setAuthor({ name: `Paramètres de ${interaction.user.username}`, iconURL: interaction.client.user.avatarURL() })
                .addField("Reminders", "`/config reminders`")
                .addField("Tracking", "`/config tracking`");
            await interaction.editReply({ embeds: [embed] });
            break;
    }
}