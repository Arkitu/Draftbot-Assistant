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
    .setName('add_reminder')
    .setDescription('Ajoute un rappel')
    .addStringOption(option => option
    .setName("message")
    .setDescription("Le message à rappeler")
    .setRequired(true))
    .addIntegerOption(option => option
    .setName("time")
    .setDescription("Le temps avant que le rappel ne soit envoyé")
    .setRequired(true))
    .addStringOption(option => option
    .setName("unit")
    .setDescription("L'unité de temps (par default sur `minutes`)")
    .setRequired(false)
    .addChoice("secondes", "secondes")
    .addChoice("minutes", "minutes")
    .addChoice("heures", "heures")
    .addChoice("jours", "jours"));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        let args = {
            time: interaction.options.getInteger("time"),
            message: interaction.options.getString("message"),
            unit: interaction.options.getString("unit") || "minutes"
        };
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
        let channel;
        if (yield interaction.channel) {
            channel = {
                channel: yield interaction.channel,
                channel_type: true
            };
        }
        else {
            channel = {
                channel: yield interaction.user,
                type_channel: false
            };
        }
        let reminder = new Reminder_js_1.Reminder(interaction.client, channel, dead_line.getTime(), args.message, yield interaction.user, db, config);
        yield reminder.save();
        yield reminder.start();
        yield interaction.editReply("Le rappel a été ajouté !");
    });
}
exports.execute = execute;
