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
    if (!db.getData(`/users/${user}/config/tracking`).hasOwnProperty("profile")) {
        db.push(`/users/${user}/config/tracking/profile`, false);
    }
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
    if (!db.getData(`/users/${user}/config/reminders`).hasOwnProperty("events")) {
        db.push(`/users/${user}/config/reminders/events`, false);
    }
    if (!db.getData(`/users/${user}/config/reminders`).hasOwnProperty("minievents")) {
        db.push(`/users/${user}/config/reminders/minievents`, false);
    }
    if (!db.getData(`/users/${user}/config/reminders`).hasOwnProperty("in_dm")) {
        db.push(`/users/${user}/config/reminders/in_dm`, false);
    }
    for (const reminder of Object.keys(db.getData(`/users/${user}/config/reminders/on`))) {
        if (!db.getData(`/users/${user}/config/reminders/on/${reminder}`).hasOwnProperty("in_dm")) {
            db.push(`/users/${user}/config/reminders/on/${reminder}/in_dm`, false);
        }
    }
}

console.log("Done");