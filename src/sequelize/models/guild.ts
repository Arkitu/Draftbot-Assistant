import {
  DataTypes,
  Model,
  ModelAttributes,
  Optional,
  InferAttributes,
  InferCreationAttributes,
  HasManyCreateAssociationMixin
} from "sequelize";
import { ModelWithAssociate } from ".";
import { Tracking } from "./tracking";

export const initArgs: ModelAttributes<Guild, Optional<InferAttributes<Guild>, never>> = {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  description: DataTypes.STRING
};

export class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
  declare name: string;
  declare description: string;

  declare createTracking: HasManyCreateAssociationMixin<Tracking>;

  doSomething() {
    console.log("something")
  }

  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate() {
    this.hasMany(db.models.User);
    this.hasMany(db.models.Tracking);
  }
}

export default () => {
  Guild.init(initArgs, {
    sequelize: db,
    modelName: 'Guild',
  });

  return Guild as ModelWithAssociate;
};