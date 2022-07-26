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
exports.data = new builders_1.SlashCommandBuilder()
    .setName('add_goal_message')
    .setDescription('Ajoute un messaeg sur lequel les utilisateurs peuvent cliquer pour ajouter un objectif')
    .addChannelOption(opt => opt
    .setName('channel')
    .setDescription('Le channel dans lequel le message sera créé')
    .setRequired(true))
    .addIntegerOption(opt => opt
    .setName('duration')
    .setDescription('La durée avant que le message ne disparaisse (en millisecondes)')
    .setRequired(true))
    .addIntegerOption(opt => opt
    .setName('start_time')
    .setDescription('L\'heure à laquelle le message sera créé (en millisecondes)')
    .setRequired(false));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        let opts = {
            channel: interaction.options.getChannel('channel'),
            start: interaction.options.getInteger('start_time') || Date.now(),
            duration: interaction.options.getInteger('duration')
        };
        db.push("/goal_messages", {
            channel: opts.channel.id,
            start: opts.start,
            end: opts.start + opts.duration
        });
    });
}
exports.execute = execute;
