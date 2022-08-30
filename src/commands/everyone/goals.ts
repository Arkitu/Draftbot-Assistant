import { SlashCommandBuilder } from '@discordjs/builders';
import { ProfileData } from '../../models/Tracking.js';
import { GoalUnitTranslate } from '../../models/Goal.js';
import { MessageEmbed, Interaction, CommandInteraction, MessageActionRow, MessageButton, User as DiscordUser } from 'discord.js';


async function createGoals(page: number, discordUser: DiscordUser): Promise<{embed: MessageEmbed, components: MessageActionRow[]}> {
	const embed = new MessageEmbed()
		.setColor(config.getData("/main_color"))
		.setTitle(`Objectifs de ${discordUser.username}`)
	
	const buttons = new MessageActionRow();

	const goals = await models.Goal.findAll({
		offset: page*10,
		limit: 10,
		order: sequelize.col('end'),
		where: {
			userId: discordUser.id
		}
	});

	if (goals.length === 0) {
		embed.setDescription("Vous n'avez aucun objectifs")
		return {
			embed: embed,
			components: []
		};
	}

    const user = (await models.User.findOrCreate({
        where: {
            discordId: discordUser.id
        }
    }))[0]

    const lastProfile = (await user.$get("trackings", {
        limit: 1,
        order: [["createdAt", "DESC"]],
        where: {
            type: "profile"
        }
    }))[0]

	for (let goal of goals) {
		embed.addField(
			`${(lastProfile.data as ProfileData)[goal.unit] - goal.initValue}/${goal.value} ${GoalUnitTranslate[goal.unit]}`,
			`id: ${goal.id} | début: <t:${goal.start}:R> | fin: <t:${goal.end}:R>`
		)
	}

	if (
		goals.length > 10
		&&
		(page+1)*10 < await models.Goal.count({
			where: { userId: discordUser.id }
		}
	)) {
		buttons.addComponents(
			new MessageButton()
				.setCustomId('next_page')
				.setStyle('SECONDARY')
				.setEmoji('➡')
		);
	}
	if (page > 0) {
		buttons.addComponents(
			new MessageButton()
				.setCustomId('previous_page')
				.setStyle('SECONDARY')
				.setEmoji('⬅')
		);
	}

	const components: MessageActionRow[] = [];

	if (buttons.components.length) components.push(buttons);

	return {
		embed: embed,
		components: components
	};
}

export const data = new SlashCommandBuilder()
	.setName('goals')
	.setDescription('Renvois la liste des objectifs');
export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	let page = 0;
	let goals = await createGoals(page, interaction.user);

	await interaction.editReply({ embeds: [goals.embed], components: goals.components })

	if (goals.components) {
		let msg = await interaction.fetchReply();
		let button_listener = async (button_interaction: Interaction) => {
			if (!button_interaction.isButton()) return;
			if (button_interaction.message.id != msg.id) return;
			switch (button_interaction.customId) {
				case 'next_page':
					page++;
					break;

				case 'previous_page':
					page--;
					break;
			}
			goals = await createGoals(page, interaction.user);
			await button_interaction.update({ embeds: [goals.embed], components: goals.components });
		};
		interaction.client.on('interactionCreate', button_listener);
		setTimeout(() => {
			if (!("edit" in msg)) return;
			msg.edit({ components: []});
			interaction.client.removeListener('interactionCreate', button_listener);
		}, 300000);
	}
}