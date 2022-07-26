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
    .setName('infos')
    .setDescription('Infos sur le bot')
    .addSubcommand(subcmd => subcmd
    .setName('tracked')
    .setDescription("Affiche le nombre d'utilisateurs suivis"))
    .addSubcommand(subcmd => subcmd
    .setName('tracked_events')
    .setDescription("Affiche le nombre d'événements trackés"));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        switch (interaction.options.getSubcommand()) {
            case 'tracked':
                let tracked = 0;
                for (let user in db.getData("/users")) {
                    if (db.getData(`/users/${user}/config/tracking/reports`)) {
                        tracked++;
                    }
                }
                yield interaction.editReply(`${tracked} utilisateurs suivis`);
                break;
            case 'tracked_events':
                let tracked_events = 0;
                for (let user in db.getData("/users")) {
                    tracked_events += db.getData(`/users/${user}/tracking`).length;
                }
                yield interaction.editReply(`${tracked_events} événements trackés`);
                break;
        }
    });
}
exports.execute = execute;
