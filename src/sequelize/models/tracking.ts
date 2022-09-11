import { DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { ModelWithAssociate, SequelizeWithAssociate, snowflakeValidate } from ".";

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

export class Tracking extends Model {
  declare id: number;
  declare data: ProfileData | LongReportData | null;
  declare static stringifiedData: string | null;
  
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.belongsTo(db.models.User);
  }

  static get initArgs() {
    let args: ModelAttributes<Tracking, Optional<any, never>> = {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["profile", "long_report", "short_report"]]
        }
      },
      stringifiedData: DataTypes.STRING,
      data: {
        type: DataTypes.VIRTUAL,
        get: ()=>{
          return JSON.parse(this.stringifiedData);
        },
        set: (val: ProfileData | LongReportData | null)=>{
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