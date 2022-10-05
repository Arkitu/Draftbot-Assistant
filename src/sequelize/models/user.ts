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
import { PropoReminder } from "./proporeminder.js";
import { Reminder } from "./reminder.js";
import { Tracking } from "./tracking.js";
import { Goal } from "./goal.js";
import pkg from "dottie";

interface Dottie {
    transform: (obj: any)=>any,
    flatten: (obj: any)=>any
}

const dottie = pkg as unknown as Dottie;

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
        type: DataTypes.TEXT,
        primaryKey: true
    },
    name: {
        type: DataTypes.TEXT
    },
    stringifiedConfig: {
        type: DataTypes.TEXT,
        defaultValue: "{}"
    },
    config: {
        type: DataTypes.VIRTUAL,
        get() {
            //console.debug({...DEFAULT_CONFIG, ...(JSON.parse(this.stringifiedConfig) as Config)})
            return {...DEFAULT_CONFIG, ...(JSON.parse(this.stringifiedConfig) as Config)};
        },
        set(val: ConfigSetArgs) {
            this.stringifiedConfig = JSON.stringify({...this.config, ...val});
        }
    }
};

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare discordId: string;
    declare name: string;
    declare stringifiedConfig: string;
    declare config: Config | ConfigSetArgs;
    declare Trackings: NonAttribute<Tracking[]>;
    declare Goals: NonAttribute<Goal[]>;
    declare PropoReminders: NonAttribute<PropoReminder[]>;
    declare getPropoReminders: HasManyGetAssociationsMixin<PropoReminder>;
    declare createPropoReminder: HasManyCreateAssociationMixin<PropoReminder>;
    declare createReminder: HasManyCreateAssociationMixin<Reminder>;
    declare countReminders: HasManyCountAssociationsMixin;
    declare createTracking: HasManyCreateAssociationMixin<Tracking>;
    declare getTrackings: HasManyGetAssociationsMixin<Tracking>;
    declare createGoal: HasManyCreateAssociationMixin<Goal>;
    declare countGoals: HasManyCountAssociationsMixin;

    /**
     * You need to fetch the user before using user.discordUser. If you're not sure, use `await fetchDiscordUser()` instead 
     */
    get discordUser(): NonAttribute<DiscordUser> {
        return client.users.cache.get(this.discordId);
    }

    /**
     * Use this method to set config. If you use config directly, it won't be saved.
     */
    setConfig(val: ConfigSetArgs) {
        console.debug(dottie)
        const flatVal = dottie.flatten(val);
        const flatConfig = dottie.flatten(this.config);
        const flatNewConfig = {...flatConfig, ...flatVal};
        this.config = dottie.transform(flatNewConfig);
    }

    /**
     * You need to fetch the user before using user.discordUser
     */
    fetchDiscordUser() {
        return client.users.fetch(this.discordId);
    }

    async init() {
        this.name = (await this.fetchDiscordUser()).username;
        if(!this.stringifiedConfig) {
            this.stringifiedConfig = JSON.stringify(DEFAULT_CONFIG);
        }
        await this.save();
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
        this.hasMany(db.models.Reminder);
        this.hasMany(db.models.PropoReminder);
        this.hasMany(db.models.Tracking);
        this.hasMany(db.models.Goal);
        this.belongsTo(db.models.Guild);
    }
}

export function initModel() {
    User.init(initArgs, {
        sequelize: db,
        modelName: 'User',
        hooks: {
            afterCreate: (user) => {
                user.init();
            }
        }
    });
}