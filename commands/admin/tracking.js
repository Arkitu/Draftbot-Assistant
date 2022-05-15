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
            for (let event of db_user.tracking) {
                if (event.type != "long_report") continue;
                let date = new Date(event.timestamp);
                let day = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
                if (!(day in reports_in_days)) {
                    reports_in_days[day] = 1;
                } else {
                    reports_in_days[day] += 1;
                }
            }
            let line_chart = await ChartJSImage().chart({
                type: 'line',
                data: {
                    datasets: [{
                        data: []
                    }]
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