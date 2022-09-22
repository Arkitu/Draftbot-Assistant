import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyCreateAssociationMixin,
    NonAttribute
} from "sequelize";
import { User as DiscordUser } from "discord.js";
import { SequelizeWithAssociate } from ".";

interface Config {
    reminders: {
        auto_proposition: {
            events: boolean,
            minievents: boolean,
            guilddaily: boolean,
            daily: boolean,
            petfree: boolean,
            petfeed: boolean,
            vote: boolean,
            in_dm: boolean
        }
    },
    tracking: {
        reports: boolean,
        public: boolean,
        profile: boolean
    }
}

interface ConfigSetArgs {
    reminders?: {
        auto_proposition?: {
            events?: boolean,
            minievents?: boolean,
            guilddaily?: boolean,
            daily?: boolean,
            petfree?: boolean,
            petfeed?: boolean,
            vote?: boolean,
            in_dm?: boolean
        }
    },
    tracking?: {
        reports?: boolean,
        public?: boolean,
        profile?: boolean
    }
}

export const initArgs: ModelAttributes<User, Optional<InferAttributes<User>, never>> = {
    discordId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    stringifiedConfig: DataTypes.TEXT("long")
};

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare discordId: string;
    declare stringifiedConfig: string;

    get config(): NonAttribute<Config> {
        return JSON.parse(this.stringifiedConfig) as Config;
    }
    set config(val: ConfigSetArgs) {
        this.stringifiedConfig = JSON.stringify({...this.config, ...val});
    }

    get discordUser(): NonAttribute<DiscordUser> {
        return client.users.cache.get(this.discordId);
    }

    /**
     * You need to fetch the user before using user.discordUser
     */
    fetchDiscordUser() {
        return client.users.fetch(this.discordId);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db: SequelizeWithAssociate) {
        this.hasMany(db.models.Reminder);
        this.hasMany(db.models.Tracking);
        this.belongsTo(db.models.Guild);
    }
}

export default () => {


    User.init(initArgs, {
        sequelize: db,
        modelName: 'User',
    });

    return User;
};