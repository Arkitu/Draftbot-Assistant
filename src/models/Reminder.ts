import { MessageEmbed, User as DiscordUser, TextBasedChannel, DMChannel } from 'discord.js';
import { User } from '.';
import { Table, Column, Model, DataType, BelongsTo } from 'sequelize-typescript';

@Table
export default class Reminder extends Model {
    // Saved in database
    @Column({
        allowNull: false,
        validate: {
            len: [18,18],
            isInt: true
        }
    })
    channelId: string;

    @Column({
        allowNull: false,
        defaultValue: false
    })
    channelIsUser: boolean;

    @Column({
        allowNull: false
    })
    deadLineTimestamp: number;

    @Column({
        allowNull: false
    })
    message: string;

    @BelongsTo(() => User)
    author: User;
    
    // Not saved in database
    @Column(DataType.VIRTUAL)
    get deadLine() {
        return new Date(this.deadLineTimestamp);
    }

    set deadLine (value: Date) {
        this.deadLineTimestamp = value.getTime()
    }

    @Column({
        type: DataType.VIRTUAL,
        allowNull: false
    })
    private channel: TextBasedChannel | DiscordUser;

    async getChannel() {
        if (this.channel) return this.channel;
        if (this.channelIsUser) {
            this.channel = await client.users.fetch(this.channelId);
            return this.channel as DiscordUser;
        } else {
            let fetched = await client.channels.fetch(this.channelId);
            if (!fetched.isText()) throw new Error("Channel is not a text channel");
            this.channel = fetched;
            return this.channel as TextBasedChannel;
        }
    }

    // Methods
    async start() {
        setTimeout(async () => {
            if (await models.Reminder.findOne({ where: { id: this.id } })) {
                let embed = new MessageEmbed()
                    .setColor(config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.message)
                this.sendReminderMessage({ embed: embed });
                this.destroy()
            }
        }, (this.deadLine.getTime() - Date.now()));
        return this;
    }

    async sendReminderMessage(opts: {embed: MessageEmbed}) {
        await this.getChannel();
        await this.author.fetchDiscordUser();
        if (this.channel instanceof DMChannel) {
            this.channel.send({embeds: [opts.embed]});
            return;
        }
        if (!("permissionsFor" in this.channel)) return;
        if (this.channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
            this.channel.send({content: this.author.discordUser.toString(), embeds: [opts.embed]});
        }
    }
}

/*
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
*/