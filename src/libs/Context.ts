import * as Discord from 'discord.js';
import { JsonDB } from 'node-json-db';

export class Context {
    client: Discord.Client | null;
    db: JsonDB | null;
    config: JsonDB | null;
    interaction: Discord.CommandInteraction | null;
    message: Discord.Message | null;
    constants: JsonDB | null;

    constructor (opts: {
        client?: Discord.Client | null,
        db?: JsonDB | null,
        config?: JsonDB | null,
        constants?: JsonDB | null,
        interaction?: Discord.CommandInteraction | null,
        message?: Discord.Message | null
    } = {}) {
        this.client = opts.client || null;
        this.db = opts.db || null;
        this.config = opts.config || null;
        this.interaction = opts.interaction || null;
        this.message = opts.message || null;
        this.constants = opts.constants || null;
    }

    clone (opts: {
        client?: Discord.Client | null,
        db?: JsonDB | null,
        config?: JsonDB | null,
        constants?: JsonDB | null,
        interaction?: Discord.CommandInteraction | null,
        message?: Discord.Message | null
    } = {}) {
        return new Context({
            client: opts.client || this.client,
            db: opts.db || this.db,
            config: opts.config || this.config,
            constants: opts.constants || this.constants,
            interaction: opts.interaction || this.interaction,
            message: opts.message || this.message
        });
    }
}