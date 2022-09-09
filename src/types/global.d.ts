import Context from '../libs/Context';
import { Client } from '../bot.js';
import { JsonDB } from 'node-json-db';
import { sequelizeModels } from '../models';
import { SequelizeWithAssociate } from '../sequelize/models';

declare global {
    var client: Client;
    var config: JsonDB;
    var constants: JsonDB;
    var db: SequelizeWithAssociate;
}

export {};