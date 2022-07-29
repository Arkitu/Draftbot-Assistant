import * as Discord from 'discord.js';
import { JsonDB } from 'node-json-db';

export class Context {
    haveClient: boolean;
    haveDb: boolean;
    haveConfig: boolean;
    haveInteraction: boolean;
    haveMessage: boolean;
    haveConstants: boolean;

    Iclient: Discord.Client;
    Idb: JsonDB;
    Iconfig: JsonDB;
    Iinteraction: Discord.CommandInteraction;
    Imessage: Discord.Message;
    Iconstants: JsonDB;

    constructor (opts: { client?: Discord.Client, db?: JsonDB, config?: JsonDB, constants?: JsonDB, interaction?: Discord.CommandInteraction, message?: Discord.Message } = {}) {
        this.setClient(opts.client)
            .setDb(opts.db)
            .setConfig(opts.config)
            .setInteraction(opts.interaction)
            .setMessage(opts.message);
    }

    get client () {
        if (!this.haveClient) {
            throw new Error("client not in context")
        }
        return this.Iclient;
    }

    get db () {
        if (!this.haveDb) {
            throw new Error("db not in context")
        }
        return this.Idb;
    }

    get config () {
        if (!this.haveConfig) {
            throw new Error("config not in context")
        }
        return this.Iconfig;
    }

    get interaction () {
        if (!this.haveInteraction) {
            throw new Error("interaction not in context")
        }
        return this.Iinteraction;
    }

    get message () {
        if (!this.haveMessage) {
            throw new Error("message not in context")
        }
        return this.Imessage;
    }

    get constants () {
        if (!this.haveConstants) {
            throw new Error("message not in context")
        }
        return this.Iconstants;
    }

    set client (c) {
        this.Iclient = c;
    }

    set db (d) {
        this.Idb = d;
    }

    set config (c) {
        this.Iconfig = c;
    }

    set interaction (i) {
        this.Iinteraction = i;
    }

    set message (m) {
        this.Imessage = m;
    }

    set constants (c) {
        this.Iconstants = c;
    }

    setClient (client: Discord.Client) {
        this.client = client;
        this.haveClient = !!client;
        return this;
    }

    setDb (db: JsonDB) {
        this.db = db;
        this.haveDb = !!db;
        return this;
    }

    setConfig (config: JsonDB) {
        this.config = config;
        this.haveConfig = !!config;
        return this;
    }

    setInteraction (interaction: Discord.CommandInteraction) {
        this.interaction = interaction;
        this.haveInteraction = !!interaction;
        return this;
    }

    setMessage (message: Discord.Message) {
        this.message = message;
        this.haveMessage = !!message;
        return this;
    }

    setConstants (constants: JsonDB) {
        this.constants = constants;
        this.haveConstants = !!constants;
        return this;
    }

    clone () {
        let opts: {
            client?: Discord.Client,
            db?: JsonDB,
            config?: JsonDB,
            constants?: JsonDB,
            interaction?: Discord.CommandInteraction,
            message?: Discord.Message
        } = {};
        if (this.haveClient) opts.client = this.client;
        if (this.haveDb) opts.db = this.db;
        if (this.haveConfig) opts.config = this.config;
        if (this.haveInteraction) opts.interaction = this.interaction;
        if (this.haveMessage) opts.message = this.message;
        return new Context(opts);
    }
}