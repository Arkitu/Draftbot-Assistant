import { DMChannel, MessageEmbed, TextBasedChannel } from "discord.js";
import { DataTypes, Model, ModelAttributes, Optional, Sequelize } from "sequelize";
import { ModelWithAssociate, SequelizeWithAssociate, snowflakeValidate } from ".";

export class Reminder extends Model {
  declare channelId: string;
  declare channelIsUser: boolean;
  declare deadLineTimestamp: number;
  declare message: string;
  declare deadLine: Date;
  declare channel: TextBasedChannel;
  declare getUser: (): User
  declare static deadLineTimestamp: number;
  declare static setDataValue: any;
  declare static channelId: string;

  /**
   * You need to fetch the channel before using reminder.channel
   */
  fetchChannel() {
    return client.channels.fetch(this.channelId);
  }

  // Methods
  async start() {
    console.debug(1);
    setTimeout(async () => {
        console.debug(2)
        if (await db.models.Reminder.findOne({ where: { id: this.id } })) {
            console.debug(3)
            console.debug(this.message, typeof this.message)
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

  async sendReminderMessage(opts: {embed: MessageEmbed}) {
    await this.fetchChannel();
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

  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.belongsTo(db.models.User)
  }

  static get initArgs() {
    let args: ModelAttributes<Reminder, Optional<any, never>> = {
      channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: snowflakeValidate
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
        type: DataTypes.STRING,
        allowNull: false
      },
      deadLine: {
        type: DataTypes.VIRTUAL,
        get: ()=>{
          return new Date(this.deadLineTimestamp);
        },
        set: (val: Date)=>{
          this.setDataValue(val.getTime());
        }
      },
      channel: {
        type: DataTypes.VIRTUAL,
        get: ()=>{
          return client.channels.cache.get(this.channelId);
        }
      }
    };
    return args;
  }
}

export default () => {
  Reminder.init(Reminder.initArgs, {
    sequelize: db,
    modelName: 'Reminder',
  });

  return Reminder as ModelWithAssociate;
};