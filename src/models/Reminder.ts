import { MessageEmbed, User, TextBasedChannel, DMChannel } from 'discord.js';
import { Context } from '../libs/Context.js';
import { Model, DataTypes, ModelAttributes } from "sequelize";

export class Reminder extends Model {
    declare id: number;
    declare channel_id: string;
    declare channel_isUser: boolean;
    declare dead_line: number;
    declare message: string;

    ctx: Context;
    channel: TextBasedChannel | User;
    author: User;

    constructor(opts: {
        ctx: Context,
        channel: TextBasedChannel | User,
        dead_line: number,
        message: string,
        author: User
    }) {
        super({
            channel_id: opts.channel.id,
            channel_isUser: opts.channel instanceof User,
            dead_line: opts.dead_line,
            message: opts.message,
            author_id: opts.author.id
        })
        this.ctx = opts.ctx;
        this.channel = opts.channel;
        this.author = opts.author;
    }

    async start() {
        setTimeout(async () => {
            if (await this.ctx.sequelize.models.reminder.findOne({ where: { id: this.id } })) {
                let embed = new MessageEmbed()
                    .setColor(this.ctx.config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.message)
                await this.sendReminderMessage(embed);
                this.destroy()
            }
        }, (this.dead_line - Date.now()));
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

export const reminder_init_args: ModelAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    channel_id: DataTypes.TEXT,
    channel_isUser: DataTypes.BOOLEAN,
    dead_line: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    author_id: DataTypes.TEXT
}
