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
import { ModelWithAssociate } from ".";
import { GuildData, Tracking } from "./tracking";

export const initArgs: ModelAttributes<Guild, Optional<InferAttributes<Guild>, never>> = {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    description: DataTypes.STRING,
    data: {
        type: DataTypes.VIRTUAL,
        /**
         * You need to load trackings before using data. If you're not sure use `await guild.fetchData()` instead
         */
        get() {
            if (!this.trackings) {
                throw new Error("Trying to access guild.data but trackings are not loaded or don't exist");
            }
            return this.trackings.sort((a, b)=>a.createdAt - b.createdAt)[0].data;
        }
    }
};

export class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
    declare name: string;
    declare description: string;
    declare data: GuildData;
    declare trackings?: NonAttribute<Tracking[]>;
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

export default () => {
    Guild.init(initArgs, {
        sequelize: db,
        modelName: 'Guild',
    });

    return Guild as ModelWithAssociate;
};