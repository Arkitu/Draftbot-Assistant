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
const Reminder_js_1 = require("../../libs/Reminder.js");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('remove_reminder')
    .setDescription('Supprime un rappel')
    .addStringOption(option => option
    .setName("message")
    .setDescription("Le message du rappel")
    .setRequired(true));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        let opt = {
            msg: interaction.options.getString("message")
        };
        if (db.getData(`/reminders`).filter(r => r.author_id == interaction.user.id && r.message == opt.msg).length == 0) {
            yield interaction.editReply(":warning: Aucun rappel ne correspond à ce message");
            return;
        }
        for (let reminder of db.getData(`/reminders`).filter(r => r.author_id == interaction.user.id && r.message == opt.msg)) {
            let channel;
            if (reminder.channel.channel_type) {
                channel = {
                    channel: yield interaction.client.channels.fetch(reminder.channel.channel_id),
                    channel_type: reminder.channel.channel_type
                };
            }
            else {
                channel = {
                    channel: yield interaction.client.users.fetch(reminder.channel.channel_id),
                    channel_type: reminder.channel.channel_type
                };
            }
            yield new Reminder_js_1.Reminder(interaction.client, channel, reminder.dead_line_timestamp, reminder.message, yield interaction.client.users.fetch(reminder.author_id), db, config).delete();
        }
        yield interaction.editReply("Rappel(s) supprimé(s) !");
    });
}
exports.execute = execute;
