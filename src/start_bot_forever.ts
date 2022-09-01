import { Monitor } from "forever-monitor";

const botDir = new URL(import.meta.url);
const botDirString = (()=>{
	let urlArray = decodeURI(botDir.pathname).split("/");
	urlArray.pop();
	return urlArray.join("/");
})()

let monitor: Monitor = new Monitor(`${botDirString}/bot.js`, {
    max: Infinity,
    silent: false
});

monitor.start();