import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

console.log("Updating database...");

const db = new JsonDB(new Config("db", true, true, '/'));
const constants = new JsonDB(new Config("constants", false, true, '/'));

/**
 * 
 * @param path - position in db of the thing to check 
 * @param model - the default model for the thing 
 */
function verifyEveryPropertyOn(dbPath, model) {
    const obj = db.getData(dbPath);
    for (const property of Object.keys(model)) {
        if (typeof(obj[property]) === "object") {
            verifyEveryPropertyOn(`${dbPath}/${property}`, model[property]);
        }
        if (!obj.hasOwnProperty(property)) {
            db.push(`${dbPath}/${property}`, model[property])
        }
    }
}

for (let user in db.getData("/users")) {
    verifyEveryPropertyOn(`/users/${user}`, constants.getData("/databaseDefault/user"));

    for (let event of db.getData(`/users/${user}/tracking`)) {
        if (event.type != "profile") continue;
        if (event.hasOwnProperty("vitality")) {
            db.push(`/users/${user}/tracking/${event.id}/energy`, event.vitality);
            db.delete(`/users/${user}/tracking/${event.id}/vitality`);
        }
        if (event.hasOwnProperty("max_vitality")) {
            db.push(`/users/${user}/tracking/${event.id}/max_energy`, event.max_vitality);
            db.delete(`/users/${user}/tracking/${event.id}/max_vitality`);
        }
        if (event.hasOwnProperty("strength")) {
            db.push(`/users/${user}/tracking/${event.id}/strenght`, event.strength);
            db.delete(`/users/${user}/tracking/${event.id}/strength`);
        }
        if (event.hasOwnProperty("ranking")) {
            db.push(`/users/${user}/tracking/${event.id}/rank`, event.ranking);
            db.delete(`/users/${user}/tracking/${event.id}/ranking`);
        }
    }
}

console.log("Done");