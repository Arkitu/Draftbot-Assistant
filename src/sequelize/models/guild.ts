import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    NonAttribute
} from "sequelize";
import { GuildData, Tracking } from "./tracking.js";

export const initArgs: ModelAttributes<Guild, Optional<InferAttributes<Guild>, never>> = {
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true
    },
    level: {
        type: DataTypes.FLOAT({ decimals: 2 })
    },
    data: {
        type: DataTypes.VIRTUAL,
        /**
         * You need to load trackings before using data. If you're not sure use `await guild.fetchData()` instead
         */
        get() {
            if (!this.Trackings) {
                throw new Error("Trying to access guild.data but trackings are not loaded or don't exist");
            }
            return this.Trackings.sort((a, b)=>a.createdAt.getTime() - b.createdAt.getTime())[0].data;
        },
        set(val: GuildData) {
            this.level = val.level;
            this.createTracking({
                type: "guild",
                data: val
            })
        }
    }
};

export class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
    declare name: string;
    declare data: GuildData;
    declare level: number;
    declare Trackings?: NonAttribute<Tracking[]>;
    declare createTracking: HasManyCreateAssociationMixin<Tracking>;
    declare getTrackings: HasManyGetAssociationsMixin<Tracking>;

    /**
     * You can use guild.data instead if you're sure that trackings are loaded
     */
    async fetchData() {
        return (await this.getTrackings({
            limit: 1,
            order: [["createdAt", "DESC"]]
        }))[0].data as GuildData;
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

export function initModel() {
    Guild.init(initArgs, {
        sequelize: db,
        modelName: 'Guild',
    });
    console.log(`Initialized model ${Guild.name}`);
}