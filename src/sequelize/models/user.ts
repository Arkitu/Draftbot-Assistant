import { Sequelize, DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { SequelizeWithAssociate } from ".";
import * as dottie from "dottie";


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

export default (db: SequelizeWithAssociate) => {
  class User extends Model {
    declare static setDataValue: any;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db: SequelizeWithAssociate) {
      this.hasMany(db.models.Reminder);
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