import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToGetAssociationMixin,
    NonAttribute
} from "sequelize";
import { ModelWithAssociate } from ".";
import { User } from "./user";

export const GoalUnitTranslate = {
    lvl: "niveaux",
    gold: ":moneybag:",
    pv: ":heart:",
    xp: ":star:",
    gems: ":gem:",
    quest_missions_percentage: "% de missions de quêtes",
    rank_points: ":medal:"
}

export const initArgs: ModelAttributes<Goal, Optional<InferAttributes<Goal>, never>> = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    start: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    end: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    initValue: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

export class Goal extends Model<InferAttributes<Goal>, InferCreationAttributes<Goal>> {
    declare id: CreationOptional<number>;
    declare start: number;
    declare end: number;
    declare unit: "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points";
    declare initValue: number;
    declare value: number;
    declare getUser: BelongsToGetAssociationMixin<User>;

    get endValue(): NonAttribute<number> {
        return this.initValue + this.value;
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

export default () => {
    Goal.init(initArgs, {
        sequelize: db,
        modelName: 'Goal',
    });

    return Goal as ModelWithAssociate;
};