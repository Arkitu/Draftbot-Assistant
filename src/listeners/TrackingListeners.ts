import { Message, MessageEmbed } from "discord.js";
import { GoalUnitTranslate } from '../sequelize/models/goal.js';
import { LongReportData, PartialGuildData, ProfileData } from '../sequelize/models/tracking.js';
import { LogUtils } from "../Utils.js";

export class TrackingListeners {
	static async fetchGuild(msg: Message) {
		if (msg.interaction.commandName !== "guild") return;
	
		const guild = (await db.models.Guild.findOrCreate({
			where: {
				name: msg.embeds[0].title.substring(7)
			},
			include: [db.models.Tracking]
		}))[0];
	
		let guildData: PartialGuildData = {
			type: "guild",
			max_xp: parseInt((msg.embeds[0].fields[1].name.split(" "))[1]),
			xp: parseInt((msg.embeds[0].fields[1].name.split(" "))[3]),
			level: parseInt((msg.embeds[0].fields[1].name.split(" "))[6]),
			description: "",
		};
	
		if (isNaN(guildData.level)) guildData.level = 100;
		if (msg.embeds[0].description) {
			guildData.description = msg.embeds[0].description.split("`")[1];
		}
	
		await guild.$createTracking({
			type: "guild",
			data: guildData
		});
	
		LogUtils.log(`Guild ${guild.name} fetched. Level: ${(await guild.fetchData()).full_level}`);
	}
	
	static async event(msg: Message) {
		if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(msg.content))) return;
	
		const user = await db.models.User.findByPk(msg.content.split("<@")[1].split(">")[0])
		if (!user) return;
		if (!user.config.tracking.reports) return;
	
		// Training message : :newspaper: ** Journal de @Arkitu  :** :medal: Points gagnés : ** 358** | :moneybag: Argent gagné : ** 24** | :star: XP gagné : ** 25** | :clock10: Temps perdu : ** 45 Min ** | ⛓️ Vous grimpez jusqu'en haut des échafaudages, mais à l'exception d'un magnifique paysage, vous ne trouvez rien. Après avoir passé quelques minutes à l'admirer, vous repartez.
		const data: LongReportData = {
			type: "long_report",
			points: 0,
			gold: 0,
			xp: 0,
			time: 0,
			pv: 0,
			id: `long_report${msg.createdTimestamp}`
		};
		for (let e of msg.content.split(":") // str -> array
			.slice(3) // array
			.join(":") // array -> str
			.slice(3) // str
			.split(" | ") // str -> array
			.slice(0, -1) // array
		) {
			let modif = {
				name: e.split("**").slice(0, 2)[0].slice(0, -3),
				value: e.split("**").slice(0, 2)[1].slice(1)
			}
			switch (modif.name) {
				case "🏅 Points gagnés" :
					data.points += parseInt(modif.value);
					break;
				case "💰 Argent gagné" :
					data.gold += parseInt(modif.value);
					break;
				case "💸 Argent perdu" :
					data.gold -= parseInt(modif.value);
					break;
				case "⭐ XP gagné" :
					data.xp += parseInt(modif.value);
					break;
				case "❤️ Vie gagnée" :
					data.pv += parseInt(modif.value);
					break;
				case "💔 Vie perdue" :
					data.pv -= parseInt(modif.value);
					break;
				case "🕙 Temps perdu" :
					data.time = 0;
					let time_array = modif.value.split(" ");
					while (time_array.length > 1) {
						switch (time_array[1]) {
							case "H" :
								data.time += parseInt(time_array[0]) * 3600000;
								break;
							case "Min" :
								data.time += parseInt(time_array[0]) * 60000;
								break;
						}
						time_array.splice(0, 2);
					}
					break;
			}
		}
	
		user.$createTracking({
			type: "long_report",
			data: data
		})
	
		LogUtils.log("Long repport tracked");
	}

	static async miniEvent(msg: Message): Promise<void> {
		if (!msg.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
	
		const user = await db.models.User.findByPk(msg.interaction.user.id)
		if (!user) return;
		if (!user.config.tracking.reports) return;
	
		user.$createTracking({
			type: "short_report"
		});
	
		LogUtils.log("Short repport tracked");
	}
	
	static async profile(msg: Message): Promise<void> {
		if (msg.interaction.commandName !== "profile") return;

		if (msg.interaction.user.username !== msg.embeds[0].title.split(" | ")[1]) return;
	
		const user = await db.models.User.findByPk(msg.interaction.user.id, {include:[db.models.Goal]})
		if (!user) return;
		if (!user.config.tracking.profile) return;
	
		let embed = msg.embeds[0];
	
		let splited_embed = {
			title: embed.title.split(" | "),
			fields: embed.fields.map(f => {
				return f.value.split(" | ").map(e => {
					return {
						full: e,
						emoji: e.split(":")[1],
						value: (() => {
							if (!e.split(":")[2]) return undefined;
							let v: string = e.split(":")[2].slice(1)
							return v;
						})()
					}
				})
			})
		}
	
		let data: ProfileData = {
			type: "profile",
			lvl: parseInt(splited_embed.title[2].split(" ")[1]),
			pv: parseInt(splited_embed.fields[0][0].value.split("/")[0]),
			max_pv: parseInt(splited_embed.fields[0][0].value.split("/")[1]),
			xp: parseInt(splited_embed.fields[0][1].value.split("/")[0]),
			max_xp: parseInt(splited_embed.fields[0][1].value.split("/")[1]),
			gold: parseInt(splited_embed.fields[0][2].value),
			energy: parseInt(splited_embed.fields[1][0].value.split("/")[0]),
			max_energy: parseInt(splited_embed.fields[1][0].value.split("/")[1]),
			strenght: parseInt(splited_embed.fields[1][1].value),
			defense: parseInt(splited_embed.fields[1][2].value),
			speed: parseInt(splited_embed.fields[1][3].value),
			gems: parseInt(splited_embed.fields[2][0].value),
			quest_missions_percentage: parseInt(splited_embed.fields[2][1].value),
			rank: parseInt(splited_embed.fields[3][0].value.split("/")[0]),
			rank_points: parseInt(splited_embed.fields[3][1].value),
			class: {
				name: splited_embed.fields[4][0].value,
				emoji: `:${splited_embed.fields[4][0].emoji}:`,
			},
			guild_name: embed.fields[5].name === "Guilde :" ? splited_embed.fields[5][0].value : null,
			//Bot crashed if the user didn't have a guild while using the command
			destination: splited_embed.fields[splited_embed.fields.length - 1][0].full
		}
	
		user.$createTracking({
			type: "profile",
			data: data
		});
	
		for (let goal of user.Goals) {
			if (goal.end < msg.createdTimestamp) {
				await msg.channel.send({ embeds: [
					new MessageEmbed()
						.setColor(config.getData("/main_color"))
						.setTitle("Expiration de votre objectif")
						.setDescription(`Votre objectif de ${goal.value} ${
							GoalUnitTranslate[goal.unit]
						} a expiré, vous pouvez en définir un nouveau avec \`/set_goal\``)
				]});
				goal.destroy();
			} else if (goal.endValue <= data[goal.unit] ) {
				await msg.channel.send({ embeds: [
					new MessageEmbed()
						.setColor(config.getData("/main_color"))
						.setTitle("Objectif atteint !")
						.setDescription(`<@${msg.author.id}>, vous avez atteint votre objectif de ${goal.value} ${
							GoalUnitTranslate[goal.unit]
						} !`)
				]});
				goal.destroy();
			}
		}
	}
}