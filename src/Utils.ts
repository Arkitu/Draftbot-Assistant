export class TimeStringUtils {
	static getTimeLostByString(timeDisplayed: string): number {
		const splitedDisplay = timeDisplayed.split(" H");
		const lastElement = splitedDisplay[splitedDisplay.length - 1].replace(" Min", "");
	
		const hours = splitedDisplay.length > 1 ? parseInt(splitedDisplay[0]) : 0;
		// If there are only hours, the list is ["number", ""]
		const minutes = lastElement !== "" ? parseInt(lastElement) : 0;
		return hours * 3600000 + minutes * 60000;
	}

	static generateTimeDisplay(milliseconds: number): string {
		let seconds = Math.ceil(milliseconds / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		seconds %= 60;
		minutes %= 60;
		hours %= 24;
	
		let arrayTime: string[] = [];
		if (days > 0) {
			arrayTime.push(days + "j");
		}
		if (hours > 0) {
			arrayTime.push(hours + "h");
		}
		if (minutes > 0) {
			arrayTime.push(minutes + "min");
		}
		if (seconds > 0) {
			arrayTime.push(seconds + "s");
		}
	
		return arrayTime.join(" ");
	}
}

export class LogUtils {
	static async log_error(msg: string) {
		LogUtils.log(`ERROR: ${msg}`);
		await (await client.users.fetch(config.getData("/creator_id"))).send(`:warning: ERROR: ${msg}`);
	}

	static log(msg: string) {
		const datetime: string = new Date().toLocaleString();
		console.log(`[${datetime}] ${msg}`);
	}
}