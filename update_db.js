import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

console.log("Updating database...");

const db = new JsonDB(new Config("db", true, true, '/'));

for (let user in db.getData("/users")) {
    if (db.getData(`/users/${user}`) == {"config": {"reminders": {"on": {}}}}) {
        db.delete(`/users/${user}`);
    } else {
        db.push(`/users/${user}/config/tracking/reports`, true);
    }
}

console.log("Done");