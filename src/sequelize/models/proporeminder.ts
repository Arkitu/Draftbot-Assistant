import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToGetAssociationMixin,
    ForeignKey
} from "sequelize";
import { User } from "./user.js";


export const initArgs = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    trigger: {
        type: DataTypes.TEXT,
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
    declare UserId: ForeignKey<User['id']>;

    $getUser(...opts: Parameters<BelongsToGetAssociationMixin<User>>) {
        const args = opts[0] || {};
        return db.models.User.findOne({...args, where: {id: this.UserId, ...args.where}});
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
        this.belongsTo(db.models.User);
    }
}

export function initModel() {
    PropoReminder.init(initArgs, {
        sequelize: db,
        modelName: 'PropoReminder'
    });
    console.log(`Initialized model ${PropoReminder.name}`);
}