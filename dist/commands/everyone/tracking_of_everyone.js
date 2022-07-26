"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const chart_js_image_1 = require("chart.js-image");
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const bot_js_1 = require("../../bot.js");
const tracking_js_1 = require("./tracking.js");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('tracking_of_everyone')
    .setDescription('Affiche des statistiques sur tous les utilisateurs')
    .addSubcommand(subcmd => subcmd
    .setName('reports')
    .setDescription('Affiche les statistiques sur les rapports')
    .addStringOption(opt => opt
    .setName('category')
    .setDescription('La catégorie des statistiques')
    .setRequired(true)
    .addChoice('all', 'all')
    .addChoice('events', 'events')
    .addChoice('mini-events', 'mini-events'))
    .addStringOption(opt => opt
    .setName('duration')
    .setDescription('La période des statistiques (par défaut : 1 semaine)')
    .setRequired(false)
    .addChoice('1 semaine', '1 semaine')
    .addChoice('1 mois', '1 mois')
    .addChoice('3 mois', '3 mois')
    .addChoice('6 mois', '6 mois')
    .addChoice('1 an', '1 an')));
function execute(interaction, config, db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply();
        let opt = {
            subcommand: interaction.options.getSubcommand(),
            category: interaction.options.getString('category') || 'all',
            duration: interaction.options.getString('duration')
        };
        let all_users_tracking = [];
        for (let user_hash in db.getData("/users")) {
            for (let event of db.getData(`/users/${user_hash}/tracking`)) {
                all_users_tracking.push(event);
            }
        }
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
        let chart;
        switch (opt.subcommand) {
            case 'reports': {
                let events = {};
                for (let i = new Date(min_date.getTime()); i.getTime() <= max_date.getTime(); i.setDate(i.getDate() + 1)) {
                    events[i.getTime()] = { long: 0, short: 0 };
                }
                for (let event of all_users_tracking) {
                    if (["long_report", "short_report"].includes(event.type)) {
                        let event_date = new Date(event.timestamp);
                        if (event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime()) {
                            event_date.setHours(0, 0, 0, 0);
                            if (event.type == "long_report") {
                                events[event_date.getTime()].long++;
                            }
                            else {
                                events[event_date.getTime()].short++;
                            }
                        }
                    }
                }
                let datasets = [];
                if (opt.category == "all" || opt.category == "events") {
                    let data = [];
                    for (let event in events) {
                        if (events[event].long == 0 && events[event].short == 0)
                            continue;
                        data.push({
                            x: parseInt(event),
                            y: events[event].long
                        });
                    }
                    datasets.push({
                        label: tracking_js_1.property_data["reports/long"].label,
                        borderColor: `rgba(${tracking_js_1.property_data["reports/long"].color}, 1)`,
                        backgroundColor: `rgba(${tracking_js_1.property_data["reports/long"].color}, 0.2)`,
                        borderWidth: 2,
                        data: data,
                    });
                }
                if (opt.category == "all" || opt.category == "mini-events") {
                    let data = [];
                    for (let event in events) {
                        if (events[event].long == 0 && events[event].short == 0 && parseInt(event) != min_date.getTime() && parseInt(event) != max_date.getTime())
                            continue;
                        data.push({
                            x: parseInt(event),
                            y: events[event].short
                        });
                    }
                    datasets.push({
                        label: tracking_js_1.property_data["reports/short"].label,
                        borderColor: `rgba(${tracking_js_1.property_data["reports/short"].color}, 1)`,
                        backgroundColor: `rgba(${tracking_js_1.property_data["reports/short"].color}, 0.2)`,
                        borderWidth: 2,
                        data: data,
                    });
                }
                chart = yield (0, chart_js_image_1.default)().chart({
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
                })
                    .backgroundColor("#2F3135")
                    .width(500)
                    .height(300);
                break;
            }
        }
        let url_chart = yield chart.toURL();
        if (url_chart.length < 2048) {
            let embed = new discord_js_1.MessageEmbed()
                .setTitle(`Statistiques ${(() => {
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de tout le monde`)
                .setImage(url_chart);
            yield interaction.editReply({ embeds: [embed] });
        }
        else {
            yield chart.toFile(`./temporary_files/${interaction.user.id}_chart.png`);
            let embed = new discord_js_1.MessageEmbed()
                .setTitle(`Statistiques ${(() => {
                switch (opt.subcommand) {
                    case 'reports':
                        return "des reports";
                    case 'profile':
                        return "du profil";
                }
            })()} de tout le monde`)
                .setImage(`attachment://${interaction.user.id}_chart.png`);
            yield interaction.editReply({ embeds: [embed], files: [`./temporary_files/${interaction.user.id}_chart.png`] });
            (0, fs_1.unlink)(`./temporary_files/${interaction.user.id}_chart.png`, (err) => { if (err)
                (0, bot_js_1.log_error)(err); });
        }
    });
}
exports.execute = execute;
