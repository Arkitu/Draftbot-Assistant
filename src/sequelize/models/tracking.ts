import { DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { ModelWithAssociate, SequelizeWithAssociate, snowflakeValidate } from ".";
import { Guild } from "./guild";
import { User } from "./user";

export interface ProfileData {
	lvl: number,
	pv: number,
	max_pv: number,
	xp: number,
	max_xp: number,
	gold: number,
	energy: number,
	max_energy: number,
	strenght: number,
	defense: number,
	speed: number,
	gems: number,
	quest_missions_percentage: number,
	rank: number,
	rank_points: number,
	class: {
		name: string,
		emoji: string
	},
	guild_name: string | null,
	destination: string
}

export interface LongReportData {
	points: number,
	gold: number,
	xp: number,
	time: number,
	pv: number,
	id: string
}

export interface GuildData {
  level: number,
  xp: number,
  max_xp: number,
  full_level?: number
}

export class Tracking extends Model {
  declare id: number;
  declare type: "profile" | "long_report" | "short_report" | "guild";
  declare data: ProfileData | LongReportData | null;
  declare static stringifiedData: string | null;
  declare getGuild: ()=>Promise<Guild>;
  declare getUser: ()=>Promise<User>;

  getTrackable() {
    if (this.type === "guild") {
      return this.getGuild();
    } else {
      return this.getUser();
    }
  }
  
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.belongsTo(db.models.User);
    this.belongsTo(db.models.Guild);
  }

  static get initArgs() {
    let args: ModelAttributes<Tracking, Optional<any, never>> = {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["profile", "long_report", "short_report", "guild"]]
        }
      },
      stringifiedData: DataTypes.STRING,
      data: {
        type: DataTypes.VIRTUAL,
        get: ()=>{
          let data = JSON.parse(this.stringifiedData);
          if (data.level != undefined) {
            data.full_level = data.level + (data.xp/data.max_xp);
          }
          return 
        },
        set: (val: ProfileData | LongReportData | GuildData | null)=>{
          this.stringifiedData = JSON.stringify(val);
        }
      }
    };
    return args;
  }
}

export default () => {
  Tracking.init(Tracking.initArgs, {
    sequelize: db,
    modelName: 'Tracking',
  });

  return Tracking as ModelWithAssociate;
};