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
    .setName("help")
    .setDescription("Affiche la liste des commandes")
    .addStringOption(option => option
    .setName("categorie")
    .setDescription("La categorie sur laquelle vous souhaitez des précisions")
    .setRequired(false)
    .addChoice("Classiques", "Classiques")
    .addChoice("Reminders", "Reminders")
    .addChoice("Tracking", "Tracking"));
function execute(interaction, config, db, constants) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        const opt_categorie = interaction.options.getString("categorie");
        let help_embed = new discord_js_1.MessageEmbed()
            .setColor(config.getData("/main_color"))
            .setThumbnail(interaction.client.user.avatarURL());
        if (opt_categorie) {
            help_embed.setAuthor({ name: opt_categorie, iconURL: interaction.client.user.avatarURL(), url: config.getData("/help_link") });
            for (let cmd of constants.getData(`/helpCategories[${constants.getIndex("/helpCategories", opt_categorie, "name")}]/commands`)) {
                help_embed.addField(`\`/${cmd}\``, db.getData(`/commands[${db.getIndex("/commands", cmd, "name")}]/description`));
            }
            if (help_embed.fields.length === 0) {
                help_embed.setDescription("Aucune commande dans cette catégorie");
            }
        }
        else {
            help_embed.setAuthor({ name: `Aide de ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL(), url: config.getData("/help_link") });
            for (let categorie of constants.getData("/helpCategories")) {
                help_embed.addField(categorie.name, `\`/help ${categorie.name}\``, true);
            }
        }
        yield interaction.editReply({ embeds: [help_embed] });
    });
}
exports.execute = execute;
