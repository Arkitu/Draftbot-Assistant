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
import { Models } from "./index.js";

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
    id: {
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
    declare id: string;
    declare name: string;
    declare stringifiedConfig: string;
    declare config: Config | ConfigSetArgs;
    declare Trackings: NonAttribute<Tracking[]>;
    declare Goals: NonAttribute<Goal[]>;
    declare PropoReminders: NonAttribute<PropoReminder[]>;

    $createPropoReminder(...opts: Parameters<HasManyCreateAssociationMixin<PropoReminder>>) {
        const args = opts[0];
        return db.models.PropoReminder.create({UserId: this.id, ...args});
    }

    $getPropoReminders(...opts: Parameters<HasManyGetAssociationsMixin<PropoReminder>>) {
        const args = opts[0];
        return db.models.PropoReminder.findAll({...args, where: {UserId: this.id, ...args.where}});
    }

    $destroyPropoReminders(...opts: Parameters<Models["PropoReminder"]["destroy"]>) {
        const args = opts[0];
        return db.models.PropoReminder.destroy({...args, where: {UserId: this.id, ...args.where}});
    }

    $createReminder(...opts: Parameters<HasManyCreateAssociationMixin<Reminder>>) {
        const args = opts[0];
        return db.models.Reminder.create({UserId: this.id, ...args});
    }

    $countReminders(...opts: Parameters<HasManyCountAssociationsMixin>) {
        const args = opts[0];
        return db.models.Reminder.count({...args, where: {UserId: this.id, ...args.where}});
    }

    $createTracking(...opts: Parameters<HasManyCreateAssociationMixin<Tracking>>) {
        const args = opts[0];
        return db.models.Tracking.create({UserId: this.id, ...args});
    }

    $destroyTrackings(...opts: Parameters<Models["Tracking"]["destroy"]>) {
        const args = opts[0];
        return db.models.Tracking.destroy({...args, where: {UserId: this.id, ...args.where}});
    }

    $getTrackings(...opts: Parameters<HasManyGetAssociationsMixin<Tracking>>) {
        const args = opts[0];
        return db.models.Tracking.findAll({...args, where: {UserId: this.id, ...args.where}});
    }

    $createGoal(...opts: Parameters<HasManyCreateAssociationMixin<Goal>>) {
        const args = opts[0];
        return db.models.Goal.create({UserId: this.id, ...args});
    }

    $countGoals(...opts: Parameters<HasManyCountAssociationsMixin>) {
        const args = opts[0];
        return db.models.Reminder.count({...args, where: {UserId: this.id, ...args.where}});
    }

    /**
     * You need to fetch the user before using user.discordUser. If you're not sure, use `await fetchDiscordUser()` instead 
     */
    get discordUser(): NonAttribute<DiscordUser> {
        return client.users.cache.get(this.id);
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
        return client.users.fetch(this.id);
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