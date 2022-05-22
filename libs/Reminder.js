import { MessageEmbed } from 'discord.js';

export class Reminder {
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

    async start() {
        setTimeout(async () => {
            if (!this.deleted) {
                let embed = new MessageEmbed()
                    .setColor(this.config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.message)
                if (this.channel.channel.permissionsFor(this.client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
                    await this.channel.channel.send({ content: `${this.author}`, embeds: [embed] });
                }
                this.delete();

            }
        }, (this.dead_line_timestamp - Date.now()));
        return this;
    }

    async delete() {
        this.db.delete(`/reminders[${this.db.getIndex("/reminders", this.id, "id")}]`);
        this.deleted = true;
        return this;
    }

    async save() {
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
    }
}