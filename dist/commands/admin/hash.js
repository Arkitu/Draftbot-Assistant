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
const crypto_1 = require("crypto");
exports.data = new builders_1.SlashCommandBuilder()
    .setName("hash")
    .setDescription("Renvoie le hash de la chaine de caractères passée en paramètre")
    .addStringOption(option => option
    .setName("string")
    .setDescription("La chaine de caractères à hasher")
    .setRequired(true));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        const opt_string = interaction.options.getString("string");
        var hash = (0, crypto_1.createHash)('md5').update(opt_string).digest('hex');
        yield interaction.editReply(hash);
    });
}
exports.execute = execute;
