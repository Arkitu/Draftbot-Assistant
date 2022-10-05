import { Message } from 'discord.js';
import { proposeAutoReminder } from '../bot';
import { TimeStringUtils } from '../Utils';

export class RemindListeners {	
	static async event(message: Message) {
		if (!(new RegExp(constants.getData("/regex/bigEventIssueStart")).test(message.content))) return;
		const user = await db.models.User.findByPk(message.content.slice(message.content.indexOf("<@") + 2, message.content.indexOf(">"))) // get the user
		if (!user) return;
		if (!user.config.reminders.auto_proposition.events) return;
	
		const timeBetweenMinievents: number = constants.getData("/times/betweenMinievents");
		// A time for the possibility where 1) no alte/no time lost 2) the player wants to skip alte / losetime with shop right after
		const reminders = [timeBetweenMinievents];
	
		if (message.content.includes(constants.getData("/regex/timeLostBigEvent"))) {
			const splicedMessage = message.content.split(" | ");
	
			reminders.push(timeBetweenMinievents
				+ TimeStringUtils.getTimeLostByString(
					//The time lost is always just before the text
					splicedMessage[splicedMessage.length - 2]
						.slice(26, -2)
				)
			);
		}
		//If it ends by an emoji, there's an alteration
		if (message.content.endsWith(constants.getData("/regex/emojiEnd"))) {
			const splitedMessage = message.content.split(" ");
			reminders.push(timeBetweenMinievents
				+ constants.getData(`/effectDurations/${splitedMessage[splitedMessage.length - 1]}`)
			);
		}
			
		await proposeAutoReminder(message, reminders, user);
	};
	
	static async miniEvent(message: Message) {
		if (!message.embeds[0].author.name.startsWith(constants.getData("/regex/minieventAuthorStart"))) return;
		const userID = message.interaction ? message.interaction.user.id
			: message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
		const user = await db.models.User.findByPk(userID);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.minievents) return;
		let text = message.embeds[0].description;
		if (constants.getData("/regex/twoMessagesMinieventsEmojis").some((emoji: string) => text.startsWith(emoji))) return;
		for (const obj of constants.getData("/regex/possibleTwoMessagesMinievents")) {
			if (text.startsWith(obj.emoji) && text.endsWith(obj.endsWith)) return;
		}
	
		const timeBetweenMinievents: number = constants.getData("/times/betweenMinievents");
		const reminders = [timeBetweenMinievents];
	
		if (new RegExp(constants.getData("/regex/hasLoseTimeEmoji")).test(text)) {
			let loseTimeEmojiPosition = text.indexOf(constants.getData("/regex/hasLoseTimeEmoji").split("|")[0]);
			if (loseTimeEmojiPosition === -1) {
				loseTimeEmojiPosition = text.indexOf(constants.getData("/regex/hasLoseTimeEmoji").split("|")[1])
			}
			reminders.push(timeBetweenMinievents
				+ TimeStringUtils.getTimeLostByString(text
					//Between the end of the '**' and the start of the emoji
					.slice(text.indexOf("**") + 2, loseTimeEmojiPosition)
					.replace("**", "")
				)
			);
		}
	
		//Remove 2nd text.endsWith for the next draftbot update, for now there's a typo on bigBadEvent's head bandage sentence
		if (text.endsWith(constants.getData("/regex/emojiEnd") || text.endsWith(":head_bandage:."))) {
			const splitedMessage = text.split(" ");
			if (constants.getData("/effectDurations").hasOwnProperty(splitedMessage[splitedMessage.length - 1])) {
				reminders.push(timeBetweenMinievents
					+ constants.getData(`/effectDurations/${splitedMessage[splitedMessage.length - 1]}`));
			}
		}
	
		await proposeAutoReminder(message, reminders, user);
	};
	
	static async guildDaily(message: Message) {
		if (message.interaction.commandName !== "guilddaily") return;
	
		const user = await db.models.User.findByPk(message.interaction.user.id);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.guilddaily) return;
	
	
		await proposeAutoReminder(message, [constants.getData("/times/betweenGuildDailies")], user);
	}
	
	static async daily(message: Message) {
		if (message.interaction.commandName !== "daily") return;
	
		const user = await db.models.User.findByPk(message.interaction.user.id);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.daily) return;
	
		await proposeAutoReminder(message, [constants.getData("/times/betweenDailies")], user);
	}
	
	static async petFeed(message: Message) {
		// Get rid of first part of /petfeed, which could be canceled
		if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFeedAuthorEnd"))) return;

		const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
		const user = await db.models.User.findByPk(userID);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.petfeed) return;
	
		const reminders: number[] = [];
		constants.getData("/pets/" + message.embeds[0].description.replace("**", "").split(" ")[0])
			.forEach((rarity: number) => {
				reminders.push(rarity * constants.getData("/times/betweenBasicPetFeeds"))
			});
	
		await proposeAutoReminder(message, reminders, user);
	}
	
	static async petFree(message: Message) {
		// Just like petFeed
		if (!message.embeds[0].author.name.endsWith(constants.getData("/regex/petFreeAuthorEnd"))) return;
		if (message.interaction) return;
	
		const userID = message.embeds[0].author.iconURL.split("avatars/")[1].split("/")[0];
		const user = await db.models.User.findByPk(userID);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.petfree) return;
	
		await proposeAutoReminder(message, [constants.getData("/times/betweenPetFrees")], user);
	}
	
	static async vote(message: Message) {
		if (message.interaction.commandName !== "vote") return;

		const user = await db.models.User.findByPk(message.interaction.user.id);
		if (!user) return;
		if (!user.config.reminders.auto_proposition.vote) return;
	
		await proposeAutoReminder(message, [constants.getData("/times/betweenVotes"), constants.getData("/times/betweenUsefulVotes")], user);
	}
	
	static async propo(message: Message) {
		const user = await db.models.User.findByPk(message.author.id)
		if (!user) return;
		const reminders = await user.getPropoReminder({
			where: {
				trigger: message.content
			}
		})
		if (!reminders.length) return;
	
		await proposeAutoReminder(message, reminders.map(r => r.duration), user)
	}
}