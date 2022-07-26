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
    .setName('fetch')
    .setDescription('Récupère quelque chose avec son id')
    .addStringOption(opt => opt
    .setName('id')
    .setRequired(true)
    .setDescription('L\'id de l\'objet à récupérer'));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        let thing;
        let type = "(i don't know)";
        try {
            thing = yield interaction.client.users.fetch(interaction.options.getString('id'));
            type = "user";
        }
        catch (_a) {
            console.log("Not a user");
        }
        try {
            thing = yield interaction.client.channels.fetch(interaction.options.getString('id'));
            type = "channel";
        }
        catch (_b) {
            console.log("Not a channel");
        }
        try {
            thing = yield interaction.client.guilds.fetch(interaction.options.getString('id'));
            type = "guild";
        }
        catch (_c) {
            console.log("Not a guild");
        }
        try {
            thing = yield interaction.client.emojis.fetch(interaction.options.getString('id'));
            type = "emoji";
        }
        catch (_d) {
            console.log("Not an emoji");
        }
        try {
            thing = yield interaction.client.webhooks.fetch(interaction.options.getString('id'));
            type = "webhook";
        }
        catch (_e) {
            console.log("Not a webhook");
        }
        try {
            thing = yield interaction.client.invites.fetch(interaction.options.getString('id'));
            type = "invite";
        }
        catch (_f) {
            console.log("Not an invite");
        }
        console.log("This is a" + type);
        console.log("The thing :");
        console.log(thing);
        if (type == "channel") {
            console.log("Permissions :");
            console.log(thing.permissionOverwrites.cache);
        }
        yield interaction.reply(`${thing}`);
    });
}
exports.execute = execute;
