import * as path from 'path';
import { Sequelize, Model, ModelValidateOptions, ModelStatic } from 'sequelize';
import { dirname, filename } from 'dirname-filename-esm';
import { User, initModel as initUser } from './user.js';
import { Reminder, initModel as initReminder } from './reminder.js';
import { Tracking, initModel as initTracking } from './tracking.js';
import { PropoReminder, initModel as initPropoReminder } from './proporeminder.js';
import { Guild, initModel as initGuild } from './guild.js';
import { Goal, initModel as initGoal } from './goal.js';

const __dirname = dirname(import.meta);
const __filename = filename(import.meta);

global.botDir = new URL(import.meta.url);
global.botDirString = (()=>{
	let urlArray = decodeURI(botDir.pathname).split("/");
	urlArray.pop();
	return urlArray.join("/");
})();

export const snowflakeValidate: ModelValidateOptions = {
    len: [18, 18],
    isInt: true
}

export interface ModelWithAssociate<M extends Model<any, any> = Model<any, any>> extends ModelStatic<M> {
    associate?: () => void
}

export interface Models {
    User?: ModelStatic<User>,
    Reminder?: ModelStatic<Reminder>,
    Tracking?: ModelStatic<Tracking>,
    PropoReminder?: ModelStatic<PropoReminder>,
    Guild?: ModelStatic<Guild>,
    Goal?: ModelStatic<Goal>
    [key: string]: ModelStatic<Model<any, any>>
}

export interface SequelizeWithModels extends Sequelize {
    readonly models: Models;
}

const basename = path.basename(__filename);

global.db = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, "../../..", "db.sqlite"),
    logging: false
});

initTracking();
initPropoReminder();
initUser();
initReminder();
initGuild();
initGoal();

for (let model of Object.values(db.models)) {
    if ("associate" in model) {
        console.debug(`Associating model ${(model as ModelWithAssociate).name}`);
        (model as ModelWithAssociate).associate();
    }
}

// Sync the db
await db.sync();

console.debug("Database synced");

export default db;