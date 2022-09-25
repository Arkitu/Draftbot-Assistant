import {
    DataTypes,
    Model,
    ModelAttributes,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyCreateAssociationMixin,
    NonAttribute,
    HasManyGetAssociationsMixin,
    HasManyCountAssociationsMixin
} from "sequelize";
import { User as DiscordUser } from "discord.js";
import { SequelizeWithAssociate } from ".";
import { PropoReminder } from "./proporeminder";
import { Reminder } from "./reminder";
import { Tracking } from "./tracking";
import { Goal } from "./goal";

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

const DEFAULT_CONFIG: Config = {
    reminders: {
        auto_proposition: {
            events: false,
            minievents: false,
            guilddaily: false,
            daily: false,
            petfree: false,
            petfeed: false,
            vote: false,
            in_dm: false
        }
    },
    tracking: {
        reports: false,
        public: false,
        profile: false
    }
}

export const initArgs: ModelAttributes<User, Optional<InferAttributes<User>, never>> = {
    discordId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    stringifiedConfig: DataTypes.TEXT("long")
};

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare discordId: string;
    declare name: string;
    declare stringifiedConfig: string;
    declare trackings: NonAttribute<Tracking[]>;
    declare goals: NonAttribute<Goal[]>;
    declare propoReminders: NonAttribute<PropoReminder[]>;
    declare getPropoReminder: HasManyGetAssociationsMixin<PropoReminder>;
    declare createPropoReminder: HasManyCreateAssociationMixin<PropoReminder>;
    declare createReminder: HasManyCreateAssociationMixin<Reminder>;
    declare countReminders: HasManyCountAssociationsMixin;
    declare createTracking: HasManyCreateAssociationMixin<Tracking>;
    declare getTrackings: HasManyGetAssociationsMixin<Tracking>;
    declare createGoal: HasManyCreateAssociationMixin<Goal>;
    declare countGoals: HasManyCountAssociationsMixin;

    get config(): NonAttribute<Config> {
        if (!this.stringifiedConfig) {
            this.config = DEFAULT_CONFIG;
        }
        return JSON.parse(this.stringifiedConfig) as Config;
    }
    set config(val: ConfigSetArgs) {
        this.stringifiedConfig = JSON.stringify({...this.config, ...val});
    }

    /**
     * You need to fetch the user before using user.discordUser. If you're not sure, use `await fetchDiscordUser()` instead 
     */
    get discordUser(): NonAttribute<DiscordUser> {
        return client.users.cache.get(this.discordId);
    }

    /**
     * You need to fetch the user before using user.discordUser
     */
    fetchDiscordUser() {
        return client.users.fetch(this.discordId);
    }

    async updateName() {
        this.name = (await this.fetchDiscordUser()).username;
        return this.name;
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db: SequelizeWithAssociate) {
        this.hasMany(db.models.Reminder);
        this.hasMany(db.models.PropoReminder);
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