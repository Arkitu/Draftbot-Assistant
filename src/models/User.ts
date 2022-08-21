import { DataTypes, ModelAttributes, Sequelize, Optional } from 'sequelize';
import { transform as deflat, flatten } from "dottie";
import { Context } from '../libs/Context.js';
import { Table, Column, Model, HasMany, PrimaryKey, Unique } from 'sequelize-typescript';
import { Reminder } from './Reminder.js';
import { PropoReminder } from './PropoReminder.js';

@Table
class User extends Model {
    @Column({
        allowNull: false,
        validate: {
            len: [18,18],
            isInt: true
        }
    })
    @PrimaryKey
    @Unique
    discord_id: string

    @HasMany(()=>Reminder)
    tracking: Reminder[];

    @HasMany(()=>PropoReminder)
    on: PropoReminder[];
    @Column
    'config.reminders.auto_proposition.events': boolean;
    @Column
    'config.reminders.auto_proposition.minievents': boolean;
    @Column
    'config.reminders.auto_proposition.guilddaily': boolean;
    @Column
    'config.reminders.auto_proposition.daily': boolean;
    @Column
    'config.reminders.auto_proposition.petfeed': boolean;
    @Column
    'config.reminders.auto_proposition.petfree': boolean;
    @Column
    'config.reminders.auto_proposition.vote': boolean;
    @Column
    'config.reminders.auto_proposition.in_dm': boolean;

    @Column
    'config.tracking.reports': boolean;
    @Column
    'config.tracking.public': boolean;
    @Column
    'config.tracking.profile': boolean;
    
    @Column
    'config.goal.start': number;
    @Column
    'config.goal.end': number;
    @Column
    'config.goal.value': number;
    @Column
    'config.goal.unit': string;
    @Column
    'config.goal.init_value': number;
    @Column
    'config.goal.active': boolean;
}
/*
type User_opts = {
    config?: {
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
        },
        goal?: {
            start: number,
            end: number,
            value: number,
            unit: "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points",
            init_value: number,
            end_value: number,
            active: boolean
        }
    }}

export class User extends Model {
    @Column
    id: string;

    @Column
    'config.reminders.auto_proposition.events': boolean;
    @Column
    'config.reminders.auto_proposition.minievents': boolean;
    @Column
    'config.reminders.auto_proposition.guilddaily': boolean;
    @Column
    'config.reminders.auto_proposition.daily': boolean;
    @Column
    'config.reminders.auto_proposition.petfeed': boolean;
    @Column
    'config.reminders.auto_proposition.petfree': boolean;
    @Column
    'config.reminders.auto_proposition.vote': boolean;
    @Column
    'config.reminders.auto_proposition.in_dm': boolean;

    @Column
    'config.tracking.reports': boolean;
    @Column
    'config.tracking.public': boolean;
    @Column
    'config.tracking.profile': boolean;
    
    @Column
    'config.goal.start': number;
    @Column
    'config.goal.end': number;
    @Column
    'config.goal.value': number;
    @Column
    'config.goal.unit': string;
    @Column
    'config.goal.init_value': number;
    @Column
    'config.goal.active': boolean;

    constructor(opts: {
        ctx: Context,
        config?: {
            reminders?: {
                on?: {
                    [key: string]: {
                        duration: number,
                        unit: string,
                        in_dm: boolean
                    };
                },
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
            },
            goal?: {
                start: number,
                end: number,
                value: number,
                unit: "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points",
                init_value: number,
                end_value: number,
                active: boolean
            }
        }}) {
            // Ici il faut gérer ce qui ne va pas dans le super()

            let for_super = opts;
            delete for_super.config.reminders.on
            super(flatten(for_super) as User_opts)
        }

    get config() {
        return {
            reminders: {
                auto_proposition: {
                    events: this["config.reminders.auto_proposition.events"],
                    minievents: this["config.reminders.auto_proposition.minievents"],
                    guilddaily: this["config.reminders.auto_proposition.guilddaily"],
                    daily: this["config.reminders.auto_proposition.daily"],
                    petfeed: this["config.reminders.auto_proposition.petfeed"],
                    petfree: this["config.reminders.auto_proposition.petfree"],
                    vote: this["config.reminders.auto_proposition.vote"],
                    in_dm: this["config.reminders.auto_proposition.in_dm"]
                }
            },
            tracking: {
                reports: this["config.tracking.reports"],
                public: this["config.tracking.public"],
                profile: this["config.tracking.profile"]
            },
            goal: {
                start: this["config.goal.start"],
                end: this["config.goal.end"],
                value: this["config.goal.value"],
                unit: this["config.goal.unit"],
                init_value: this["config.goal.init_value"],
                active: this["config.goal.active"]
            }
        };
    }

    async getDiscordUser() {
        return await this.ctx.client.users.fetch(this.id)
    }
}

export const User_init_args: ModelAttributes = {
    id: {
        type: DataTypes.TEXT(),
        primaryKey: true
    },
    'config.reminders.auto_proposition.events': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.minievents': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.guilddaily': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.daily': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.petfeed': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.petfree': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.vote': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.reminders.auto_proposition.in_dm': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.tracking.reports': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.tracking.public': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.tracking.profile': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    'config.goal.start': DataTypes.INTEGER,
    'config.goal.end': DataTypes.INTEGER,
    'config.goal.value': DataTypes.INTEGER,
    'config.goal.unit': DataTypes.TEXT,
    'config.goal.init_value': DataTypes.INTEGER,
    'config.goal.active': {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ctx: {
        type: new DataTypes.VIRTUAL(DataTypes.),
        
    }
    discord_user: {
        type: DataTypes.VIRTUAL,
        get(this) {
            this.ctx
        },
    }
}

export async function define_user_model(sequelize: Sequelize) {
    const Reminder = sequelize.models.Reminder;
    
    sequelize.define("User", User_init_args)

    User.init(User_init_args, {sequelize});
    
    User.hasMany(Reminder);
}
*/