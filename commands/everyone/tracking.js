import ChartJSImage from 'chart.js-image';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { createHash } from "crypto";

export const data = new SlashCommandBuilder()
	.setName('tracking')
	.setDescription('Affiche des statistiques sur vous')
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
                    .addChoice('2 ans', '2 ans')
                    .addChoice('3 ans', '3 ans')
            )
    )
export async function execute(interaction, config, db) {
	await interaction.deferReply();
    let opt = {
        subcommand: interaction.options.getSubcommand()
    };
    let user_hash = createHash('md5').update(interaction.user.id).digest('hex');
    if (!(user_hash in db.getData("/users"))) {
        log(`Création de l'utilisateur ${interaction.user.username} à partir de /tracking`);
        db.push("/users/" + user_hash, {"config": {"reminders": {"on": {}}, "tracking": {"reports": false}}});
    }
    let db_user = db.getData(`/users/${user_hash}`);

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
                case '2 ans':
                    min_date = new Date(cur.getTime() - (cur.getMonth() * 30 * 24 * 60 * 60 * 1000) - (365.25 * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 2 * 365.25 * 24 * 60 * 60 * 1000);
                    break;
                case '3 ans':
                    min_date = new Date(cur.getTime() - (cur.getMonth() * 30 * 24 * 60 * 60 * 1000) - (2 * 365.25 * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 3 * 365.25 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    min_date = new Date(cur.getTime() - (cur.getDay() * 24 * 60 * 60 * 1000));
                    max_date = new Date(min_date.getTime() + 6 * 24 * 60 * 60 * 1000);
                    break;
            }
            for (let i = min_date; i.getDate() <= max_date.getDate(); i.setDate(i.getDate() + 1)) {
                reports_in_days[i.getFullYear() + "-" + i.getMonth() + "-" + i.getDate()] = {long: 0, short: 0};
            }
            for (let event of db_user.tracking) {
                let event_date = new Date(event.timestamp);
                console.debug(event_date.getTime(), min_date.getTime(), max_date.getTime());
                if (!(event_date.getTime() >= min_date.getTime() && event_date.getTime() <= max_date.getTime())) continue;
                console.debug(0);
                let day = event_date.getFullYear() + "-" + event_date.getMonth() + "-" + event_date.getDate();
                if (event.type == "long_report") {
                    console.debug(1);
                    reports_in_days[day].long++;
                } else if (event.type == "short_report") {
                    console.debug(2);
                    reports_in_days[day].short++;
                }
            }
            let line_chart = await ChartJSImage().chart({
                type: 'line',
                data: {
                    labels: Object.keys(reports_in_days),
                    datasets: [
                        {
                            label: 'Rapports longs',
                            data: Object.values(reports_in_days).map(x => x.long)
                        },
                        {
                            label: 'Rapports courts',
                            data: Object.values(reports_in_days).map(x => x.short)
                        }
                    ]
                }
            }) // Line chart
              .backgroundColor("#2F3135") // Color of embed background
              .width(500) // 500px
              .height(300); // 300px
        
        let embed = new MessageEmbed()
            .setTitle(`Statistiques les rapports de ${interaction.user.username}`)
            .setImage(line_chart.toURL())
        await interaction.editReply({ embeds: [embed] });
    }
}