"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('gtop')
    .setDescription('Affiche le classement des guildes');
function execute(interaction, config, db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        let embed = new discord_js_1.MessageEmbed()
            .setTitle("🏆 Classement des guildes")
            .setColor(config.getData("/main_color"));
        let components;
        let guilds = Object.values(yield db.getData("/guilds")).sort((a, b) => { return b.level - a.level; });
        let guilds_limited;
        let page = 1;
        if (guilds.length > 16) {
            guilds_limited = guilds.slice(0, 15);
            embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length / 15)} | ${guilds.length} guildes` });
            components = new discord_js_1.MessageActionRow()
                .addComponents(new discord_js_1.MessageButton()
                .setCustomId('next_page')
                .setStyle('SECONDARY')
                .setEmoji('➡'));
        }
        else {
            guilds_limited = guilds;
        }
        let description = "";
        for (let i = 0; i < guilds_limited.length; i++) {
            let emoji;
            switch (i) {
                case 0:
                    emoji = "🥇";
                    break;
                case 1:
                    emoji = "🥈";
                    break;
                case 2:
                    emoji = "🥉";
                    break;
                case 3:
                case 4:
                    emoji = "🎖️";
                    break;
                default:
                    emoji = "⚫";
                    break;
            }
            description += `${emoji}${i + 1} **${guilds_limited[i].name}** | \`Niveau ${Math.round(guilds_limited[i].level * 100) / 100}\`\n`;
        }
        embed.setDescription(description);
        if (components) {
            yield interaction.editReply({ embeds: [embed], components: [components] });
        }
        else {
            yield interaction.editReply({ embeds: [embed] });
        }
        if (components) {
            let msg = yield interaction.fetchReply();
            let button_listener = (button_interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!button_interaction.isButton())
                    return;
                if (button_interaction.message.id != msg.id)
                    return;
                switch (button_interaction.customId) {
                    case 'next_page':
                        page++;
                        break;
                    case 'previous_page':
                        page--;
                        break;
                }
                guilds_limited = guilds.slice((page - 1) * 15, page * 15);
                embed.setFooter({ text: `Page ${page}/${Math.ceil(guilds.length / 15)} | ${guilds.length} guildes` });
                embed.setFields([]);
                description = "";
                for (let i = 0; i < guilds_limited.length; i++) {
                    let emoji;
                    if (page == 1) {
                        switch (i) {
                            case 0:
                                emoji = "🥇";
                                break;
                            case 1:
                                emoji = "🥈";
                                break;
                            case 2:
                                emoji = "🥉";
                                break;
                            case 3:
                            case 4:
                                emoji = "🎖️";
                                break;
                            default:
                                emoji = "⚫";
                                break;
                        }
                    }
                    else
                        emoji = "⚫";
                    description += `${emoji}${i + 1 + (15 * (page - 1))} **${guilds_limited[i].name}** | \`Niveau ${Math.round(guilds_limited[i].level * 100) / 100}\`\n`;
                }
                embed.setDescription(description);
                components.setComponents();
                if (page > 1) {
                    components.addComponents([
                        new discord_js_1.MessageButton()
                            .setCustomId('previous_page')
                            .setStyle('SECONDARY')
                            .setEmoji('⬅')
                    ]);
                }
                if (page < Math.ceil(guilds.length / 15)) {
                    components.addComponents([
                        new discord_js_1.MessageButton()
                            .setCustomId('next_page')
                            .setStyle('SECONDARY')
                            .setEmoji('➡')
                    ]);
                }
                yield button_interaction.update({ embeds: [embed], components: [components] });
            });
            interaction.client.on('interactionCreate', button_listener);
            setTimeout(() => {
                msg.edit({ components: [] });
                interaction.client.removeListener('interactionCreate', button_listener);
            }, 300000);
        }
    });
}
exports.execute = execute;
