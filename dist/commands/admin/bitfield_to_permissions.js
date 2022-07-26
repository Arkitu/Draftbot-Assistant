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
const bitfieldCalculator = require("discord-bitfield-calculator");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('bitfield_to_permissions')
    .setDescription('Convertit un bitfield en permissions')
    .addStringOption(opt => opt
    .setName('bitfield')
    .setRequired(true)
    .setDescription('Le bitfield à convertir'));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        let permissions = bitfieldCalculator.permissions(interaction.options.getString('bitfield'));
        console.log("Permissions :");
        console.log(permissions);
        yield interaction.reply(`${permissions}`);
    });
}
exports.execute = execute;
