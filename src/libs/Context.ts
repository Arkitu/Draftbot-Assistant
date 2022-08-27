import * as Discord from 'discord.js';
import { JsonDB } from 'node-json-db';
import { Sequelize } from 'sequelize-typescript';
import { models } from '../models';

export default class Context {
    client: Discord.Client | null;
    db: JsonDB | null;
    config: JsonDB | null;
    interaction: Discord.CommandInteraction | null;
    message: Discord.Message | null;
    constants: JsonDB | null;
    sequelize: Sequelize | null;
    models: typeof models | null;

    constructor (opts: {
        client?: Discord.Client | null,
        db?: JsonDB | null,
        config?: JsonDB | null,
        constants?: JsonDB | null,
        interaction?: Discord.CommandInteraction | null,
        message?: Discord.Message | null,
        sequelize?: Sequelize | null,
        models?: typeof models | null
    } = {}) {
        this.client = opts.client || null;
        this.db = opts.db || null;
        this.config = opts.config || null;
        this.interaction = opts.interaction || null;
        this.message = opts.message || null;
        this.constants = opts.constants || null;
        this.sequelize = opts.sequelize || null;
        this.models = opts.models || null;
    }

    clone (opts: {
        client?: Discord.Client | null,
        db?: JsonDB | null,
        config?: JsonDB | null,
        constants?: JsonDB | null,
        interaction?: Discord.CommandInteraction | null,
        message?: Discord.Message | null,
        sequelize?: Sequelize | null,
        models?: typeof models | null
    } = {}) {
        return new Context({
            client: opts.client || this.client,
            db: opts.db || this.db,
            config: opts.config || this.config,
            constants: opts.constants || this.constants,
            interaction: opts.interaction || this.interaction,
            message: opts.message || this.message,
            sequelize: opts.sequelize || this.sequelize,
            models: opts.models || this.models
        });
    }
}