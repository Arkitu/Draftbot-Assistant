import { Client } from '../bot.js';
import { JsonDB } from 'node-json-db';
import { SequelizeWithModels } from '../sequelize/models/index.js';
import { Sequelize } from 'sequelize';

declare global {
    var client: Client;
    var config: JsonDB;
    var constants: JsonDB;
    var db: SequelizeWithModels;
    var botDir: URL;
    var botDirString: string;
}

export {};