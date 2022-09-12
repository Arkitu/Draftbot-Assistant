import { DataTypes, Model, ModelAttributes, Optional } from "sequelize";
import { ModelWithAssociate } from ".";

export class PropoReminder extends Model {
  declare id: number;
  declare trigger: string;
  declare duration: number;
  declare inDm: boolean;
  
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.belongsTo(db.models.User);
  }

  static get initArgs() {
    let args: ModelAttributes<PropoReminder, Optional<any, never>> = {
      trigger: {
        type: DataTypes.STRING,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      inDm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    };
    return args;
  }
}

export default () => {
  PropoReminder.init(PropoReminder.initArgs, {
    sequelize: db,
    modelName: 'PropoReminder',
  });

  return PropoReminder as ModelWithAssociate;
};