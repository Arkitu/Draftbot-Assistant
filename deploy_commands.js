import { readdirSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

const config = new JsonDB(new Config("config", true, true, '/'));
var data_for_db = [];

const admin_path = "./commands/admin";
const everyone_path = "./commands/everyone";
const commandFiles = {
	admin: readdirSync(admin_path).filter(file => file.endsWith(".js")),
	everyone: readdirSync(everyone_path).filter(file => file.endsWith(".js"))
};

function get_admin_cmds() {
	return new Promise(resolve => {
		let returned = false;
		let cmds = [];
		for (const file of commandFiles.admin) {
			import(`${admin_path}/${file}`)
				.then(async (cmd) => {
					cmds.push(await cmd.data.toJSON());
					data_for_db.push(await cmd.data.toJSON());
					data_for_db[data_for_db.length-1].perms = "admin";
				})
				.then(() => {
					if (cmds.length >= commandFiles.admin.length && !returned) {
						resolve(cmds);
						returned = true;
					}
				});
		}
	})
}
function get_everyone_cmds() {
	return new Promise(resolve => {
		let returned = false;
		let cmds = [];
		for (const file of commandFiles.everyone) {
			import(`${everyone_path}/${file}`)
				.then(async (cmd) => {
					cmds.push(await cmd.data.toJSON());
					data_for_db.push(await cmd.data.toJSON());
					data_for_db[data_for_db.length-1].perms = "everyone";
				})
				.then(() => {
					if (cmds.length >= commandFiles.everyone.length && !returned) {
						resolve(cmds);
						returned = true;
					}
				});
		}
	})
}

(async () => {
	const rest = new REST({ version: "9" }).setToken(config.getData("/token"));

	switch (process.argv[2]) {
		case "admin" :
			console.log("Started refreshing admin (/) commands.");
			await rest.put(
				Routes.applicationGuildCommands(config.getData("/app_id"), config.getData("/admin_server_id")),
				{ body: await get_admin_cmds() }
			);
			console.log("Successfully reloaded admin (/) commands.");
			break;
		case "everyone" :
			console.log("Started refreshing everyone (/) commands.");
			await rest.put(
				Routes.applicationCommands(config.getData("/app_id")),
				{ body: await get_everyone_cmds() }
			);
			console.log("Successfully reloaded everyone (/) commands.");
			break;
		default :
			console.log("Started refreshing application (/) commands.");
			await rest.put(
				Routes.applicationCommands(config.getData("/app_id")),
				{ body: await get_everyone_cmds() }
			);
			console.log("Successfully reloaded everyone (/) commands.");
			await rest.put(
				Routes.applicationGuildCommands(config.getData("/app_id"), config.getData("/admin_server_id")),
				{ body: await get_admin_cmds() }
			);
			console.log("Successfully reloaded admin (/) commands.");
			break;
	}
})();