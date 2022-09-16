import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, Model, DataTypes, ModelCtor, ModelValidateOptions } from 'sequelize';
import { dirname, filename } from 'dirname-filename-esm';
import { User } from './user.js';
import { Reminder } from './reminder.js';
import { Tracking } from './tracking.js';
import { PropoReminder } from './proporeminder.js';
import { Guild } from './guild.js';

const __dirname = dirname(import.meta);
const __filename = filename(import.meta);

export const snowflakeValidate: ModelValidateOptions = {
  len: [18,18],
  isInt: true
}

export interface ModelWithAssociate<M extends Model<any, any> = Model<any, any>> extends ModelCtor<M> {
  associate?: ()=>void
}

export interface Models {
  User?: ModelWithAssociate<User>,
  Reminder?: ModelWithAssociate<Reminder>,
  Tracking?: ModelWithAssociate<Tracking>,
  PropoReminder?: ModelWithAssociate<PropoReminder>,
  Guild?: ModelWithAssociate<Guild>,
  [key:string]: ModelWithAssociate
}

export interface SequelizeWithAssociate extends Sequelize {
  readonly models: Models;
}

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = (await import(__dirname + '/../config/config.json'))[env];

let db: SequelizeWithAssociate;



if (config.use_env_variable) {
  db = new Sequelize(process.env[config.use_env_variable], config)
} else {
  db = new Sequelize(config.database, config.username, config.password, config)
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(async file => {
    (await import(path.join(__dirname, file)))(db)
  });

Object.keys(db.models).forEach(modelName => {
  if ("associate" in db.models[modelName]) {
    db.models[modelName].associate();
  }
});

module.exports = db;
