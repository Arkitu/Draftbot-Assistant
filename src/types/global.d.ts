import Context from '../libs/Context';
import { Client } from '../bot.js';
import { JsonDB } from 'node-json-db';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeModels } from '../models';

declare global {
    var client: Client;
    var config: JsonDB;
    var constants: JsonDB;
    var sequelize: Sequelize;
    var models: typeof sequelizeModels;
}

export {};