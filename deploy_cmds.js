import { readdirSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

const config = new JsonDB(new Config("config", true, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));

const path = {
    admin: "./commands/admin",
    everyone: "./commands/everyone"
}
const commandFiles = {
    admin: readdirSync(path.admin).filter(file => file.endsWith(".js")),
    everyone: readdirSync(path.everyone).filter(file => file.endsWith(".js"))
};

(async () => {
    const rest = new REST({ version: "9" }).setToken(config.getData("/token"));

    console.log("Started refreshing application (/) commands.");
    
    await db.delete("/commands");

    let cmds = {
        admin: [],
        everyone: []
    }
    for (let file of commandFiles.admin) {
        cmds.admin.push(await (await import(path.admin + "/" + file)).data.toJSON());
    }
    for (let file of commandFiles.everyone) {
        cmds.everyone.push(await (await import(path.everyone + "/" + file)).data.toJSON());
    }

    console.debug(cmds);

    await rest.put(
        Routes.applicationCommands(config.getData("/app_id")),
        { body: cmds.everyone }
    );
    await rest.put(
        Routes.applicationGuildCommands(config.getData("/app_id"), config.getData("/admin_server_id")),
        { body: cmds.admin }
    );

    for (let cmd of cmds.admin) {
        cmd.perms = "admin";
    }
    for (let cmd of cmds.everyone) {
        cmd.perms = "everyone";
    }

    db.push("/commands", cmds.admin.concat(cmds.everyone));

    console.log("Finished refreshing application (/) commands.");
})();