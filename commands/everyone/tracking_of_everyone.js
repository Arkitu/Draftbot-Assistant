import ChartJSImage from 'chart.js-image';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { unlink } from 'fs';
import { log_error } from "../../bot.js";

export const data = new SlashCommandBuilder()
	.setName('tracking_of_everyone')
	.setDescription('Affiche des statistiques sur tous les utilisateurs')
    .addSubcommand(subcmd =>
        subcmd
            .setName('reports')
            .setDescription('Affiche les statistiques sur les rapports')
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
export async function execute(interaction, config, db) {
	await interaction.deferReply();
    let opt = {
        subcommand: interaction.options.getSubcommand()
    };
    let all_users_tracking = [];
    for (let user_hash in db.getData("/users")) {
        for (let event of db.getData(`/users/${user_hash}/tracking`)) {
            all_users_tracking.push(event);
        }
    }

    switch (opt.subcommand) {
        case 'reports':
            let reports_in_days = {};
            let cur = new Date();
            let min_date = new Date();
            let max_date = new Date();
            switch (interaction.options.getString('duration')) {
                case '1 semaine':
                    min_date = new Date(cur.getTime() - (cur.getDay() * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 6 * 24 * 60 * 60 * 1000);
                    break;
                case '1 mois':
                    min_date = new Date(cur.getTime() - (cur.getDate() * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case '3 mois':
                    min_date = new Date(cur.getTime() - (cur.getDate() * 24 * 60 * 60 * 1000) - (2 * 30 * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);
                    break;
                case '6 mois':
                    min_date = new Date(cur.getTime() - (cur.getDate() * 24 * 60 * 60 * 1000) - (5 * 30 * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
                    break;
                case '1 an':
                    min_date = new Date(cur.getTime() - (cur.getMonth() * 30 * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 365.25 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    min_date = new Date(cur.getTime() - (cur.getDay() * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 6 * 24 * 60 * 60 * 1000);
                    break;
            }
            for (let i = new Date(min_date.getTime()); i.getTime() <= max_date.getTime(); i.setTime(i.getTime() + 24 * 60 * 60 * 1000)) {
                reports_in_days[i.getFullYear() + "-" + i.getMonth() + "-" + i.getDate()] = {long: 0, short: 0};
            }
            for (let event of all_users_tracking) {
                let event_date = new Date(event.timestamp);
                if (!(event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime())) continue;
                let day = event_date.getFullYear() + "-" + event_date.getMonth() + "-" + event_date.getDate();
                if (event.type == "long_report") {
                    reports_in_days[day].long++;
                } else if (event.type == "short_report") {
                    reports_in_days[day].short++;
                }
            }
            let chart = await ChartJSImage().chart({
                type: 'line',
                data: {
                    labels: Object.keys(reports_in_days),
                    datasets: [
                        {
                            label: 'Nbr Reports',
                            data: Object.values(reports_in_days).map(x => x.long),
                            fill : "origin",
                            backgroundColor: "rgba(54,162,235,0.5)",
                            borderColor: "rgba(54,162,235,1)"
                        },
                        {
                            label: 'Nbr Mini-events',
                            data: Object.values(reports_in_days).map(x => x.short),
                            fill : "origin",
                            backgroundColor: "rgba(255,159,64,0.5)",
                            borderColor: "rgba(255,159,64,1)"
                        },
                    ]
                },
                options: {
                    legend: {
                        labels: {
                            fontColor: 'white'
                        }
                    }
                }
            }) // Line chart
                .backgroundColor("#2F3135") // Color of embed background
                .width(500) // 500px
                .height(300); // 300px
            
            let url_chart = await chart.toURL();

            if (url_chart.length < 2048) {
                let embed = new MessageEmbed()
                    .setTitle(`Statistiques les rapports de tous les utilisateurs`)
                    .setImage(url_chart);
                await interaction.editReply({ embeds: [embed] });
            } else {
                await chart.toFile(`./temporary_files/everyone_chart.png`);
                let embed = new MessageEmbed()
                    .setTitle(`Statistiques les rapports de tous les utilisateurs`)
                    .setImage(`attachment://everyone_chart.png`);
                await interaction.editReply({ embeds: [embed], files: [`./temporary_files/everyone_chart.png`] });
                unlink(`./temporary_files/everyone_chart.png`, (err) => {if (err) log_error(err);});
            }
            break;
    }
}