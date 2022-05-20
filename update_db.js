import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

console.log("Updating database...");

const db = new JsonDB(new Config("db", true, true, '/'));

for (let user in db.getData("/users")) {
    if (!db.getData(`/users/${user}`).hasOwnProperty("tracking")) {
        db.push(`/users/${user}/tracking`, []);
    }
    if (!db.getData(`/users/${user}/config/tracking`).hasOwnProperty("public")) {
        db.push(`/users/${user}/config/tracking/public`, false);
    }
}

console.log("Done");