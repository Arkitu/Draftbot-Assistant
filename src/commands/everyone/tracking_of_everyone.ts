import ChartJSImage from 'chart.js-image';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { unlink } from 'fs';
import { log_error } from "../../bot.js";
import { property_data } from './tracking.js';
import { CommandInteraction } from 'discord.js';

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
    await interaction.deferReply();
    let opt = {
        subcommand: interaction.options.getSubcommand(),
        category: interaction.options.getString('category') || 'all',
        duration: interaction.options.getString('duration')
    };

    let type: ["long_report", "short_report"] | ["long_report"] | ["short_report"];
    switch (opt.category) {
        case "all": 
            type = ["long_report", "short_report"]
            break;
        case "events":
            type = ["long_report"]
            break;
        case "mini-events":
            type = ["short_report"]
            break;
    }

    let allUsersTrackings = await db.models.Tracking.findAll({
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
            let trackings: {
                [key: string]: {
                    long: number,
                    short: number
                }
            } = {};
            for (let i = new Date(min_date.getTime()); i.getTime() <= max_date.getTime(); i.setDate(i.getDate() + 1)) {
                trackings[i.getTime()] = {long: 0, short: 0};
            }
            for (let tracking of allUsersTrackings) {
                if (["long_report", "short_report"].includes(tracking.type)) {
                    let tracking_date = tracking.createdAt;
                    if (tracking_date.getTime() >= min_date.getTime() && tracking_date.getTime() <= max_date.getTime()) {
                        tracking_date.setHours(0, 0, 0, 0);
                        if (tracking.type == "long_report") {
                            trackings[tracking_date.getTime()].long++;
                        } else {
                            trackings[tracking_date.getTime()].short++;
                        }
                    }
                }
            }
            let datasets = [];
            if (opt.category == "all" || opt.category == "trackings") {
                let data = [];
                for (let tracking in trackings) {
                    if (trackings[tracking].long == 0 && trackings[tracking].short == 0) continue;
                    data.push({
                        x: parseInt(tracking),
                        y: trackings[tracking].long
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
            if (opt.category == "all" || opt.category == "mini-trackings") {
                let data = [];
                for (let tracking in trackings) {
                    if (trackings[tracking].long == 0 && trackings[tracking].short == 0 && parseInt(tracking) != min_date.getTime() && parseInt(tracking) != max_date.getTime()) continue;
                    data.push({
                        x: parseInt(tracking),
                        y: trackings[tracking].short
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
            })()} de tout le monde`)
            .setImage(`attachment://${interaction.user.id}_chart.png`);
        await interaction.editReply({ embeds: [embed], files: [`${botDirString}/../temp/${interaction.user.id}_chart.png`] });
        unlink(`${botDirString}/../temp/${interaction.user.id}_chart.png`, (err) => { if (err) log_error(err.toString()); });
    }
}