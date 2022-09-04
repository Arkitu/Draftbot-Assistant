import { Sequelize, DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import * as dottie from "dottie";
import { DB } from ".";

interface Config {
  reminders: {
      auto_proposition: {
          events: boolean,
          minievents: boolean,
          guilddaily: boolean,
          daily: boolean,
          petfree: boolean,
          petfeed: boolean,
          vote: boolean,
          in_dm: boolean
      }
  },
  tracking: {
      reports: boolean,
      public: boolean,
      profile: boolean
  }
}

interface ConfigSetArgs {
  reminders?: {
      auto_proposition?: {
          events?: boolean,
          minievents?: boolean,
          guilddaily?: boolean,
          daily?: boolean,
          petfree?: boolean,
          petfeed?: boolean,
          vote?: boolean,
          in_dm?: boolean
      }
  },
  tracking?: {
      reports?: boolean,
      public?: boolean,
      profile?: boolean
  }
}

export default (sequelize: Sequelize) => {
  class User extends Model {
    static setDataValue: any;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: DB) {
      // define association here
    }

    static get initArgs() {
      let args: ModelAttributes<User, Optional<any, never>> = {
        discordId: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        config: {
          type: DataTypes.VIRTUAL,
          get: (): Config=>{
            return dottie.transform(this)["config"]
          },
          set: (val: ConfigSetArgs)=>{
            const flat = dottie.flatten(val);
            for (let key in flat) {
              this.setDataValue(key, flat[key])
            }
          }
        }
      }

      for (let key in dottie.flatten(this)) {
        if (key.startsWith("config.")) {
          args[key] = {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
          }
        }
      }

      return args;
    }
  }
  User.init(User.initArgs, {
    sequelize,
    modelName: 'User',
  });
  return User;
};