import ChartJSImage from 'chart.js-image';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { unlink } from 'fs';
import { log_error } from "../../bot.js";
import { property_data } from './tracking.js';
import { CommandInteraction } from 'discord.js';
import { DB_Tracking } from '../../libs/Interfaces.js';

export const data = new SlashCommandBuilder()
	.setName('tracking_of_everyone')
	.setDescription('Affiche des statistiques sur tous les utilisateurs')
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
    )
export async function execute(interaction: CommandInteraction) {
    await ctx.interaction.deferReply();
    let opt = {
        subcommand: ctx.interaction.options.getSubcommand(),
        category: ctx.interaction.options.getString('category') || 'all',
        duration: ctx.interaction.options.getString('duration')
    };
    let all_users_tracking: DB_Tracking[] = [];
    for (let user_hash in ctx.db.getData("/users")) {
        for (let event of ctx.db.getData(`/users/${user_hash}/tracking`)) {
            all_users_tracking.push(event as DB_Tracking);
        }
    }

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
            for (let event of all_users_tracking) {
                if (["long_report", "short_report"].includes(event.type)) {
                    let event_date = new Date(event.timestamp);
                    if (event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime()) {
                        event_date.setHours(0, 0, 0, 0);
                        if (event.type == "long_report") {
                            events[event_date.getTime()].long++;
                        } else {
                            events[event_date.getTime()].short++;
                        }
                    }
                }
            }
            let datasets = [];
            if (opt.category == "all" || opt.category == "events") {
                let data = [];
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
                let data = [];
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
            let chart_opts = {
                type: 'bar',
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
            }

            chart = ChartJSImage()
                .chart(chart_opts) // Bar chart
                .backgroundColor("#2F3135") // Color of embed background
                .width("500") // 500px
                .height("300"); // 300px
            break;
        }
    }
    
    let url_chart = chart.toURL();
    if (url_chart.length < 2048) {
        let embed = new MessageEmbed()
            .setTitle(`Statistiques ${(()=>{
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de tout le monde`)
            .setImage(url_chart);
        await ctx.interaction.editReply({ embeds: [embed] });
    } else {
        await chart.toFile(`./temp/${ctx.interaction.user.id}_chart.png`);
        let embed = new MessageEmbed()
            .setTitle(`Statistiques ${(()=>{
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de tout le monde`)
            .setImage(`attachment://${ctx.interaction.user.id}_chart.png`);
        await ctx.interaction.editReply({ embeds: [embed], files: [`./temp/${ctx.interaction.user.id}_chart.png`] });
        unlink(`./temp/${ctx.interaction.user.id}_chart.png`, (err) => { if (err) log_error(err.toString()); });
    }
}