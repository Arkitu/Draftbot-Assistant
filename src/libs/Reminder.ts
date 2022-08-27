import { MessageEmbed, User, TextBasedChannel, DMChannel } from 'discord.js';
import Context from './Context.js';

export default class Reminder {

    ctx: Context;
    deleted: boolean;
    channel: TextBasedChannel | User;
    dead_line_timestamp: number;
    message: string;
    id: string;
    author: User;

    constructor(opts: {
        ctx: Context,
        channel: TextBasedChannel | User,
        dead_line_timestamp: number,
        message: string,
        author: User
    }) {
        this.ctx = opts.ctx;
        this.channel = opts.channel;
        this.dead_line_timestamp = opts.dead_line_timestamp;
        this.message = opts.message;
        this.author = opts.author;
        this.deleted = false;
        this.id = this.channel.id + this.dead_line_timestamp + this.message + this.author.id;
    }

    async start() {
        setTimeout(async () => {
            if ((!this.deleted) && this.ctx.db.getIndex("/reminders", this.id, "id") != -1) {
                let embed = new MessageEmbed()
                    .setColor(this.ctx.config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.message)
                await this.sendReminderMessage(embed);
                this.delete();
            }
        }, (this.dead_line_timestamp - Date.now()));
        return this;
    }

    async delete() {
        this.ctx.db.delete(`/reminders[${this.ctx.db.getIndex("/reminders", this.id, "id")}]`);
        this.deleted = true;
        return this;
    }

    async save() {
        this.ctx.db.push("/reminders[]", {
            channel: {
                id: this.channel.id,
                isUser: this.channel instanceof User
            },
            dead_line_timestamp: this.dead_line_timestamp,
            message: this.message,
            author_id: this.author.id,
            id: this.id
        });
        return this;
    }

    async sendReminderMessage(embed: MessageEmbed) {
        if (this.channel instanceof DMChannel) {
            await this.channel.send({embeds: [embed]});
            return;
        }
        if (!("permissionsFor" in this.channel)) return;
        if (this.channel.permissionsFor(this.ctx.client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
            await this.channel.send({content: this.author.toString(), embeds: [embed]});
        }
    }
}
