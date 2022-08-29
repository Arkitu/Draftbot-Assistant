import { MessageEmbed, User as DiscordUser, TextBasedChannel, DMChannel } from 'discord.js';
import { User } from '.';
import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';

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

    @BelongsTo(()=>User)
    user: User;

    @ForeignKey(()=>User)
    userId: string;
    
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
        await this.user.fetchDiscordUser();
        if (this.channel instanceof DMChannel) {
            this.channel.send({embeds: [opts.embed]});
            return;
        }
        if (!("permissionsFor" in this.channel)) return;
        if (this.channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
            this.channel.send({content: this.user.discordUser.toString(), embeds: [opts.embed]});
        }
    }
}