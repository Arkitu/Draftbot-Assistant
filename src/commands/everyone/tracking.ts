import ChartJSImage from 'chart.js-image';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { unlink } from 'fs';
import { log_error } from "../../bot.js";
import { CommandInteraction } from 'discord.js';
import { User } from '../../sequelize/models/user.js';
import { ProfileData } from '../../sequelize/models/tracking.js';

export var property_data: {
    [key: string]: {
        "label": string,
        "color": string
    }
} = {
    "reports/long": {
        "label": "Nbr Events",
        "color": "54,162,235"
    },
    "reports/short": {
        "label": "Nbr Mini-events",
        "color": "255,159,64"
    },
    "profile/lvl": {
        "label": "Niveau",
        "color": "255,159,64"
    },
    "profile/pv": {
        "label": "PV",
        "color": "255,0,0"
    },
    "profile/max_pv": {
        "label": "Max PV",
        "color": "128,0,0"
    },
    "profile/xp": {
        "label": "XP",
        "color": "0,255,0"
    },
    "profile/max_xp": {
        "label": "Max XP",
        "color": "0,128,0"
    },
    "profile/gold": {
        "label": "Or",
        "color": "184,134,11"
    },
    "profile/energy": {
        "label": "Energie",
        "color": "255,215,0"
    },
    "profile/max_energy": {
        "label": "Max Energie",
        "color": "218,165,32"
    },
    "profile/strenght": {
        "label": "Force",
        "color": "178,34,34"
    },
    "profile/defense": {
        "label": "Défense",
        "color": "30,144,255"
    },
    "profile/speed": {
        "label": "Vitesse",
        "color": "173,216,230"
    },
    "profile/gems": {
        "label": "Gemmes",
        "color": "102,205,170"
    },
    "profile/quest_missions_percentage": {
        "label": "Avancement des missions de quête (en %)",
        "color": "255,222,173"
    },
    "profile/rank": {
        "label": "Rang dans le classement",
        "color": "192,192,192"
    },
    "profile/rank_points": {
        "label": "Points de classement",
        "color": "112,128,144"
    }
};

export const data = new SlashCommandBuilder()
	.setName('tracking')
	.setDescription('Affiche des statistiques sur vous')
    .addSubcommand(subcmd =>
        subcmd
            .setName('reports')
            .setDescription('Affiche les statistiques sur les rapports')
            .addStringOption(opt =>
                opt
                    .setName('category')
                    .setDescription('La catégorie des statistiques')
                    .setRequired(true)
                    .addChoice('all', 'all')
                    .addChoice('events', 'events')
                    .addChoice('mini-events', 'mini-events')
            )
            .addStringOption(opt =>
                opt
                    .setName('duration')
                    .setDescription('La période des statistiques (par défaut : 1 semaine)')
                    .setRequired(false)
                    .addChoice('1 semaine', '1 semaine')
                    .addChoice('1 mois', '1 mois')
                    .addChoice('3 mois', '3 mois')
                    .addChoice('6 mois', '6 mois')
                    .addChoice('1 an', '1 an')
            )
            .addUserOption(opt =>
                opt
                    .setName('user')
                    .setDescription('L\'utilisateur dont les statistiques doivent être affichées (par defaut vous-même)')
                    .setRequired(false)
            )
            .addStringOption(opt =>
                opt
                    .setName('mode')
                    .setDescription('Le mode d\'affichage des statistiques (par défaut : battons)')
                    .setRequired(false)
                    .addChoice('battons', 'bar')
                    .addChoice('courbes', 'line')
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName('profile')
            .setDescription('Affiche les statistiques sur les profils')
            .addStringOption(opt =>
                opt
                    .setName('category')
                    .setDescription('La catégorie des statistiques')
                    .setRequired(true)
                    .addChoice('level', 'lvl')
                    .addChoice('gold', 'gold')
                    .addChoice('pv', 'pv')
                    .addChoice('max_pv', 'max_pv')
                    .addChoice('xp', 'xp')
                    .addChoice('max_xp', 'max_xp')
                    .addChoice('energy', 'energy')
                    .addChoice('max_energy', 'max_energy')
                    .addChoice('strenght', 'strenght')
                    .addChoice('defense', 'defense')
                    .addChoice('speed', 'speed')
                    .addChoice('gems', 'gems')
                    .addChoice('quest_missions', 'quest_missions_percentage')
                    .addChoice('rank', 'rank')
                    .addChoice('rank_points', 'rank_points')
            )
            .addStringOption(opt =>
                opt
                    .setName('duration')
                    .setDescription('La période des statistiques (par défaut : 1 semaine)')
                    .setRequired(false)
                    .addChoice('1 semaine', '1 semaine')
                    .addChoice('1 mois', '1 mois')
                    .addChoice('3 mois', '3 mois')
                    .addChoice('6 mois', '6 mois')
                    .addChoice('1 an', '1 an')
            )
            .addUserOption(opt =>
                opt
                    .setName('user')
                    .setDescription('L\'utilisateur dont les statistiques doivent être affichées (par defaut vous même)')
                    .setRequired(false)
            )
    )
export async function execute(interaction: CommandInteraction) {
    let opt = {
        subcommand: interaction.options.getSubcommand() as "reports" | "profile",
        category: (interaction.options.getString('category') || 'all') as "all" | "events" | "mini-events" | "lvl" | "gold" | "pv" | "max_pv" | "xp" | "max_xp" | "energy" | "max_energy" | "strenght" | "defense" | "speed" | "gems" | "quest_missions_percentage" | "rank" | "rank_points",
        duration: interaction.options.getString('duration') as "1 semaine" | "1 mois" | "3 mois" | "6 mois" | "1 an",
        user: interaction.options.getUser('user') || interaction.user,
        mode: (interaction.options.getString('mode') || 'bar') as "bar" | "line"
    };

    let user: User;

    if (opt.user.id != interaction.user.id) {
        user = await db.models.User.findByPk(opt.user.id);
        if (!user) {
            interaction.reply(":warning: Cet utilisateur n'est pas dans ma base de données");
            return;
        }
        if (!user.config.tracking.public) {
            interaction.reply(":warning: Les tracking de cet utilisateur ne sont pas publics. Tu peux lui demander de passer en public avec </config tracking switch_option:971457425842536458>");
        }
    } else {
        user = (await db.models.User.findOrCreate({
            where: {
                discordId: opt.user.id
            }
        }))[0];
    }

    await interaction.deferReply({ ephemeral: user.config.tracking.public });

    let type: ["long_report", "short_report"] | ["long_report"] | ["short_report"] | ["profile"];

    switch (opt.subcommand) {
        case "profile":
            type = ["profile"];
            break;
        case "reports":
            switch (opt.category) {
                case "all":
                    type = ["long_report", "short_report"];
                    break;
                case "events":
                    type = ["long_report"];
                    break;
                case "mini-events":
                    type = ["short_report"];
                    break;
            }
    }

    const trackings = await user.getTrackings({
        where: {
            type: type
        }
    });

    // Get min_date and max_date
    let cur = new Date();
    let min_date = new Date();
    let max_date = new Date();
    switch (opt.duration) {
        default:
        case '1 semaine':
            min_date = new Date(new Date().setDate(cur.getDate() - 7));
            max_date = new Date(cur);
            break;
        case '1 mois':
            min_date = new Date(new Date().setMonth(cur.getMonth() - 1));
            max_date = new Date(cur);
            break;
        case '3 mois':
            min_date = new Date(new Date().setMonth(cur.getMonth() - 3));
            max_date = new Date(cur);
            break;
        case '6 mois':
            min_date = new Date(new Date().setMonth(cur.getMonth() - 6));
            max_date = new Date(cur);
            break;
        case '1 an':
            min_date = new Date(new Date().setFullYear(cur.getFullYear() - 1));
            max_date = new Date(cur);
            break;
    }
    min_date.setHours(0, 0, 0, 0);
    max_date.setHours(23, 59, 59, 999);

    // Get data and create the chart
    let chart: ChartJSImage;
    switch (opt.subcommand) {
        case 'reports': {
            let events: {
                [key: string]: {
                    long: number,
                    short: number
                }
            } = {};
            for (let i = new Date(min_date.getTime()); i.getTime() <= max_date.getTime(); i.setDate(i.getDate() + 1)) {
                events[i.getTime()] = {long: 0, short: 0};
            }
            for (let event of trackings) {
                let event_date = event.createdAt as Date;
                    if (event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime()) {
                        event_date.setHours(0, 0, 0, 0);
                        if (event.type == "long_report") {
                            events[event_date.getTime()].long++;
                        } else {
                            events[event_date.getTime()].short++;
                        }
                    }
            }
            let datasets = [];
            if (opt.category == "all" || opt.category == "events") {
                let data: {
                    x: number,
                    y: number
                }[] = [];
                for (let event in events) {
                    if (events[event].long == 0 && events[event].short == 0) continue;
                    data.push({
                        x: parseInt(event),
                        y: events[event].long
                    });
                }
                datasets.push({
                    label: property_data["reports/long"].label,
                    borderColor: `rgba(${property_data["reports/long"].color}, 1)`,
                    backgroundColor: `rgba(${property_data["reports/long"].color}, 0.2)`,
                    borderWidth: 2,
                    data: data,
                });
            }
            if (opt.category == "all" || opt.category == "mini-events") {
                let data: {
                    x: number,
                    y: number
                }[] = [];
                for (let event in events) {
                    if (events[event].long == 0 && events[event].short == 0 && parseInt(event) != min_date.getTime() && parseInt(event) != max_date.getTime()) continue;
                    data.push({
                        x: parseInt(event),
                        y: events[event].short
                    });
                }
                datasets.push({
                    label: property_data["reports/short"].label,
                    borderColor: `rgba(${property_data["reports/short"].color}, 1)`,
                    backgroundColor: `rgba(${property_data["reports/short"].color}, 0.2)`,
                    borderWidth: 2,
                    data: data,
                });
            }
            chart = await ChartJSImage().chart({
                type: opt.mode,
                data: {
                    datasets: datasets
                },
                options: {
                    legend: {
                        labels: {
                            fontColor: 'white'
                        }
                    },
                    scales: {
                        x: {
                            min: min_date.getTime(),
                            max: max_date.getTime(),
                        },
                        xAxes: [{
                            type: "time",
                            time: {
                                unit: "day",
                                displayFormats: {
                                    day: "DD-MM",
                                    week: "DD-MM",
                                    month: "MM-YYYY",
                                    quarter: "MM-YYYY",
                                    year: "YYYY"
                                },
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Date"
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'value'
                            }
                        }]
                    }
                }
            }) // Bar chart
                .backgroundColor("#2F3135") // Color of embed background
                .width(500) // 500px
                .height(300); // 300px
            break;
        }
        case 'profile': {
            opt.category = opt.category as "lvl" | "gold" | "pv" | "max_pv" | "xp" | "max_xp" | "energy" | "max_energy" | "strenght" | "defense" | "speed" | "gems" | "quest_missions_percentage" | "rank" | "rank_points";
            let datasets: {
                label: string,
                borderColor: string,
                backgroundColor: string,
                data: {
                    x: number,
                    y: number
                }[]
            }[] = [{
                label: property_data["profile/" + opt.category].label,
                borderColor: `rgba(${property_data["profile/" + opt.category].color}, 1)`,
                backgroundColor: `rgba(${property_data["profile/" + opt.category].color}, 0.2)`,
                data: [],
            }];
            for (let event of trackings) {
                let event_date = event.createdAt as Date;
                if (event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime()) {
                    datasets[0].data.push({
                        x: event_date.getTime(),
                        y: (event.data as ProfileData)[opt.category]
                    });
                }
            }
            while (datasets[0].data.length > 300) {
                for (let i = 0; i < datasets[0].data.length; i++ ) {
                    datasets[0].data.splice(i, 1);
                }
            }
            if (datasets[0].data.length == 0) {
                await interaction.editReply(":warning: Je n'ai enregistré aucun évènement de ce type pour cette période.");
                return;
            }
            chart = await ChartJSImage().chart({
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    legend: {
                        labels: {
                            fontColor: 'white'
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: "time",
                            time: {
                                tooltipFormat: "DD-MM-YYYY"
                            },
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Date"
                            },
                            ticks: {
                                min: min_date.getTime(),
                                max: max_date.getTime(),
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'value'
                            }
                        }]
                    }
                }
            }) // Line chart
                .backgroundColor("#2F3135") // Color of embed background
                .width(500) // 500px
                .height(300); // 300px
            break;
        }
    }
    
    let url_chart = await chart.toURL();
    if (url_chart.length < 2048) {
        let embed = new MessageEmbed()
            .setTitle(`Statistiques ${(()=>{
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de ${opt.user.username}`)
            .setImage(url_chart);
        interaction.editReply({ embeds: [embed] });
    } else {
        await chart.toFile(`${botDirString}/../temp/${interaction.user.id}_chart.png`);
        let embed = new MessageEmbed()
            .setTitle(`Statistiques ${(()=>{
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de ${opt.user.username}`)
            .setImage(`attachment://${interaction.user.id}_chart.png`);
        await interaction.editReply({ embeds: [embed], files: [`${botDirString}/../temp/${interaction.user.id}_chart.png`] });
        unlink(`${botDirString}/../temp/${interaction.user.id}_chart.png`, (err) => { if (err) log_error(err.toString()); });
    }
}