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
    .setName('reminders')
    .setDescription('Renvois la liste des rappels');
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        let reminders = db.getData('/reminders').filter(reminder => reminder.author_id == interaction.user.id);
        let str_reminders = "";
        if (reminders.length > 0) {
            for (let reminder of reminders) {
                let delay = reminder.dead_line_timestamp - Date.now();
                let str_date = "";
                if (delay > 86400000) {
                    str_date = `${Math.floor(delay / 86400000)} jour(s) `;
                }
                else if (delay > 3600000) {
                    str_date = `${Math.floor(delay / 3600000)}h ${Math.floor(delay % 3600000 / 60000)}min`;
                }
                else if (delay > 60000) {
                    str_date = `${Math.floor(delay / 60000)}min ${Math.floor(delay % 60000 / 1000)}sec`;
                }
                else if (delay > 1000) {
                    str_date = `${Math.floor(delay / 1000)}sec`;
                }
                else if (delay > 0) {
                    str_date = `${delay}ms`;
                }
                else {
                    str_date = "maintenant";
                }
                str_reminders += `• **message :** ${reminder.message} - **temps restant :** ${str_date} - **salon :** <#${reminder.channel.channel_id}>\n\n`;
            }
        }
        else {
            str_reminders = "Vous n'avez aucun rappel";
        }
        let embed = new discord_js_1.MessageEmbed()
            .setColor(config.getData("/main_color"))
            .setTitle(`Rappels de ${interaction.user.username}`)
            .setDescription(str_reminders);
        interaction.editReply({ embeds: [embed] });
    });
}
exports.execute = execute;
