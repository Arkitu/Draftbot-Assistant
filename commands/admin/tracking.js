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
            const line_chart = await ChartJSImage().chart({
                "type": "line",
                "data": {
                  "labels": [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July"
                  ],
                  "datasets": [
                    {
                      "label": "My First dataset",
                      "borderColor": "rgb(255,+99,+132)",
                      "backgroundColor": "rgba(255,+99,+132,+.5)",
                      "data": [
                        57,
                        90,
                        11,
                        -15,
                        37,
                        -37,
                        -27
                      ]
                    },
                    {
                      "label": "My Second dataset",
                      "borderColor": "rgb(54,+162,+235)",
                      "backgroundColor": "rgba(54,+162,+235,+.5)",
                      "data": [
                        71,
                        -36,
                        -94,
                        78,
                        98,
                        65,
                        -61
                      ]
                    },
                    {
                      "label": "My Third dataset",
                      "borderColor": "rgb(75,+192,+192)",
                      "backgroundColor": "rgba(75,+192,+192,+.5)",
                      "data": [
                        48,
                        -64,
                        -61,
                        98,
                        0,
                        -39,
                        -70
                      ]
                    },
                    {
                      "label": "My Fourth dataset",
                      "borderColor": "rgb(255,+205,+86)",
                      "backgroundColor": "rgba(255,+205,+86,+.5)",
                      "data": [
                        -58,
                        88,
                        29,
                        44,
                        3,
                        78,
                        -9
                      ]
                    }
                  ]
                },
                "options": {
                  "title": {
                    "display": true,
                    "text": "Chart.js Line Chart"
                  },
                  "scales": {
                    "xAxes": [
                      {
                        "scaleLabel": {
                          "display": true,
                          "labelString": "Month"
                        }
                      }
                    ],
                    "yAxes": [
                      {
                        "stacked": true,
                        "scaleLabel": {
                          "display": true,
                          "labelString": "Value"
                        }
                      }
                    ]
                  }
                }
              }) // Line chart
              .backgroundColor('white')
              .width(500) // 500px
              .height(300); // 300px
        
        let embed = new MessageEmbed()
            .setTitle(`Statistiques les rapports de ${interaction.user.username}`)
            .setImage(line_chart.toURL())
        await interaction.editReply({ embeds: [embed] });
    }
}