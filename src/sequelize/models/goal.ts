import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToGetAssociationMixin,
    NonAttribute,
    ForeignKey
} from "sequelize";
import { User } from "./user.js";

export const GoalUnitTranslate = {
    lvl: "niveaux",
    gold: ":moneybag:",
    pv: ":heart:",
    xp: ":star:",
    gems: ":gem:",
    quest_missions_percentage: "% de missions de quêtes",
    rank_points: ":medal:"
}

export const initArgs = {
    id: {
        type: DataTypes.INTEGER,
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
    declare UserId: ForeignKey<User["id"]>;
    declare getUser: BelongsToGetAssociationMixin<User>;

    $getUser(...opts: Parameters<BelongsToGetAssociationMixin<User>>) {
        const args = opts[0] || {};
        return db.models.User.findAll({ ...args, where: { id: this.UserId, ...args.where } });
    }

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

export function initModel() {
    Goal.init(initArgs, {
        sequelize: db,
        modelName: 'Goal',
    });
    console.log(`Initialized model ${Goal.name}`);
}