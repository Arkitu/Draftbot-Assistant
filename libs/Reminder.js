import { MessageEmbed } from 'discord.js';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

const db = new JsonDB(new Config("db", true, true, '/'));
const config = new JsonDB(new Config("config", true, true, '/'));

export class Reminder {
    constructor(client, channel, dead_line_timestamp, message, author) {
        this.client = client;
        this.channel = channel;
        this.dead_line_timestamp = dead_line_timestamp;
        this.message = message;
        this.author = author;
        this.deleted = false;
        this.id = channel.channel.id + dead_line_timestamp + message + author.id;
    }

    async start() {
        setTimeout(() => {
            if (!this.deleted) {
                let embed = new MessageEmbed()
                    .setColor(config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.message)
                this.channel.channel.send({ content: `${this.author}`, embeds: [embed] });
                this.delete();

            }
        }, (this.dead_line_timestamp - Date.now()));
        return this;
    }

    async delete() {
        db.delete(`/reminders[${db.getIndex("/reminders", this.id, "id")}]`);
        this.deleted = true;
        return this;
    }

    async save() {
        db.push("/reminders[]", {
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
    }
}