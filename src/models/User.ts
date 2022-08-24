import { transform as deflat, flatten } from "dottie";
import { Context } from '../libs/Context.js';
import { Table, Column, Model, HasMany, PrimaryKey, Unique, DataType, BelongsTo } from 'sequelize-typescript';
import { User as DiscordUser } from 'discord.js';
import { Reminder, PropoReminder, Tracking } from '.';
import { Guild } from ".";

interface Config {
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
        },
        on?: PropoReminder[]
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
}



interface ConfigSetArgs extends Config {
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
    }
}

@Table
export default class User extends Model {
    // Saved in database
    @Column({
        allowNull: false,
        validate: {
            len: [18,18],
            isInt: true
        }
    })
    @PrimaryKey
    @Unique
    discord_id: string;

    @HasMany(()=>Reminder)
    reminders: Reminder[];

    @HasMany(()=>Tracking)
    trackings: Tracking[];

    @BelongsTo(()=>Guild)
    guild: Guild;

    // config
    @HasMany(() => PropoReminder)
    private 'config.reminders.on': PropoReminder[];

    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.events': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.minievents': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.guilddaily': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.daily': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.petfeed': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.petfree': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.vote': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.reminders.auto_proposition.in_dm': boolean;

    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.tracking.reports': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.tracking.public': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.tracking.profile': boolean;

    @Column
    private 'config.goal.start': number;
    @Column
    private 'config.goal.end': number;
    @Column
    private 'config.goal.value': number;
    @Column
    private 'config.goal.unit': "lvl" | "gold" | "pv" | "xp" | "gems" | "quest_missions_percentage" | "rank_points";
    @Column
    private 'config.goal.init_value': number;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    private 'config.goal.active': boolean;

    // Not saved in database
    // context
    @Column({
        type: DataType.VIRTUAL,
        allowNull: false
    })
    ctx: Context;

    // object config linked to flatten config properties
    @Column(DataType.VIRTUAL)
    get config(): Config {
        return deflat(this.toJSON())["config"]
    }
    set config(value: ConfigSetArgs) {
        this.set(flatten(value))
    }

    // discord user (/!\ dont use it, use getDiscordUser instead)
    @Column(DataType.VIRTUAL)
    private discordUser: DiscordUser | undefined = undefined;

    async getDiscordUser() {
        if (this.discordUser) return this.discordUser;
        return await this.ctx.client.users.fetch(this.discord_id);
    }
}