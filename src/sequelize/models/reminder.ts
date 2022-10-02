import { DMChannel, MessageEmbed, TextBasedChannel } from "discord.js";
import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyCreateAssociationMixin,
    CreationOptional,
    BelongsToGetAssociationMixin,
    NonAttribute,
    ForeignKey,
    Sequelize
} from "sequelize";
import { User } from "./user.js";

export const initArgs = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    channelId: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    channelIsUser: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    deadLineTimestamp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
};

export class Reminder extends Model<InferAttributes<Reminder>, InferCreationAttributes<Reminder>> {
    declare id: CreationOptional<number>;
    declare channelId: string;
    declare channelIsUser: boolean;
    declare deadLineTimestamp: number;
    declare message: string;
    declare getUser: BelongsToGetAssociationMixin<User>;
    declare UserDiscordId: ForeignKey<User["discordId"]>;

    fetchChannel() {
        return client.channels.fetch(this.channelId);
    }

    // deadLine
    get deadLine(): NonAttribute<Date> {
        return new Date(this.deadLineTimestamp);
    }
    set deadLine(val: Date) {
        this.deadLineTimestamp = val.getTime();
    }

    /**
     * You need to assure you that the channel is cached before using reminder.channel or use fetchChannel() instead
     */
    get channel(): NonAttribute<TextBasedChannel> {
        let channel = client.channels.cache.get(this.channelId);
        if (!channel.isText()) {
            throw new Error(`Reminder channel is not TextBased ! His type is ${channel.type}`);
        }
        return channel;
    }

    // Methods
    async start() {
        setTimeout(async () => {
            if (await db.models.Reminder.findOne({ where: { id: this.id } })) {
                let embed = new MessageEmbed()
                    .setColor(config.getData("/main_color"))
                    .setTitle("Reminder")
                    .setDescription(this.get('message'))
                this.sendReminderMessage({ embed: embed });
                this.destroy()
            }
        }, (this.deadLine.getTime() - Date.now()));
        return this;
    }

    async sendReminderMessage(opts: { embed: MessageEmbed }) {
        await this.fetchChannel();
        const user = await this.getUser();
        await user.fetchDiscordUser();
        if (this.channel instanceof DMChannel) {
            this.channel.send({ embeds: [opts.embed] });
            return;
        }
        if (!("permissionsFor" in this.channel)) return;
        if (this.channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) {
            this.channel.send({ content: user.discordUser.toString(), embeds: [opts.embed] });
        }
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
        this.belongsTo(db.models.User);
    }
}

export function initModel() {
    Reminder.init(initArgs, {
        sequelize: db,
        modelName: "Reminder"
    });
}