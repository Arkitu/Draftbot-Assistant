import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, Model, DataTypes } from 'sequelize';
import { dirname, filename } from 'dirname-filename-esm';

const __dirname = dirname(import.meta);
const __filename = filename(import.meta);

export type DB = {
  [key: string]: ModelWithAssociate;
} & {
  sequelize?: Sequelize,
  Sequelize?: typeof Sequelize
};

interface ModelWithAssociate extends Model {
  associate: (db: DB)=>void,
  name: string
}

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = (await import(__dirname + '/../config/config.json'))[env];
const db: DB = {};

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(async file => {
    const model = (await import(path.join(__dirname, file)))(sequelize) as ModelWithAssociate
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
