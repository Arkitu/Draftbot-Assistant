import { DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { ModelWithAssociate SequelizeWithAssociate, snowflakeValidate } from ".";

export default (db: SequelizeWithAssociate) => {
  class Reminder extends Model {
    declare channelId: string;
    declare channelIsUser: boolean;
    declare deadLineTimestamp: number;
    declare static deadLineTimestamp: number;
    declare static setDataValue: any;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db: SequelizeWithAssociate) {
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
        }
      };
      return args;
    }
  }

  Reminder.init(Reminder.initArgs, {
    sequelize,
    modelName: 'Reminder',
  });

  return Reminder;
};