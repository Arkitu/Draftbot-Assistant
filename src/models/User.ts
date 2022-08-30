import * as dottie from "dottie"
const { transform: deflat, flatten } = dottie;
import { Table, Column, Model, HasMany, PrimaryKey, Unique, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User as DiscordUser } from 'discord.js';
import { Reminder, PropoReminder, Tracking, Guild, Goal } from './index.js';

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

@Table
export default class User extends Model {
    // Saved in database
    @Column({
        allowNull: false,
        validate: {
            len: [18,18],
            isInt: true
        },
        primaryKey: true
    })
    discordId: string;

    @HasMany(()=>Reminder)
    reminders: ReturnType<() => Reminder>[];

    @HasMany(()=>Tracking)
    trackings: ReturnType<() => Tracking>[];

    @HasMany(()=>Goal)
    goals: ReturnType<() => Goal>[];

    @BelongsTo(()=>Guild)
    guild: ReturnType<() => Guild>;

    @ForeignKey(()=>Guild)
    guildId: number;

    // config
    @HasMany(() => PropoReminder)
    propoReminders: ReturnType<() => PropoReminder>[];

    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.events': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.minievents': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.guilddaily': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.daily': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.petfeed': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.petfree': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.vote': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.reminders.auto_proposition.in_dm': boolean;

    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.tracking.reports': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.tracking.public': boolean;
    @Column({
        allowNull: false,
        defaultValue: false
    })
    'config.tracking.profile': boolean;

    // Not saved in database

    /**
     * Object config linked to flatten config properties
     */
    @Column(DataType.VIRTUAL)
    get config(): Config {
        return deflat(this.toJSON())["config"]
    }
    set config(value: ConfigSetArgs) {
        this.set(flatten(value))
    }

    /**
     * Verify that user is in cache before using this property.
     * If you're not sure, use `fetchDiscordUser()` instead.
     */
    @Column(DataType.VIRTUAL)
    get discordUser(): DiscordUser {
        return client.users.cache.get(this.discordId);
    }

    /**
     * Fetch DiscordUser by id. If user is already in cache, you can use `discordUser` instead.
     */
    async fetchDiscordUser(): Promise<DiscordUser> {
        return await client.users.fetch(this.discordId);
    }
}