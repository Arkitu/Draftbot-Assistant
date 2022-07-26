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
exports.Reminder = void 0;
const discord_js_1 = require("discord.js");
class Reminder {
    constructor(client, channel, dead_line_timestamp, message, author, db, config) {
        this.client = client;
        this.channel = channel;
        this.dead_line_timestamp = dead_line_timestamp;
        this.message = message;
        this.author = author;
        this.deleted = false;
        this.id = channel.channel.id + dead_line_timestamp + message + author.id;
        this.db = db;
        this.config = config;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                if ((!this.deleted) && this.db.getIndex("/reminders", this.id, "id") != -1) {
                    let embed = new discord_js_1.MessageEmbed()
                        .setColor(this.config.getData("/main_color"))
                        .setTitle("Reminder")
                        .setDescription(this.message);
                    yield this.sendReminderMessage(embed);
                    this.delete();
                }
            }), (this.dead_line_timestamp - Date.now()));
            return this;
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.delete(`/reminders[${this.db.getIndex("/reminders", this.id, "id")}]`);
            this.deleted = true;
            return this;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.push("/reminders[]", {
                channel: {
                    channel_id: this.channel.channel.id,
                    channel_type: this.channel.channel_type
                },
                dead_line_timestamp: this.dead_line_timestamp,
                message: this.message,
                author_id: this.author.id,
                id: this.id
            });
            return this;
        });
    }
    sendReminderMessage(embed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel.channel.id === this.author.id) {
                yield this.channel.channel.send({ embeds: [embed] });
                return;
            }
            if (this.channel.channel.permissionsFor(this.client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
                yield this.channel.channel.send({ content: this.author.toString(), embeds: [embed] });
            }
        });
    }
}
exports.Reminder = Reminder;
