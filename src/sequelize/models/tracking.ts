import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyCreateAssociationMixin,
    CreationOptional,
    BelongsToGetAssociationMixin,
    NonAttribute
} from "sequelize";
import { ModelWithAssociate, SequelizeWithAssociate, snowflakeValidate } from ".";
import { Guild } from "./guild";
import { User } from "./user";

export interface ProfileData {
    type: "profile"
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
    type: "long_report"
    points: number,
    gold: number,
    xp: number,
    time: number,
    pv: number,
    id: string
}

export interface PartialGuildData {
    type: "guild"
    level: number,
    xp: number,
    max_xp: number
}

class GuildData implements PartialGuildData {
    type: "guild";
    level: number;
    xp: number;
    max_xp: number;
    constructor(opts: PartialGuildData) {
        this.type = opts.type;
        this.level = opts.level;
        this.xp = opts.xp;
        this.max_xp = opts.max_xp;
    }

    get full_level() {
        return this.level + (this.xp / this.max_xp);
    }
}

export const initArgs: ModelAttributes<Tracking, Optional<InferAttributes<Tracking>, never>> = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [["profile", "long_report", "short_report", "guild"]]
        }
    },
    stringifiedData: {
        type: DataTypes.TEXT("long")
    }
};

export class Tracking extends Model<InferAttributes<Tracking>, InferCreationAttributes<Tracking>> {
    declare id: CreationOptional<number>;
    declare type: "profile" | "long_report" | "short_report" | "guild";
    declare stringifiedData: CreationOptional<string>;
    declare getGuild: BelongsToGetAssociationMixin<Guild>;
    declare getUser: BelongsToGetAssociationMixin<User>;

    get data(): NonAttribute<ProfileData | LongReportData | GuildData | null> {
        let data = JSON.parse(this.stringifiedData) as ProfileData | LongReportData | PartialGuildData | null;
        
        if (data.type === "guild") {
            return new GuildData(data)
        }
        return data;
    }
    set data(val: ProfileData | LongReportData | PartialGuildData | null) {
        this.stringifiedData = JSON.stringify(val);
    }

    getTrackable(): Promise<Guild | User> {
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
}

export default () => {
    Tracking.init(initArgs, {
        sequelize: db,
        modelName: 'Tracking',
    });

    return Tracking as ModelWithAssociate;
};