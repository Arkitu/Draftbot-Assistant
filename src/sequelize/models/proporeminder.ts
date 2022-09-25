import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToGetAssociationMixin,
    ForeignKey,
    Attributes,
} from "sequelize";
import { ModelWithAssociate } from ".";
import { User } from "./user";


export const initArgs = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
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

export class PropoReminder extends Model<InferAttributes<PropoReminder>, InferCreationAttributes<PropoReminder>> {
    declare id: CreationOptional<number>;
    declare trigger: string;
    declare duration: number;
    declare inDm: boolean;
    declare userId: ForeignKey<User['discordId']>;
    declare getUser: BelongsToGetAssociationMixin<User>;

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
        this.belongsTo(db.models.User);
    }
}

export default () => {
    PropoReminder.init(initArgs, {
        sequelize: db,
        modelName: 'PropoReminder',
    });

    return PropoReminder as ModelWithAssociate;
};