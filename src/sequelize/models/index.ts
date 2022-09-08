import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, Model, DataTypes, ModelCtor, ModelValidateOptions } from 'sequelize';
import { dirname, filename } from 'dirname-filename-esm';

const __dirname = dirname(import.meta);
const __filename = filename(import.meta);

export const snowflakeValidate: ModelValidateOptions = {
  len: [18,18],
  isInt: true
}

export interface ModelWithAssociate extends ModelCtor<Model<any, any>> {
  associate?: (db: Sequelize)=>void,
  name: string
}

export interface SequelizeWithAssociate extends Sequelize {
  readonly models: {
    [key: string]: ModelWithAssociate;
  };
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
    db.models[modelName].associate(db);
  }
});

module.exports = db;
