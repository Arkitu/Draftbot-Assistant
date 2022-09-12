import { DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { ModelWithAssociate } from ".";

export class Guild extends Model {
  declare name: string;
  declare level: number;
  declare description: string;
  
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.hasMany(db.models.User);
  }

  static get initArgs() {
    let args: ModelAttributes<Guild, Optional<any, never>> = {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      level: DataTypes.FLOAT,
      description: DataTypes.STRING
    };
    return args;
  }
}

export default () => {
  Guild.init(Guild.initArgs, {
    sequelize: db,
    modelName: 'Guild',
  });

  return Guild as ModelWithAssociate;
};